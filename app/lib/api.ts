/**
 * API Service Layer
 * Centralized fetch wrapper with Clerk authentication
 */

import type { Task, Project, ChecklistItem } from "./types";

// In development, use relative paths (Vite proxy handles /api)
// In production (Vercel), the API routes are at the same origin
const API_BASE = "/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAuthToken(): Promise<string | null> {
  // Clerk stores the session token in a cookie named __session
  // For API calls, we can use the Clerk frontend SDK to get a fresh token
  // This function should be called from within a component that has access to useAuth
  // We'll use a different approach - pass the token from the hook
  return null;
}

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Include cookies for session auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(error.error || error.message || "Request failed", response.status);
  }

  return response.json();
}

// ── Tasks API ─────────────────────────────────────────────────────

export async function fetchTasks(token: string): Promise<Task[]> {
  return apiFetch<Task[]>("/tasks", { token });
}

export async function createTask(
  token: string,
  data: {
    title: string;
    description?: string;
    project_id?: string | null;
    due_date?: string | null;
    is_someday?: boolean;
    sort_order?: number;
  }
): Promise<Task> {
  return apiFetch<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateTask(
  token: string,
  id: string,
  data: {
    title?: string;
    description?: string | null;
    project_id?: string;
    due_date?: string | null;
    is_someday?: boolean;
    sort_order?: number;
  }
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteTask(token: string, id: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function completeTask(
  token: string,
  id: string,
  completed: boolean
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
    token,
  });
}

export async function reorderTasks(
  token: string,
  tasks: { id: string; sort_order: number }[]
): Promise<void> {
  await apiFetch<{ success: boolean }>("/tasks/reorder", {
    method: "POST",
    body: JSON.stringify({ tasks }),
    token,
  });
}

// ── Projects API ──────────────────────────────────────────────────

export async function fetchProjects(token: string): Promise<Project[]> {
  return apiFetch<Project[]>("/projects", { token });
}

export async function createProject(
  token: string,
  data: { name: string; color?: string }
): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateProject(
  token: string,
  id: string,
  data: { name?: string; color?: string }
): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteProject(token: string, id: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/projects/${id}`, {
    method: "DELETE",
    token,
  });
}

// ── Checklist API ─────────────────────────────────────────────────

export async function fetchChecklist(
  token: string,
  taskId: string
): Promise<ChecklistItem[]> {
  return apiFetch<ChecklistItem[]>(`/checklist?task_id=${taskId}`, { token });
}

export async function addChecklistItem(
  token: string,
  data: { task_id: string; title: string }
): Promise<ChecklistItem> {
  return apiFetch<ChecklistItem>("/checklist", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateChecklistItem(
  token: string,
  id: string,
  data: { title?: string; is_completed?: boolean }
): Promise<ChecklistItem> {
  return apiFetch<ChecklistItem>(`/checklist/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteChecklistItem(
  token: string,
  id: string
): Promise<void> {
  await apiFetch<{ success: boolean }>(`/checklist/${id}`, {
    method: "DELETE",
    token,
  });
}

// ── Filters API ──────────────────────────────────────────────────

export async function fetchFilters(token: string): Promise<Record<string, unknown>[]> {
  return apiFetch<Record<string, unknown>[]>("/filters", { token });
}

export async function createFilter(
  token: string,
  data: { name: string; config: Record<string, unknown> }
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/filters", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateFilter(
  token: string,
  id: string,
  data: { name?: string; config?: Record<string, unknown> }
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/filters?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteFilter(token: string, id: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/filters?id=${id}`, {
    method: "DELETE",
    token,
  });
}
