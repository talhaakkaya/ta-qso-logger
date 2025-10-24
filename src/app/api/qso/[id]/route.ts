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

// PUT /api/qso/[id] - Update a QSO record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // First, verify the QSO exists and belongs to the user
    const existingQSO = await prisma.qso.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        logbook: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!existingQSO || existingQSO.logbook.profile.email !== session.user.email) {
      return NextResponse.json(
        { error: "QSO record not found" },
        { status: 404 },
      );
    }

    // Prepare update data with type conversions
    const updateData: any = {};
    if (updates.datetime) updateData.qsoDate = parseDatetimeAsUTC(updates.datetime);
    if (updates.callsign !== undefined) updateData.callsign = updates.callsign;
    if (updates.name !== undefined) updateData.name = updates.name || null;
    if (updates.freq !== undefined) updateData.freq = updates.freq ? parseFloat(updates.freq) : null;
    if (updates.mode !== undefined) updateData.mode = updates.mode || null;
    if (updates.txPower !== undefined) updateData.txPwr = updates.txPower ? parseInt(updates.txPower) : null;
    if (updates.rstSent !== undefined) updateData.rstSent = updates.rstSent || null;
    if (updates.rstReceived !== undefined) updateData.rstRcvd = updates.rstReceived || null;
    if (updates.qth !== undefined) updateData.qth = updates.qth || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    const updatedQSO = await prisma.qso.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Transform to match frontend format
    return NextResponse.json({
      id: updatedQSO.id,
      datetime: updatedQSO.qsoDate,
      callsign: updatedQSO.callsign,
      name: updatedQSO.name || "",
      freq: updatedQSO.freq ? parseFloat(updatedQSO.freq.toString()) : 0,
      mode: updatedQSO.mode || "",
      txPower: updatedQSO.txPwr || 0,
      rstSent: updatedQSO.rstSent || "",
      rstReceived: updatedQSO.rstRcvd || "",
      qth: updatedQSO.qth || "",
      notes: updatedQSO.notes || "",
    });
  } catch (error) {
    console.error("Error updating QSO record:", error);
    return NextResponse.json(
      { error: "Failed to update QSO record" },
      { status: 500 },
    );
  }
}

// DELETE /api/qso/[id] - Soft delete a QSO record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First, verify the QSO exists and belongs to the user
    const existingQSO = await prisma.qso.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        logbook: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!existingQSO || existingQSO.logbook.profile.email !== session.user.email) {
      return NextResponse.json(
        { error: "QSO record not found" },
        { status: 404 },
      );
    }

    // Soft delete the QSO
    await prisma.qso.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "QSO record deleted" });
  } catch (error) {
    console.error("Error deleting QSO record:", error);
    return NextResponse.json(
      { error: "Failed to delete QSO record" },
      { status: 500 },
    );
  }
}
