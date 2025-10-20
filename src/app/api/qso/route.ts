import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";

// GET /api/qso - Get user's QSO records
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const qsos = await QSO.find({ 
      userId: session.user.email,
      deletedAt: null 
    }).sort({
      createdAt: -1,
    });

    // Transform MongoDB documents to match frontend format
    const records = qsos.map((qso) => ({
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

    console.log("QSO POST: Connecting to database...");
    await connectToDatabase();
    console.log("QSO POST: Database connected");

    const qsoData = {
      userId: session.user.email,
      ...data,
    };
    console.log("QSO POST: Creating QSO with data:", qsoData);

    const newQSO = new QSO(qsoData);
    console.log("QSO POST: QSO model created, saving...");

    const savedQSO = await newQSO.save();
    console.log("QSO POST: QSO saved with ID:", savedQSO._id.toString());

    // Transform to match frontend format
    const record = {
      id: savedQSO._id.toString(),
      datetime: savedQSO.datetime,
      callsign: savedQSO.callsign,
      name: savedQSO.name,
      freq: savedQSO.freq,
      mode: savedQSO.mode,
      txPower: savedQSO.txPower,
      rstSent: savedQSO.rstSent,
      rstReceived: savedQSO.rstReceived,
      qth: savedQSO.qth,
      notes: savedQSO.notes,
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
