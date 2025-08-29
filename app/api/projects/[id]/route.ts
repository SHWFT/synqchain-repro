import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/lib/server/repos/projects.repo";

const projectsRepo = new ProjectsRepo();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = projectsRepo.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
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
    
    const project = projectsRepo.update(params.id, body);
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = projectsRepo.remove(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
