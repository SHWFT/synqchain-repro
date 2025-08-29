import { create } from "zustand";
import { getItem, setItem, clearAll } from "@/lib/storage";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  profile: {
    name: string;
    email: string;
    role: string;
  };

  // Actions
  loadSettings: () => void;
  setTheme: (theme: Theme) => void;
  updateProfile: (profile: Partial<SettingsState["profile"]>) => void;
  resetDemoData: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: "system",
  profile: {
    name: "Demo User",
    email: "demo@demo.com", 
    role: "Admin",
  },

  loadSettings: () => {
    const theme = getItem<Theme>("theme", "system");
    const profile = getItem("profile", {
      name: "Demo User",
      email: "demo@demo.com",
      role: "Admin",
    });
    
    set({ theme, profile });
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  },

  setTheme: (theme) => {
    setItem("theme", theme);
    set({ theme });
    
    // Apply theme immediately
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  },

  updateProfile: (updates) => {
    const newProfile = { ...get().profile, ...updates };
    setItem("profile", newProfile);
    set({ profile: newProfile });
  },

  resetDemoData: () => {
    clearAll();
    // Reload the page to reset all stores
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  },
}));






