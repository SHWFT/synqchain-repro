import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

export interface Project {
  id: string;
  name: string;
  client: string;
  baselineSpend: number;
  savingsSecured: number;
  status: "planned" | "in-progress" | "completed" | "on-hold";
  owner: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  loadProjects: () => void;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

const defaultProjects: Project[] = [
  {
    id: "proj-1",
    name: "Manufacturing Equipment Procurement",
    client: "Acme Manufacturing",
    baselineSpend: 200000,
    savingsSecured: 25000,
    status: "in-progress",
    owner: "John Smith",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "proj-2",
    name: "IT Infrastructure Upgrade",
    client: "TechCorp Inc",
    baselineSpend: 225000,
    savingsSecured: 10200,
    status: "in-progress",
    owner: "Sarah Johnson",
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-10T16:45:00Z",
  },
];

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,

      loadProjects: () => {
        set({ isLoading: true });
        // Simulate API call
        setTimeout(() => {
          const existingProjects = get().projects;
          if (existingProjects.length === 0) {
            set({ projects: defaultProjects, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }, 100);
      },

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      getProject: (id) => {
        return get().projects.find((project) => project.id === id);
      },
    }),
    {
      name: "synqchain-projects",
    }
  )
);