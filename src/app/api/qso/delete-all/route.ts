import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";

// DELETE /api/qso/delete-all - Delete all QSO records for the authenticated user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Delete all QSO records for this user
    const result = await QSO.deleteMany({ userId: session.user.email });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} QSO kaydı silindi`,
    });
  } catch (error) {
    console.error("Error deleting QSO records:", error);
    return NextResponse.json(
      { error: "Failed to delete QSO records" },
      { status: 500 },
    );
  }
}
