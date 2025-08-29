import { NextRequest, NextResponse } from "next/server";
import { PORepo } from "@/lib/server/repos/po.repo";

const poRepo = new PORepo();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);

    const result = poRepo.getEvents(params.id, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting purchase order events:", error);
    return NextResponse.json(
      { error: "Failed to get purchase order events" },
      { status: 500 }
    );
  }
}
