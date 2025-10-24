import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDefaultLogbookId } from "@/lib/user-helpers";

// Helper function to parse datetime ensuring UTC interpretation
const parseDatetimeAsUTC = (datetime: string): Date => {
  // If already has timezone indicator, use as-is
  if (datetime.includes('Z') || datetime.includes('+') || datetime.match(/-\d{2}:\d{2}$/)) {
    return new Date(datetime);
  }
  // Otherwise, append 'Z' to force UTC interpretation
  return new Date(datetime + 'Z');
};

// GET /api/qso - Get user's QSO records
// Optional query param: ?logbookId=xxx (defaults to user's default logbook)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get logbookId from query params or use default
    const { searchParams } = new URL(request.url);
    const requestedLogbookId = searchParams.get("logbookId");

    const logbookId = requestedLogbookId || await getUserDefaultLogbookId({
      email: session.user.email,
      name: session.user.name,
    });

    const qsos = await prisma.qso.findMany({
      where: {
        logbookId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to match frontend format
    const records = qsos.map((qso) => ({
      id: qso.id,
      datetime: qso.qsoDate,
      callsign: qso.callsign,
      name: qso.name || "",
      freq: qso.freq ? parseFloat(qso.freq.toString()) : 0,
      mode: qso.mode || "",
      txPower: qso.txPwr || 0,
      rstSent: qso.rstSent || "",
      rstReceived: qso.rstRcvd || "",
      qth: qso.qth || "",
      notes: qso.notes || "",
    }));

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching QSO records:", error);
    return NextResponse.json(
      { error: "Failed to fetch QSO records" },
      { status: 500 },
    );
  }
}

// POST /api/qso - Create a new QSO record
export async function POST(request: NextRequest) {
  try {
    console.log("QSO POST: Starting request...");

    const session = await auth();
    console.log(
      "QSO POST: Session:",
      session ? "Found" : "Not found",
      session?.user?.email,
    );

    if (!session?.user?.email) {
      console.log("QSO POST: No session or email, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("QSO POST: Request data:", data);

    // Get logbookId from request body or use default
    const logbookId = data.logbookId || await getUserDefaultLogbookId({
      email: session.user.email,
      name: session.user.name,
    });

    const qsoData = {
      logbookId,
      qsoDate: parseDatetimeAsUTC(data.datetime),
      callsign: data.callsign,
      name: data.name || null,
      freq: data.freq ? parseFloat(data.freq) : null,
      mode: data.mode || null,
      txPwr: data.txPower ? parseInt(data.txPower) : null,
      rstSent: data.rstSent || null,
      rstRcvd: data.rstReceived || null,
      qth: data.qth || null,
      notes: data.notes || null,
    };
    console.log("QSO POST: Creating QSO with data:", qsoData);

    const savedQSO = await prisma.qso.create({
      data: qsoData,
    });
    console.log("QSO POST: QSO saved with ID:", savedQSO.id);

    // Transform to match frontend format
    const record = {
      id: savedQSO.id,
      datetime: savedQSO.qsoDate,
      callsign: savedQSO.callsign,
      name: savedQSO.name || "",
      freq: savedQSO.freq ? parseFloat(savedQSO.freq.toString()) : 0,
      mode: savedQSO.mode || "",
      txPower: savedQSO.txPwr || 0,
      rstSent: savedQSO.rstSent || "",
      rstReceived: savedQSO.rstRcvd || "",
      qth: savedQSO.qth || "",
      notes: savedQSO.notes || "",
    };

    console.log("QSO POST: Returning record:", record);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("QSO POST: Error creating QSO record:", error);
    return NextResponse.json(
      {
        error: "Failed to create QSO record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
