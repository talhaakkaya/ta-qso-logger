import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Get public statistics (no auth required)
export async function GET() {
  try {
    // Get total number of QSO records
    const totalQSOs = await prisma.qso.count();

    // Get total number of profiles (users)
    const totalUsers = await prisma.profile.count();

    return NextResponse.json(
      {
        totalUsers,
        totalQSOs,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
