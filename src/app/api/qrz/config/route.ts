import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if QRZ API is configured
    const isConfigured = !!process.env.QRZ_API_BASE_URL;

    return NextResponse.json({
      enabled: isConfigured,
    });
  } catch (error) {
    console.error("QRZ config check error:", error);
    return NextResponse.json(
      { enabled: false },
      { status: 200 }
    );
  }
}
