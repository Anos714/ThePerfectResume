import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const requestFor = (pathname: string, cookies: Record<string, string> = {}) =>
  new NextRequest(`http://localhost:3000${pathname}`, {
    headers: {
      cookie: Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    },
  });

const redirectLocation = (response: Response) => response.headers.get("location");

describe("proxy — dashboard route protection", () => {
  test("allows /dashboard when the refresh cookie is present", async () => {
    const response = await proxy(
      requestFor("/dashboard/resumes", { refreshToken: "rt-value" }),
    );
    expect(response.status).toBe(200);
  });

  test("redirects /dashboard to /signin when unauthenticated", async () => {
    const response = await proxy(requestFor("/dashboard/resumes"));
    expect(response.status).toBe(307);
    expect(redirectLocation(response)).toContain("/signin");
  });

  test("records the intended destination in the redirect query", async () => {
    const response = await proxy(requestFor("/dashboard/resumes/abc"));
    const location = redirectLocation(response);
    expect(location).toContain("redirect=%2Fdashboard%2Fresumes%2Fabc");
  });

  test("passes through non-dashboard routes unauthenticated", async () => {
    const response = await proxy(requestFor("/pricing"));
    expect(response.status).toBe(200);
  });

  test("passes through the signin page so logged-out users can log in", async () => {
    const response = await proxy(requestFor("/signin"));
    expect(response.status).toBe(200);
  });
});
