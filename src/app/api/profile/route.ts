import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/user-helpers";

// GET /api/profile - Get user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create profile
    const profile = await getOrCreateProfile({
      email: session.user.email,
      name: session.user.name,
    });

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      callsign: profile.callsign || "",
      name: profile.name || "",
      gridSquare: profile.gridSquare || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT /api/profile - Update user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Get or create profile first
    const existingProfile = await getOrCreateProfile({
      email: session.user.email,
      name: session.user.name,
    });

    // Prepare update data
    const updateData: any = {};
    if (data.callsign !== undefined) {
      updateData.callsign = data.callsign.trim().toUpperCase() || null;
    }
    if (data.name !== undefined) {
      updateData.name = data.name.trim() || null;
    }
    if (data.gridSquare !== undefined) {
      updateData.gridSquare = data.gridSquare.trim().toUpperCase() || null;
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: existingProfile.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedProfile.id,
      email: updatedProfile.email,
      callsign: updatedProfile.callsign || "",
      name: updatedProfile.name || "",
      gridSquare: updatedProfile.gridSquare || "",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
