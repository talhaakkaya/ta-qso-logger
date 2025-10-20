import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";
import adifService from "@/services/adifService";

// GET /api/qso/export - Export user's QSO records as ADIF
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

    const { filename, blob } = adifService.exportToADIF(records);
    const adifContent = await blob.text();

    return new NextResponse(adifContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting QSO records:", error);
    return NextResponse.json(
      { error: "Failed to export QSO records" },
      { status: 500 },
    );
  }
}
