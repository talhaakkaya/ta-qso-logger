import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDefaultLogbookId } from "@/lib/user-helpers";
import { parseDateTime } from "@/utils/dateParser";

// POST /api/qso/import/csv - Import QSO records from CSV file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const columnMappingStr = formData.get("columnMapping") as string;
    const requestedLogbookId = formData.get("logbookId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a CSV file (.csv)" },
        { status: 400 },
      );
    }

    if (!columnMappingStr) {
      return NextResponse.json(
        { error: "Column mapping is required" },
        { status: 400 },
      );
    }

    const columnMapping = JSON.parse(columnMappingStr);

    // Use provided logbookId or get user's default logbook
    const logbookId = requestedLogbookId || await getUserDefaultLogbookId({
      email: session.user.email,
      name: session.user.name,
    });

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must contain at least header and one data row" },
        { status: 400 },
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      // Simple CSV parsing (doesn't handle quoted commas)
      return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });

    // Create field mapping
    const fieldToIndex: Record<string, number> = {};
    headers.forEach((header, index) => {
      const field = columnMapping[header];
      if (field && field !== "skip") {
        fieldToIndex[field] = index;
      }
    });

    // Fetch existing QSO records for this user's logbook to check for duplicates
    const existingRecords = await prisma.qso.findMany({
      where: { logbookId },
    });

    // Helper function to check if record is duplicate
    const isDuplicate = (callsign: string, datetime: string, freq: number) => {
      return existingRecords.some((existing) => {
        const existingDate = new Date(existing.qsoDate).toISOString();
        const recordDate = new Date(datetime).toISOString();
        const existingFreq = existing.freq ? parseFloat(existing.freq.toString()) : 0;

        return existingDate === recordDate &&
          existing.callsign.toUpperCase() === callsign.toUpperCase() &&
          existingFreq === freq;
      });
    };

    // Process rows
    const savedRecords = [];
    let skippedDuplicates = 0;
    let failedCount = 0;

    for (const row of rows) {
      try {
        // Parse callsign
        const callsign = fieldToIndex.callsign !== undefined
          ? row[fieldToIndex.callsign]?.trim() || ""
          : "";

        if (!callsign) {
          failedCount++;
          continue;
        }

        // Parse datetime
        let datetime = "";
        if (fieldToIndex.datetime !== undefined) {
          const datetimeStr = row[fieldToIndex.datetime]?.trim() || "";
          if (!datetimeStr) {
            failedCount++;
            continue;
          }
          datetime = parseDateTime(datetimeStr) || "";
        } else if (fieldToIndex.date !== undefined && fieldToIndex.time !== undefined) {
          const dateStr = row[fieldToIndex.date]?.trim() || "";
          const timeStr = row[fieldToIndex.time]?.trim() || "";
          if (!dateStr || !timeStr) {
            failedCount++;
            continue;
          }
          datetime = parseDateTime(dateStr, timeStr) || "";
        } else {
          failedCount++;
          continue;
        }

        if (!datetime) {
          failedCount++;
          continue;
        }

        // Parse optional fields
        const name = fieldToIndex.name !== undefined ? row[fieldToIndex.name]?.trim() || "" : "";
        const freqStr = fieldToIndex.freq !== undefined ? row[fieldToIndex.freq]?.trim() : "";
        const freq = freqStr ? parseFloat(freqStr) : 0;
        const mode = fieldToIndex.mode !== undefined ? row[fieldToIndex.mode]?.trim() || "" : "";
        const txPowerStr = fieldToIndex.txPower !== undefined ? row[fieldToIndex.txPower]?.trim() : "";
        const txPower = txPowerStr ? parseFloat(txPowerStr) : 0;
        const rstSent = fieldToIndex.rstSent !== undefined ? row[fieldToIndex.rstSent]?.trim() || "" : "";
        const rstReceived = fieldToIndex.rstReceived !== undefined ? row[fieldToIndex.rstReceived]?.trim() || "" : "";
        const qth = fieldToIndex.qth !== undefined ? row[fieldToIndex.qth]?.trim() || "" : "";
        const notes = fieldToIndex.notes !== undefined ? row[fieldToIndex.notes]?.trim() || "" : "";

        // Check for duplicates
        if (isDuplicate(callsign, datetime, freq)) {
          skippedDuplicates++;
          continue;
        }

        // Create QSO record
        const qso = await prisma.qso.create({
          data: {
            logbookId,
            qsoDate: new Date(datetime),
            callsign,
            name: name || null,
            freq: freq || null,
            mode: mode || null,
            txPwr: txPower || null,
            rstSent: rstSent || null,
            rstRcvd: rstReceived || null,
            qth: qth || null,
            notes: notes || null,
          },
        });

        savedRecords.push({
          id: qso.id,
          datetime: qso.qsoDate.toISOString(),
          callsign: qso.callsign,
          name: qso.name || "",
          freq: qso.freq ? parseFloat(qso.freq.toString()) : 0,
          mode: qso.mode || "",
          txPower: qso.txPwr || 0,
          rstSent: qso.rstSent || "",
          rstReceived: qso.rstRcvd || "",
          qth: qso.qth || "",
          notes: qso.notes || "",
        });
      } catch (error) {
        console.error("Failed to save QSO record:", error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      imported: savedRecords.length,
      skipped: skippedDuplicates,
      failed: failedCount,
      records: savedRecords,
    });
  } catch (error) {
    console.error("Error importing CSV records:", error);
    return NextResponse.json(
      { error: "Failed to import CSV records" },
      { status: 500 },
    );
  }
}
