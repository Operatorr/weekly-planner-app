import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/types";

// ── Keys ─────────────────────────────────────────────────────────

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

// ── Fetchers ─────────────────────────────────────────────────────

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

// ── Query hooks ──────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: fetchProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

// ── Mutations ────────────────────────────────────────────────────

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json() as Promise<Project>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateProjectInput & { id: string }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json() as Promise<Project>;
    },
    onMutate: async ({ id, ...input }) => {
      await qc.cancelQueries({ queryKey: projectKeys.lists() });

      const previous = qc.getQueryData<Project[]>(projectKeys.lists());

      qc.setQueryData<Project[]>(projectKeys.lists(), (old) =>
        old?.map((p) =>
          p.id === id
            ? { ...p, ...input, updated_at: new Date().toISOString() }
            : p,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(projectKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: projectKeys.lists() });

      const previous = qc.getQueryData<Project[]>(projectKeys.lists());

      qc.setQueryData<Project[]>(projectKeys.lists(), (old) =>
        old?.filter((p) => p.id !== id),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(projectKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
