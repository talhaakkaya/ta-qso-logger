import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Get public statistics (no auth required)
export async function GET() {
  try {
    // Get total number of QSO records
    const totalQSOs = await prisma.qso.count();

    // Get total number of profiles (users)
    const totalUsers = await prisma.profile.count();

    // Get top 10 most used frequencies
    const topFrequencies = await prisma.$queryRaw<{ freq: string; count: bigint }[]>`
      SELECT freq::text, COUNT(*) as count
      FROM qsos
      WHERE deleted_at IS NULL AND freq IS NOT NULL
      GROUP BY freq
      ORDER BY count DESC
      LIMIT 10
    `;

    // Convert bigint to number for JSON serialization
    const formattedFrequencies = topFrequencies.map(item => ({
      freq: item.freq,
      count: Number(item.count)
    }));

    return NextResponse.json(
      {
        totalUsers,
        totalQSOs,
        topFrequencies: formattedFrequencies,
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
