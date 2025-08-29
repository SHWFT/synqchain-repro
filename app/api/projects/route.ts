import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/lib/server/repos/projects.repo";

const projectsRepo = new ProjectsRepo();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const result = projectsRepo.list({ page, pageSize, search, status });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
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

    const project = projectsRepo.create(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
