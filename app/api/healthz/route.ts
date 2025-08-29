import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";

export async function GET() {
  try {
    // Check database connection
    const db = getDB();
    
    // Simple query to verify DB is working
    const result = db.prepare("SELECT 1 as test").get() as { test: number };
    
    if (result.test !== 1) {
      throw new Error("Database query failed");
    }

    return NextResponse.json({
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: "healthy",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: "unhealthy",
        },
      },
      { status: 503 }
    );
  }
}
