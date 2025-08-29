"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectsStore } from "@/state/projects.store";
import { useActivityStore } from "@/state/activity.store";
import { Project } from "@/erps/mapping/common.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client: z.string().min(1, "Client name is required"),
  baselineSpend: z.number().min(0, "Baseline spend must be positive"),
  savingsSecured: z.number().min(0, "Savings secured must be positive"),
  status: z.enum(["planned", "in-progress", "completed", "on-hold"]),
  owner: z.string().min(1, "Project owner is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { projects, loadProjects, addProject, updateProject, deleteProject } = useProjectsStore();
  const { addActivity } = useActivityStore();

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      client: "",
      baselineSpend: 0,
      savingsSecured: 0,
      status: "planned",
      owner: "Demo User",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onSubmit = (data: ProjectForm) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
      addActivity({
        type: "project_created",
        title: "Project updated",
        description: `${data.name} project was updated`,
        userId: "demo-user-1",
      });
      toast.success("Project updated successfully");
    } else {
      addProject(data);
      addActivity({
        type: "project_created",
        title: "New project created",
        description: `${data.name} project was created`,
        userId: "demo-user-1",
      });
      toast.success("Project created successfully");
    }
    
    setDialogOpen(false);
    setEditingProject(null);
    form.reset();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      client: project.client,
      baselineSpend: project.baselineSpend,
      savingsSecured: project.savingsSecured,
      status: project.status,
      owner: project.owner,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
      toast.success("Project deleted successfully");
    }
  };

  const handleNewProject = () => {
    setEditingProject(null);
    form.reset();
    setDialogOpen(true);
  };

  const getStatusVariant = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "default";
      case "planned":
        return "warning";
      case "on-hold":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your procurement projects and track savings
          </p>
        </div>
        <Button onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Savings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>{formatCurrency(project.baselineSpend)}</TableCell>
                <TableCell>{formatCurrency(project.savingsSecured)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{project.owner}</TableCell>
                <TableCell>
                  {project.endDate ? formatDate(project.endDate) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject 
                ? "Update the project details below."
                : "Add a new procurement project to track savings and progress."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter project name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  {...form.register("client")}
                  placeholder="Enter client name"
                />
                {form.formState.errors.client && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.client.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baselineSpend">Baseline Spend ($)</Label>
                <Input
                  {...form.register("baselineSpend", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                />
                {form.formState.errors.baselineSpend && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.baselineSpend.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="savingsSecured">Savings Secured ($)</Label>
                <Input
                  {...form.register("savingsSecured", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                />
                {form.formState.errors.savingsSecured && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.savingsSecured.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select {...form.register("status")}>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  {...form.register("owner")}
                  placeholder="Enter project owner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  {...form.register("startDate")}
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  {...form.register("endDate")}
                  type="date"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}






