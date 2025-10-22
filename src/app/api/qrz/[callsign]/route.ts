import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { QRZResponse } from "@/types/qrz.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callsign: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { callsign } = await params;

    if (!callsign || !callsign.trim()) {
      return NextResponse.json(
        { error: "Callsign is required" },
        { status: 400 }
      );
    }

    // Get QRZ API base URL from environment
    const qrzApiBaseUrl = process.env.QRZ_API_BASE_URL;
    if (!qrzApiBaseUrl) {
      return NextResponse.json(
        { error: "QRZ API is not configured" },
        { status: 500 }
      );
    }

    // Fetch from QRZ API
    const qrzUrl = `${qrzApiBaseUrl}/callsigns/${callsign.toUpperCase()}`;
    const qrzResponse = await fetch(qrzUrl, {
      headers: {
        accept: "application/json",
      },
    });

    if (!qrzResponse.ok) {
      if (qrzResponse.status === 404) {
        return NextResponse.json(
          { error: "Callsign not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch from QRZ API" },
        { status: qrzResponse.status }
      );
    }

    const data: QRZResponse = await qrzResponse.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("QRZ API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
