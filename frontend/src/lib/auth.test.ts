import { afterEach, describe, expect, mock, test } from "bun:test";
import { clearAccessToken, getAccessToken } from "@/lib/api";
import {
  type AuthUser,
  fetchCurrentUser,
  forgotPasswordUser,
  googleAuth,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordUser,
  verifyUser,
} from "@/lib/auth";

const BASE = "http://localhost:8080";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

interface FetchCall {
  url: string | URL | Request;
  init?: RequestInit;
}

let calls: FetchCall[] = [];

type Responder = (
  url: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const defaultResponder: Responder = async () =>
  jsonResponse({
    success: true,
    message: "ok",
    user: { id: "usr_1", username: "alex", email: "alex@example.com" },
  });

let responder: Responder = defaultResponder;

const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url, init });
  return responder(url, init);
});

globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

const respondWith = (next: Responder) => {
  responder = next;
};

const lastCall = () => calls[calls.length - 1];

const sentBody = () => JSON.parse(String(lastCall().init?.body));

afterEach(() => {
  clearAccessToken();
  calls = [];
  responder = defaultResponder;
});

describe("auth data layer", () => {
  test("register posts the full signup payload", async () => {
    await registerUser({
      username: "alex",
      email: "alex@example.com",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
    });

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/register`);
    expect(sentBody()).toEqual({
      username: "alex",
      email: "alex@example.com",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
    });
  });

  test("login stores the issued access token", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "Login successful!",
        user: { id: "usr_1", email: "alex@example.com" },
        token: "access-token",
      }),
    );

    const res = await loginUser("alex@example.com", "Passw0rd!");

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/login`);
    expect(sentBody()).toEqual({
      email: "alex@example.com",
      password: "Passw0rd!",
    });
    expect(res.token).toBe("access-token");
    expect(getAccessToken()).toBe("access-token");
  });

  test("login of an unverified account returns the user without a token", async () => {
    respondWith(async () =>
      jsonResponse({
        success: false,
        message: "User not verified. Please check your email for the verification OTP.",
        user: { id: "usr_1", email: "alex@example.com" },
      }),
    );

    const res = await loginUser("alex@example.com", "Passw0rd!");

    // HTTP 200 with success:false — the caller routes to the OTP screen, and no
    // session is stored client-side.
    expect(res.success).toBe(false);
    expect(res.token).toBeUndefined();
    expect(res.user?.id).toBe("usr_1");
    expect(getAccessToken()).toBeNull();
  });

  test("verify exchanges the OTP for a session token", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "Email verified successfully! Welcome aboard",
        user: { id: "usr_1", email: "alex@example.com" },
        token: "verified-token",
      }),
    );

    const res = await verifyUser("usr_1", "123456");

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/verify`);
    expect(sentBody()).toEqual({ userId: "usr_1", otp: "123456" });
    expect(res.token).toBe("verified-token");
    expect(getAccessToken()).toBe("verified-token");
  });

  test("google auth posts the authorization code and stores the token", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "User authenticated",
        user: { id: "usr_1", email: "alex@example.com" },
        token: "google-token",
      }),
    );

    const res = await googleAuth("auth-code-value");

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/auth/google`);
    expect(sentBody()).toEqual({ code: "auth-code-value" });
    expect(res.token).toBe("google-token");
    expect(getAccessToken()).toBe("google-token");
  });

  test("fetchCurrentUser unwraps the user from the auth envelope", async () => {
    const me: AuthUser = {
      id: "usr_1",
      username: "alex",
      email: "alex@example.com",
      avatarUrl: "https://example.com/avatar.png",
      isVerified: true,
      provider: "local",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    respondWith(async () =>
      jsonResponse({ success: true, message: "User authenticated", user: me }),
    );

    const user = await fetchCurrentUser();

    expect(user).toEqual(me);
  });

  test("logout clears the token even when the request fails", async () => {
    getAccessToken(); // no-op guard to mirror real usage
    respondWith(async () =>
      jsonResponse({ success: false, message: "Server error" }, 500),
    );

    await expect(logoutUser()).resolves.toBeUndefined();
    expect(getAccessToken()).toBeNull();
  });

  test("forgot password emails a code without leaking the account", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message:
          "If an account exists for that email, a reset code is on its way.",
      }),
    );

    const res = await forgotPasswordUser("alex@example.com");

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/forgot-password`);
    expect(sentBody()).toEqual({ email: "alex@example.com" });
    expect(res.success).toBe(true);
    // The response must not echo a user id: that would let a caller discover
    // which addresses are registered.
    expect(res.user).toBeUndefined();
  });

  test("reset password posts the code and the new password", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "Password reset successfully" }),
    );

    const res = await resetPasswordUser({
      email: "alex@example.com",
      otp: "123456",
      newPassword: "NewPassw0rd!",
      confirmPassword: "NewPassw0rd!",
    });

    expect(String(lastCall().url)).toBe(`${BASE}/api/v1/users/reset-password`);
    expect(sentBody()).toEqual({
      email: "alex@example.com",
      otp: "123456",
      newPassword: "NewPassw0rd!",
      confirmPassword: "NewPassw0rd!",
    });
    expect(res.success).toBe(true);
  });
});
