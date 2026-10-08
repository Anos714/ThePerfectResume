import { api, clearAccessToken, setAccessToken } from "@/lib/api";

// The `user` object returned by every auth endpoint. `/verify` and
// `/auth/google` omit `avatarUrl`/`provider` from their payloads, so those stay
// optional on the client.
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  provider?: "local" | "google";
  createdAt: string;
  updatedAt: string;
}

// Auth endpoints put the payload at the top level of the envelope (there is no
// `data` key), so the api client hands this object back wholesale. `token` is
// only present when a session is issued: login (verified), verify, google.
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await api.get<AuthResponse>("/api/v1/users/me");
  if (!res.user) {
    throw new Error("Unexpected response from /users/me: missing user");
  }
  return res.user;
}

// 201 → { success, message, user } with no token: the account exists but is
// unverified, so the caller routes to the OTP screen next.
export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return api.post<AuthResponse>("/api/v1/users/register", input);
}

export async function loginUser(
  email: string,
  password: string,
  persist = true,
) {
  const res = await api.post<AuthResponse>("/api/v1/users/login", {
    email,
    password,
  });
  if (res.token) {
    // The refresh token arrives separately as an httpOnly cookie.
    setAccessToken(res.token, persist);
  }
  return res;
}

export async function verifyUser(userId: string, otp: string) {
  const res = await api.post<AuthResponse>("/api/v1/users/verify", {
    userId,
    otp,
  });
  if (res.token) {
    setAccessToken(res.token);
  }
  return res;
}

export async function googleAuth(code: string) {
  const res = await api.post<AuthResponse>("/api/v1/users/auth/google", {
    code,
  });
  if (res.token) {
    setAccessToken(res.token);
  }
  return res;
}

// Emails a one-time code. The response is deliberately uniform for known and
// unknown addresses (the backend never reveals which emails are registered),
// so the caller carries the address it just typed to the next step itself.
export async function forgotPasswordUser(email: string) {
  return api.post<AuthResponse>("/api/v1/users/forgot-password", { email });
}

// Consumes the emailed code and sets a new password. The account is resolved
// from the address the code was sent to, so no user id ever leaves the server.
// No session is issued, so the caller sends the user back to sign in.
export async function resetPasswordUser(input: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return api.post<AuthResponse>("/api/v1/users/reset-password", input);
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/api/v1/users/logout");
  } catch {
    // A failed server logout (network blip, already-expired token) must not
    // strand the user in a signed-in UI.
  }
  // Always clear the client token so the UI reflects the signed-out state,
  // even when the backend call could not be completed.
  clearAccessToken();
}
