import type {
  LoginRequest,
  LoginResponse,
  ProjectBacklog,
  ProjectEstimate,
  ProjectSummary,
  ProjectTask,
  ProjectWorklog,
  SignupRequest,
  SignupResponse,
} from "../types/api";

const DEFAULT_API_BASE_URLS = [
  "https://localhost:5001",
  "http://localhost:5000",
  "http://localhost:5001",
];

const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL;

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const urlsToTry = API_BASE_URL
    ? [API_BASE_URL]
    : DEFAULT_API_BASE_URLS;

  let lastError: Error | null = null;

  for (const baseUrl of urlsToTry) {
    try {
      const response = await fetch(`${baseUrl}${input}`, {
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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's a network error and we have more URLs to try, continue
      if (
        error instanceof TypeError &&
        error.message.includes("fetch") &&
        urlsToTry.indexOf(baseUrl) < urlsToTry.length - 1
      ) {
        continue;
      }
      
      // If it's not a network error, or it's the last URL, throw immediately
      if (!(error instanceof TypeError && error.message.includes("fetch"))) {
        throw error;
      }
    }
  }

  // If we get here, all URLs failed
  throw new Error(
    `Unable to connect to backend. Tried: ${urlsToTry.join(", ")}. Make sure the backend is running.`
  );
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

export function login(data: LoginRequest, signal?: AbortSignal) {
  return fetchJson<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    signal,
  });
}

export { API_BASE_URL };

