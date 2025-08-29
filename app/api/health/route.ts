import { NextRequest, NextResponse } from "next/server";
import { getERPAdapter } from "@/erps/adapters";

export async function GET(request: NextRequest) {
  try {
    const adapter = getERPAdapter();
    const adapterHealth = await adapter.health();
    
    return NextResponse.json({
      ok: true,
      adapter: {
        id: adapter.id,
        name: adapter.name,
        health: adapterHealth
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        error: {
          code: "HEALTH_CHECK_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error
        }
      },
      { status: 500 }
    );
  }
}






