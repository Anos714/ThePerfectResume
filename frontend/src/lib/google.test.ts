import { describe, expect, test } from "bun:test";
import { getGoogleAuthUrl } from "@/lib/google";

describe("google oauth", () => {
  test("builds the authorization-code consent URL", () => {
    const url = getGoogleAuthUrl({
      clientId: "client-123.apps.googleusercontent.com",
      redirectUri: "http://localhost:3000/auth/google/callback",
    });

    expect(url.startsWith("https://accounts.google.com/o/oauth2/v2/auth?")).toBe(
      true,
    );

    const params = new URL(url).searchParams;
    expect(params.get("client_id")).toBe("client-123.apps.googleusercontent.com");
    expect(params.get("redirect_uri")).toBe(
      "http://localhost:3000/auth/google/callback",
    );
    expect(params.get("response_type")).toBe("code");
    expect(params.get("scope")).toBe("openid email profile");
    expect(params.get("prompt")).toBe("consent");
  });
});
