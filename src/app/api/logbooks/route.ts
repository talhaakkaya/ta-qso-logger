import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile, getOrCreateDefaultLogbook } from "@/lib/user-helpers";

// GET /api/logbooks - Get user's logbooks with QSO counts
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

    // Ensure default logbook exists
    await getOrCreateDefaultLogbook(profile.id);

    // Fetch all logbooks for this profile with QSO counts
    const logbooks = await prisma.logbook.findMany({
      where: {
        profileId: profile.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            qsos: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: [
        { isDefault: "desc" }, // Default logbook first
        { createdAt: "asc" },  // Then by creation date
      ],
    });

    // Transform to response format
    const response = logbooks.map((logbook) => ({
      id: logbook.id,
      name: logbook.name,
      isDefault: logbook.isDefault,
      qsoCount: logbook._count.qsos,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching logbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch logbooks" },
      { status: 500 },
    );
  }
}

// POST /api/logbooks - Create a new logbook
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Validate name
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Logbook name is required" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: "Logbook name cannot be empty" },
        { status: 400 },
      );
    }

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Logbook name is too long (max 100 characters)" },
        { status: 400 },
      );
    }

    // Get or create profile
    const profile = await getOrCreateProfile({
      email: session.user.email,
      name: session.user.name,
    });

    // Check if logbook name already exists for this profile
    const existingLogbook = await prisma.logbook.findFirst({
      where: {
        profileId: profile.id,
        name: trimmedName,
        deletedAt: null,
      },
    });

    if (existingLogbook) {
      return NextResponse.json(
        { error: "A logbook with this name already exists" },
        { status: 422 },
      );
    }

    // Create new logbook (isDefault is always false for user-created logbooks)
    const newLogbook = await prisma.logbook.create({
      data: {
        profileId: profile.id,
        name: trimmedName,
        isDefault: false,
      },
    });

    // Return logbook in the same format as GET endpoint
    return NextResponse.json(
      {
        id: newLogbook.id,
        name: newLogbook.name,
        isDefault: newLogbook.isDefault,
        qsoCount: 0,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating logbook:", error);
    return NextResponse.json(
      { error: "Failed to create logbook" },
      { status: 500 },
    );
  }
}
