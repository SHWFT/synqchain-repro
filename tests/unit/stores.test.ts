import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProjectsStore } from "@/state/projects.store";
import { useSuppliersStore } from "@/state/suppliers.store";
import { useAuthStore } from "@/state/auth.store";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Projects Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useProjectsStore.setState({
      projects: [],
      isLoading: false,
      error: null,
    });
  });

  it("should add a new project", () => {
    const store = useProjectsStore.getState();
    
    store.addProject({
      name: "Test Project",
      client: "Test Client",
      baselineSpend: 100000,
      savingsSecured: 10000,
      status: "planned",
      owner: "Test Owner",
    });

    const projects = useProjectsStore.getState().projects;
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("Test Project");
    expect(projects[0]).toHaveProperty("id");
  });

  it("should update an existing project", () => {
    const store = useProjectsStore.getState();
    
    // Add a project first
    store.addProject({
      name: "Test Project",
      client: "Test Client",
      baselineSpend: 100000,
      savingsSecured: 10000,
      status: "planned",
      owner: "Test Owner",
    });

    const projectId = useProjectsStore.getState().projects[0].id;
    
    // Update the project
    store.updateProject(projectId, {
      status: "in-progress",
      savingsSecured: 15000,
    });

    const updatedProject = useProjectsStore.getState().projects[0];
    expect(updatedProject.status).toBe("in-progress");
    expect(updatedProject.savingsSecured).toBe(15000);
    expect(updatedProject.name).toBe("Test Project"); // Unchanged
  });

  it("should delete a project", () => {
    const store = useProjectsStore.getState();
    
    // Add projects
    store.addProject({
      name: "Project 1",
      client: "Client 1",
      baselineSpend: 100000,
      savingsSecured: 10000,
      status: "planned",
      owner: "Owner 1",
    });
    
    store.addProject({
      name: "Project 2",
      client: "Client 2",
      baselineSpend: 200000,
      savingsSecured: 20000,
      status: "in-progress",
      owner: "Owner 2",
    });

    expect(useProjectsStore.getState().projects).toHaveLength(2);

    const projectId = useProjectsStore.getState().projects[0].id;
    store.deleteProject(projectId);

    const remainingProjects = useProjectsStore.getState().projects;
    expect(remainingProjects).toHaveLength(1);
    expect(remainingProjects[0].name).toBe("Project 2");
  });
});

describe("Suppliers Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSuppliersStore.setState({
      suppliers: [],
      isLoading: false,
      error: null,
    });
  });

  it("should add a new supplier", () => {
    const store = useSuppliersStore.getState();
    
    store.addSupplier({
      name: "Test Supplier",
      category: "Technology",
      region: "North America",
      currency: "USD",
      status: "active",
    });

    const suppliers = useSuppliersStore.getState().suppliers;
    expect(suppliers).toHaveLength(1);
    expect(suppliers[0].name).toBe("Test Supplier");
    expect(suppliers[0]).toHaveProperty("id");
    expect(suppliers[0]).toHaveProperty("createdAt");
    expect(suppliers[0]).toHaveProperty("updatedAt");
  });

  it("should update supplier timestamps on modification", () => {
    const store = useSuppliersStore.getState();
    
    // Add supplier
    store.addSupplier({
      name: "Test Supplier",
      category: "Technology",
      region: "North America",
      currency: "USD",
      status: "active",
    });

    const supplier = useSuppliersStore.getState().suppliers[0];
    const originalUpdatedAt = supplier.updatedAt;

    // Wait a bit and update
    setTimeout(() => {
      store.updateSupplier(supplier.id, { status: "inactive" });
      
      const updatedSupplier = useSuppliersStore.getState().suppliers[0];
      expect(updatedSupplier.status).toBe("inactive");
      expect(updatedSupplier.updatedAt).not.toBe(originalUpdatedAt);
    }, 10);
  });
});

describe("Auth Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      session: null,
      isLoading: false,
      error: null,
    });
  });

  it("should handle demo login", () => {
    const store = useAuthStore.getState();
    
    store.loginAsDemo();

    const session = useAuthStore.getState().session;
    expect(session).not.toBeNull();
    expect(session?.user.email).toBe("demo@demo.com");
    expect(session?.user.name).toBe("Demo User");
    expect(session?.token).toContain("demo-token");
  });

  it("should handle logout", () => {
    const store = useAuthStore.getState();
    
    // Login first
    store.loginAsDemo();
    expect(useAuthStore.getState().session).not.toBeNull();

    // Logout
    store.logout();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("should handle login errors", async () => {
    const store = useAuthStore.getState();
    
    await store.login({
      email: "wrong@email.com",
      password: "wrongpassword",
    });

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.error).toContain("Invalid credentials");
    expect(state.isLoading).toBe(false);
  });

  it("should clear errors", () => {
    const store = useAuthStore.getState();
    
    // Set an error state
    useAuthStore.setState({ error: "Test error" });
    expect(useAuthStore.getState().error).toBe("Test error");

    // Clear error
    store.clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});






