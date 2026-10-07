import { api, clearAccessToken, setAccessToken } from "@/lib/api";

// Shape returned by GET /users/me. Plan drives feature gating in the UI; the
// AI quota counters are surfaced per-response via X-AI-Usage headers instead.
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  headline: string | null;
  plan: "free" | "pro" | "career";
  avatarUrl: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>("/api/v1/users/me");
}

export async function loginUser(email: string, password: string) {
  const res = await api.post<LoginResponse>("/api/v1/users/login", {
    email,
    password,
  });
  if (res.token) {
    // The refresh token arrives separately as an httpOnly cookie.
    setAccessToken(res.token);
  }
  return res;
}

export async function logoutUser() {
  try {
    await api.post("/api/v1/users/logout");
  } finally {
    // Clear the client token even if the server call fails so the UI reflects
    // the logged-out state immediately.
    clearAccessToken();
  }
}
