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
    
    const po = poRepo.approve(params.id, notes);
    
    if (!po) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(po);
  } catch (error) {
    console.error("Error approving purchase order:", error);
    
    if (error instanceof Error && error.message.includes("Only PENDING_APPROVAL")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to approve purchase order" },
      { status: 500 }
    );
  }
}
