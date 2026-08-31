import { NextResponse } from "next/server";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        connected: false,
        message: "DATABASE_URL is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    await getPrisma().participant.findFirst({ select: { id: true } });

    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        connected: false,
        message: "The PostgreSQL database could not be reached.",
      },
      { status: 503 }
    );
  }
}
