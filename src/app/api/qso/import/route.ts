import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";
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

    // Connect to database
    await connectToDatabase();

    // Fetch existing QSO records for this user to check for duplicates
    const existingRecords = await QSO.find({ userId: session.user.email });

    // Helper function to check if record is duplicate
    // Only checks callsign, frequency, and datetime
    const isDuplicate = (record: any) => {
      return existingRecords.some((existing) => {
        // Convert both datetimes to ISO strings for comparison
        const existingDate = new Date(existing.datetime).toISOString();
        const recordDate = new Date(record.datetime).toISOString();

        // Compare case-insensitively for callsign
        return existingDate === recordDate &&
          existing.callsign.toUpperCase() === record.callsign.toUpperCase() &&
          existing.freq === record.freq;
      });
    };

    // Save records to database with user's email
    const savedRecords = [];
    const failedRecords = [];
    let skippedDuplicates = 0;

    if (!importResult.records || importResult.records.length === 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        failed: 0,
        failedCallsigns: [],
        errorMessages: ["Dosyada içe aktarılacak geçerli kayıt bulunamadı"],
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

        const qso = new QSO({
          userId: session.user.email,
          datetime: record.datetime,
          callsign: record.callsign,
          name: record.name,
          freq: record.freq,
          mode: record.mode,
          txPower: record.txPower,
          rstSent: record.rstSent,
          rstReceived: record.rstReceived,
          qth: record.qth,
          notes: record.notes,
        });

        await qso.save();
        savedRecords.push({
          id: qso._id.toString(),
          datetime: qso.datetime,
          callsign: qso.callsign,
          name: qso.name,
          freq: qso.freq,
          mode: qso.mode,
          txPower: qso.txPower,
          rstSent: qso.rstSent,
          rstReceived: qso.rstReceived,
          qth: qso.qth,
          notes: qso.notes,
        });
      } catch (error) {
        console.error("Failed to save QSO record:", error);
        failedRecords.push(record.callsign);
      }
    }

    // Prepare error messages
    const errorMessages = [];
    if (skippedDuplicates > 0) {
      errorMessages.push(`${skippedDuplicates} tekrarlayan kayıt atlandı`);
    }
    if (failedRecords.length > 0) {
      errorMessages.push(`${failedRecords.length} kayıt kaydedilemedi`);
    }

    return NextResponse.json({
      success: true,
      imported: savedRecords.length,
      failed: failedRecords.length,
      failedCallsigns: failedRecords,
      errorMessages: errorMessages.length > 0 ? errorMessages : undefined,
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
