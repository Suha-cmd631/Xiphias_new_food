"use client";

// Browser → same-origin /api/v1 (Next rewrite → Express). Cookies are first-party, so no CORS dance.
const BASE = (process.env.NEXT_PUBLIC_API_URL || "") + "/api/v1";

export class ApiClientError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string; details?: unknown } };
  if (!res.ok) throw new ApiClientError(res.status, data.error?.code ?? "HTTP_" + res.status, data.error?.message ?? "Request failed", data.error?.details);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
