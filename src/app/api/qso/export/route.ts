import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDefaultLogbookId } from "@/lib/user-helpers";
import adifService from "@/services/adifService";

// GET /api/qso/export - Export user's QSO records as ADIF
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

    // Get logbook details for filename
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      select: { name: true },
    });

    // Get user's profile for station callsign
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
      select: { callsign: true },
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
    }));

    const { blob } = adifService.exportToADIF(records, logbook?.name, profile?.callsign || undefined);
    const adifContent = await blob.text();

    // Include logbook name in filename
    const sanitizedLogbookName = (logbook?.name || 'QSO')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `qso-export-${sanitizedLogbookName}-${dateStr}.adi`;

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
