import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import * as api from "@/lib/api";
import type { Project } from "@/lib/types";
import { toast } from "sonner";

export function useProjects() {
  const { getToken } = useAuth();

  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.fetchProjects(token);
    },
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.createProject(token, data);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<Project[]>(["projects"]);

      const optimistic: Project = {
        id: `temp-${Date.now()}`,
        user_id: "",
        name: data.name,
        color: data.color || "#999999",
        sort_order: (previous?.length ?? 0) + 1,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Project[]>(["projects"], (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (err: Error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
      toast.error("Failed to create project", { description: err.message });
    },
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(["projects"], (old = []) =>
        old.map((p) => (p.id.startsWith("temp-") ? newProject : p))
      );
      toast.success("Project created", { description: newProject.name });
    },
  });
}

export function useUpdateProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<Project[]>(["projects"]);

      queryClient.setQueryData<Project[]>(["projects"], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
      toast.error("Failed to update project", { description: err.message });
    },
  });
}

export function useDeleteProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.deleteProject(token, id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<Project[]>(["projects"]);

      queryClient.setQueryData<Project[]>(["projects"], (old = []) =>
        old.filter((p) => p.id !== id)
      );

      return { previous };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
      toast.error("Failed to delete project", { description: err.message });
    },
    onSuccess: () => {
      toast.success("Project deleted");
    },
  });
}
