import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import QSO from "@/models/QSO";

// GET /api/stats - Get public statistics (no auth required)
export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();

    // Get total number of QSO records
    const totalQSOs = await QSO.countDocuments();

    // Get total unique users
    const uniqueUsers = await QSO.distinct("userId");
    const totalUsers = uniqueUsers.length;

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
