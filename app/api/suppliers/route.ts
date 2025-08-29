import { NextRequest, NextResponse } from "next/server";
import { SuppliersRepo } from "@/lib/server/repos/suppliers.repo";

const suppliersRepo = new SuppliersRepo();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const search = url.searchParams.get("search") || undefined;

    const result = suppliersRepo.list({ page, pageSize, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing suppliers:", error);
    return NextResponse.json(
      { error: "Failed to list suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const supplier = suppliersRepo.create(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
