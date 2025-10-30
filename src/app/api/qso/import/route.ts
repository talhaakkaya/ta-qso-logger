import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDefaultLogbookId } from "@/lib/user-helpers";
import adifService from "@/services/adifService";

// POST /api/qso/import - Import QSO records from ADIF file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requestedLogbookId = formData.get("logbookId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith(".adi") && !file.name.endsWith(".adif")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an ADIF file (.adi or .adif)" },
        { status: 400 },
      );
    }

    // Parse ADIF file
    const importResult = await adifService.importFromADIF(file);

    if (!importResult.success) {
      return NextResponse.json(
        {
          error: "Failed to import ADIF file",
          details: importResult.errorMessages,
        },
        { status: 400 },
      );
    }

    // Use provided logbookId or get user's default logbook
    const logbookId = requestedLogbookId || await getUserDefaultLogbookId({
      email: session.user.email,
      name: session.user.name,
    });

    // Fetch existing QSO records for this user's logbook to check for duplicates
    const existingRecords = await prisma.qso.findMany({
      where: { logbookId },
    });

    // Helper function to check if record is duplicate
    // Only checks callsign, frequency, and datetime
    const isDuplicate = (record: any) => {
      return existingRecords.some((existing) => {
        // Convert both datetimes to ISO strings for comparison
        const existingDate = new Date(existing.qsoDate).toISOString();
        const recordDate = new Date(record.datetime).toISOString();

        // Compare case-insensitively for callsign
        const existingFreq = existing.freq ? parseFloat(existing.freq.toString()) : 0;
        const recordFreq = record.freq ? parseFloat(record.freq) : 0;

        return existingDate === recordDate &&
          existing.callsign.toUpperCase() === record.callsign.toUpperCase() &&
          existingFreq === recordFreq;
      });
    };

    // Save records to database with user's logbook
    const savedRecords = [];
    const failedRecords = [];
    let skippedDuplicates = 0;

    if (!importResult.records || importResult.records.length === 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        failed: 0,
        skipped: 0,
        records: [],
      });
    }

    for (const record of importResult.records) {
      try {
        // Skip if duplicate
        if (isDuplicate(record)) {
          skippedDuplicates++;
          continue;
        }

        const qso = await prisma.qso.create({
          data: {
            logbookId,
            qsoDate: new Date(record.datetime),
            callsign: record.callsign,
            name: record.name || null,
            freq: record.freq || null,
            mode: record.mode || null,
            txPwr: record.txPower || null,
            rstSent: record.rstSent || null,
            rstRcvd: record.rstReceived || null,
            qth: record.qth || null,
            notes: record.notes || null,
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
        failedRecords.push(record.callsign);
      }
    }

    return NextResponse.json({
      success: true,
      imported: savedRecords.length,
      skipped: skippedDuplicates,
      failed: failedRecords.length,
      failedCallsigns: failedRecords,
      records: savedRecords,
    });
  } catch (error) {
    console.error("Error importing QSO records:", error);
    return NextResponse.json(
      { error: "Failed to import QSO records" },
      { status: 500 },
    );
  }
}
