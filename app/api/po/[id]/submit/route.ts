import { NextRequest, NextResponse } from "next/server";
import { PORepo } from "@/lib/server/repos/po.repo";

const poRepo = new PORepo();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const notes = body.notes;
    
    const po = poRepo.submit(params.id, notes);
    
    if (!po) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(po);
  } catch (error) {
    console.error("Error submitting purchase order:", error);
    
    if (error instanceof Error && error.message.includes("Only DRAFT")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to submit purchase order" },
      { status: 500 }
    );
  }
}
