import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";

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

    await connectToDatabase();

    const updatedQSO = await QSO.findOneAndUpdate(
      { _id: id, userId: session.user.email, deletedAt: null },
      updates,
      { new: true },
    );

    if (!updatedQSO) {
      return NextResponse.json(
        { error: "QSO record not found" },
        { status: 404 },
      );
    }

    // Transform to match frontend format
    const record = {
      id: updatedQSO._id.toString(),
      datetime: updatedQSO.datetime,
      callsign: updatedQSO.callsign,
      name: updatedQSO.name,
      freq: updatedQSO.freq,
      mode: updatedQSO.mode,
      txPower: updatedQSO.txPower,
      rstSent: updatedQSO.rstSent,
      rstReceived: updatedQSO.rstReceived,
      qth: updatedQSO.qth,
      notes: updatedQSO.notes,
    };

    return NextResponse.json(record);
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

    await connectToDatabase();

    const deletedQSO = await QSO.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.email,
        deletedAt: null,
      },
      {
        deletedAt: new Date(),
      },
      { new: true },
    );

    if (!deletedQSO) {
      return NextResponse.json(
        { error: "QSO record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "QSO record deleted" });
  } catch (error) {
    console.error("Error deleting QSO record:", error);
    return NextResponse.json(
      { error: "Failed to delete QSO record" },
      { status: 500 },
    );
  }
}
