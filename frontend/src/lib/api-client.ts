import {
  getAccessToken,
  getAuthSession,
  setAuthSession,
  clearAuthSession,
} from "@/lib/auth-session";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const API_BASE_URL =
  import.meta.env.DEV
    ? configuredApiBaseUrl || "http://localhost:5000"
    : configuredApiBaseUrl && !configuredApiBaseUrl.includes("localhost")
      ? configuredApiBaseUrl
      : "/api";

interface ApiEnvelope {
  success?: boolean;
  data?: unknown;
  message?: string;
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function toNetworkErrorMessage(path: string) {
  return `Cannot connect to backend at ${buildUrl(path)}. Start backend server and try again.`;
}

function extractErrorMessage(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (
      typeof data.success === "boolean" &&
      data.success === false &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (typeof data.message === "string") {
      return data.message;
    }
    if (typeof data.non_field_errors === "string") {
      return data.non_field_errors;
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      ) {
        return `${firstKey}: ${value[0]}`;
      }
      if (typeof value === "string") {
        return `${firstKey}: ${value}`;
      }
    }
  }
  return "Request failed.";
}

function unwrapEnvelope(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const candidate = payload as ApiEnvelope;
  if (typeof candidate.success !== "boolean") {
    return payload;
  }

  const data = candidate.data;
  if (!data || typeof data !== "object") {
    return data ?? null;
  }

  if (candidate.message && !("message" in (data as Record<string, unknown>))) {
    return {
      ...(data as Record<string, unknown>),
      message: candidate.message,
    };
  }

  return data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });
  } catch {
    throw new Error(toNetworkErrorMessage(path));
  }

  // Attempt to refresh the token on 401 and retry once
  if (response.status === 401 && options.auth !== false) {
    const session = getAuthSession();
    if (session?.refresh) {
      try {
        const refreshResp = await fetch(buildUrl("/api/refresh-token"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: session.refresh }),
        });
        if (refreshResp.ok) {
          const refreshJson = (await refreshResp.json()) as unknown;
          const refreshData = unwrapEnvelope(refreshJson) as {
            access?: string;
          } | null;
          if (!refreshData?.access) {
            clearAuthSession();
            throw new Error("Session expired.");
          }

          setAuthSession({ ...session, access: refreshData.access });
          // Retry original request with new token
          headers.set("Authorization", `Bearer ${refreshData.access}`);
          let retryResp: Response;
          try {
            retryResp = await fetch(buildUrl(path), {
              ...options,
              headers,
            });
          } catch {
            throw new Error(toNetworkErrorMessage(path));
          }
          const retryText = await retryResp.text();
          const retryData = retryText
            ? (JSON.parse(retryText) as unknown)
            : null;
          if (!retryResp.ok) {
            throw new Error(extractErrorMessage(retryData));
          }
          return unwrapEnvelope(retryData) as T;
        }
        clearAuthSession();
      } catch {
        clearAuthSession();
      }
    }
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return unwrapEnvelope(data) as T;
}

export function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { results?: T[] }).results)
  ) {
    return (payload as { results: T[] }).results;
  }
  return [];
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
