import { NextRequest, NextResponse } from "next/server";
import { PORepo } from "@/lib/server/repos/po.repo";

const poRepo = new PORepo();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const po = poRepo.findById(params.id);
    
    if (!po) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(po);
  } catch (error) {
    console.error("Error getting purchase order:", error);
    return NextResponse.json(
      { error: "Failed to get purchase order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const po = poRepo.update(params.id, body);
    
    if (!po) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(po);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = poRepo.remove(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase order" },
      { status: 500 }
    );
  }
}
