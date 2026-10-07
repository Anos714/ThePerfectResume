/**
 * Typed fetch wrapper for the Hono backend.
 *
 * Base URL comes from NEXT_PUBLIC_API_URL. Every request sends credentials so
 * the httpOnly `refreshToken` cookie is forwarded to the backend, and attaches
 * the in-memory access token as `Authorization: Bearer <token>`. On a 401 the
 * client transparently calls /users/refresh (which reads that cookie) exactly
 * once and retries the original request.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

const ACCESS_TOKEN_KEY = "tpr.accessToken";

// Backend envelope: { success, message, ...payload } or { success: false, message, errors? }
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  data?: T;
}

export class ApiError extends Error {
  readonly status: number;
  readonly envelope?: ApiEnvelope<never>;

  constructor(
    status: number,
    message: string,
    envelope?: ApiEnvelope<never>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.envelope = envelope;
  }

  /** True for any auth failure that wasn't recovered by a refresh. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** Validation issues keyed by form field, for inline form feedback. */
  get fieldErrors(): Record<string, string> {
    const errors = this.envelope?.errors;
    if (!errors) return {};
    return Object.fromEntries(errors.map((e) => [e.field, e.message]));
  }
}

// ---------------------------------------------------------------------------
// Access-token storage
// ---------------------------------------------------------------------------

// The access token is short-lived and readable by the client (it must be, to
// be sent as a header). The refresh token stays in an httpOnly cookie set by
// the backend and is never touched by JS.
let accessToken: string | null = null;

// "Remember me" off keeps the access token in sessionStorage so it is dropped
// when the tab closes; the refresh-token cookie still exists, but without the
// access token a cold load can no longer reach authenticated routes.
let persistToken = true;

const isBrowser = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (!isBrowser()) return null;

  const persisted = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (persisted) {
    accessToken = persisted;
    persistToken = true;
    return accessToken;
  }

  const session = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (session) {
    accessToken = session;
    persistToken = false;
  }
  return session;
}

export function setAccessToken(token: string | null, persist = persistToken): void {
  accessToken = token;
  persistToken = persist;
  if (!isBrowser()) return;

  // Clear both stores so switching modes can never resurrect a stale token.
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  if (!token) return;

  const store = persist ? window.localStorage : window.sessionStorage;
  store.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

// ---------------------------------------------------------------------------
// Refresh handling
// ---------------------------------------------------------------------------

// Concurrent 401s must share a single refresh round-trip; otherwise the second
// caller would race and log the user out on the first's stale token.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      clearAccessToken();
      return null;
    }

    // The refresh endpoint returns the token at the top level of the envelope
    // (AuthSuccessResponse), not nested under `data`.
    const body = (await res.json()) as { token?: string };
    const token = body.token;
    if (!token) {
      clearAccessToken();
      return null;
    }

    setAccessToken(token);
    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Core request
// ---------------------------------------------------------------------------

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  // Internal: set when retrying after a refresh so we never loop.
  _retried?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, _retried, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  const token = getAccessToken();
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (!(body instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body;
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    body: requestBody,
    credentials: "include",
  });

  // 204 / empty bodies should not be JSON-parsed.
  const text = await response.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const envelope = parsed as ApiEnvelope<never> | null;
    const message = envelope?.message ?? `Request failed (${response.status})`;

    // The one retry happens here: refresh, then replay the original call.
    if (response.status === 401 && !_retried) {
      const freshToken = await refreshAccessToken();
      if (freshToken) {
        return apiFetch<T>(path, { ...options, _retried: true });
      }
    }

    throw new ApiError(response.status, message, envelope ?? undefined);
  }

  // Successful responses use the { success, message, data } envelope; older
  // endpoints (auth) put the payload at the top level. Prefer `.data`, fall
  // back to the whole object.
  const envelope = parsed as ApiEnvelope<T> | null;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    return (envelope.data ?? (envelope as unknown as T)) as T;
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

/**
 * Pull a human-readable message out of anything the API layer throws — usually
 * an `ApiError` carrying the backend's own message, but any error shape works.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return fallback;
}

export const apiBaseUrl = API_BASE_URL;
