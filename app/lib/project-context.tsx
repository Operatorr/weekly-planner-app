import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Project } from "@/lib/types";
import * as api from "@/lib/api";

// ── Context value ───────────────────────────────────────────────

interface ProjectContextValue {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  createProject: (data: { name: string; color?: string }) => Promise<void>;
  updateProject: (id: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}

// ── Provider ────────────────────────────────────────────────────

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.fetchProjects(token);
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.createProject(token, data);
    },
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(["projects"], (old = []) => [
        ...old,
        newProject,
      ]);
      toast.success("Project created", { description: newProject.name });
    },
    onError: (error: Error) => {
      toast.error("Failed to create project", { description: error.message });
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; color?: string };
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.updateProject(token, id, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(["projects"], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p))
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to update project", { description: error.message });
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.deleteProject(token, id);
      return id;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<Project[]>(["projects"]);
      queryClient.setQueryData<Project[]>(["projects"], (old = []) =>
        old.filter((p) => p.id !== id)
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
      toast.error("Failed to delete project", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Project deleted");
    },
  });

  const value: ProjectContextValue = {
    projects,
    isLoading,
    error: error as Error | null,
    createProject: async (data) => {
      await createMutation.mutateAsync(data);
    },
    updateProject: async (id, data) => {
      await updateMutation.mutateAsync({ id, data });
    },
    deleteProject: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
