import { NextRequest, NextResponse } from "next/server";
import { PORepo } from "@/lib/server/repos/po.repo";

const poRepo = new PORepo();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const status = url.searchParams.get("status") || undefined;
    const supplierId = url.searchParams.get("supplierId") || undefined;

    const result = poRepo.list({ 
      page, 
      pageSize, 
      status: status as any, 
      supplierId 
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to list purchase orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.number) {
      return NextResponse.json(
        { error: "PO number is required" },
        { status: 400 }
      );
    }

    const po = poRepo.create(body);
    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
