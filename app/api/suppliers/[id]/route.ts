import { NextRequest, NextResponse } from "next/server";
import { SuppliersRepo } from "@/lib/server/repos/suppliers.repo";

const suppliersRepo = new SuppliersRepo();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = suppliersRepo.findById(params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error getting supplier:", error);
    return NextResponse.json(
      { error: "Failed to get supplier" },
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
    
    const supplier = suppliersRepo.update(params.id, body);
    
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = suppliersRepo.remove(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
