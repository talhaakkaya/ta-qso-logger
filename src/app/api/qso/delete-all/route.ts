import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDefaultLogbookId } from "@/lib/user-helpers";

// DELETE /api/qso/delete-all - Delete all QSO records for the authenticated user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
      include: {
        logbooks: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all logbook IDs for this user
    const logbookIds = profile.logbooks.map((lb) => lb.id);

    // Delete all QSO records for all user's logbooks (hard delete, not soft)
    const result = await prisma.qso.deleteMany({
      where: {
        logbookId: { in: logbookIds },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error deleting QSO records:", error);
    return NextResponse.json(
      { success: false, deletedCount: 0 },
      { status: 500 },
    );
  }
}
