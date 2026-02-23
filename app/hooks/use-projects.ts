import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockProjects, type Project } from "@/lib/mock-data";

// For now, returns mock data. Once T02 + T04 are wired, swap to real API calls.
async function fetchProjects(): Promise<Project[]> {
  // TODO(T02/T04): Replace with real API call:
  //   const res = await fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } });
  //   return res.json();
  return mockProjects;
}

async function createProjectApi(name: string): Promise<Project> {
  // TODO(T04): Replace with real API call:
  //   const res = await fetch("/api/projects", { method: "POST", body: JSON.stringify({ name }) });
  //   return res.json();
  const colors = ["#D4644A", "#4A90D9", "#6BBF59", "#D4A44A", "#9B59B6", "#E67E22"];
  return {
    id: `proj-${Date.now()}`,
    name,
    color: colors[Math.floor(Math.random() * colors.length)],
    taskCount: 0,
  };
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createProjectApi(name),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<Project[]>(["projects"]);

      const optimistic: Project = {
        id: `temp-${Date.now()}`,
        name,
        color: "#999",
        taskCount: 0,
      };

      queryClient.setQueryData<Project[]>(["projects"], (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _name, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
