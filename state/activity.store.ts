import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

export interface Activity {
  id: string;
  type: "project" | "supplier" | "system" | "user";
  description: string;
  timestamp: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
}

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  loadActivities: () => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
}

const defaultActivities: Activity[] = [
  {
    id: "act-1",
    type: "project",
    description: "Manufacturing Equipment Procurement project updated with new savings target",
    timestamp: "2024-02-15T14:30:00Z",
    userId: "demo-user-1",
    entityId: "proj-1",
    entityType: "project",
  },
  {
    id: "act-2",
    type: "supplier",
    description: "New supplier TechSource Global added to the platform",
    timestamp: "2024-02-14T11:20:00Z",
    userId: "demo-user-1",
    entityId: "supp-2",
    entityType: "supplier",
  },
  {
    id: "act-3",
    type: "system",
    description: "ERP integration health check completed successfully",
    timestamp: "2024-02-14T09:15:00Z",
    entityType: "system",
  },
  {
    id: "act-4",
    type: "project",
    description: "IT Infrastructure Upgrade project moved to in-progress status",
    timestamp: "2024-02-13T16:45:00Z",
    userId: "demo-user-1",
    entityId: "proj-2",
    entityType: "project",
  },
  {
    id: "act-5",
    type: "user",
    description: "Demo User logged into the system",
    timestamp: "2024-02-13T08:00:00Z",
    userId: "demo-user-1",
    entityType: "user",
  },
];

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      isLoading: false,

      loadActivities: () => {
        set({ isLoading: true });
        // Simulate API call
        setTimeout(() => {
          const existingActivities = get().activities;
          if (existingActivities.length === 0) {
            set({ activities: defaultActivities, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }, 100);
      },

      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 50), // Keep only latest 50
        }));
      },

      clearActivities: () => {
        set({ activities: [] });
      },
    }),
    {
      name: "synqchain-activities",
    }
  )
);