import type {
  ProjectBacklog,
  ProjectEstimate,
  ProjectSummary,
  ProjectTask,
  ProjectWorklog,
  SignupRequest,
  SignupResponse,
} from "../types/api";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${input}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getProjects(signal?: AbortSignal) {
  return fetchJson<ProjectSummary[]>("/api/projects", { signal });
}

export function getProjectBacklog(projectId: string, signal?: AbortSignal) {
  return fetchJson<ProjectBacklog>(`/api/projects/${projectId}/backlog`, { signal });
}

export function getProjectTasks(projectId: string, signal?: AbortSignal) {
  return fetchJson<ProjectTask[]>(`/api/projects/${projectId}/tasks`, { signal });
}

export function getProjectEstimates(projectId: string, signal?: AbortSignal) {
  return fetchJson<ProjectEstimate[]>(`/api/projects/${projectId}/estimates`, { signal });
}

export function getProjectWorklogs(projectId: string, signal?: AbortSignal) {
  return fetchJson<ProjectWorklog[]>(`/api/projects/${projectId}/worklogs`, { signal });
}

export function signup(data: SignupRequest, signal?: AbortSignal) {
  return fetchJson<SignupResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
    signal,
  });
}

export { API_BASE_URL };

