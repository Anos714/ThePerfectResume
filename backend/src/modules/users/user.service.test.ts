import { test, expect, mock } from "bun:test";
import { AppError } from "@/utils/AppError";

// The service module transitively imports the Redis client (module-scope
// connect) and Cloudinary; stub both so the unit under test is isolated.
mock.module("@/config/redis", () => ({
  redisClient: {
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    incr: async () => 1,
    expire: async () => 1,
    decr: async () => 0,
  },
}));

mock.module("@/config/cloudinary", () => ({
  cloudinary: {
    uploader: {
      upload: async () => ({ secure_url: "https://example.com/a.png" }),
    },
  },
}));

const passwordHash = async (password: string) =>
  await Bun.password.hash(password);

const stubRepo = (user: Record<string, unknown> | null) =>
  mock.module("./user.repository", () => ({
    findUserByEmailWithPassword: async () => user,
    findUserByEmail: async () => user,
    findUserByEmailWithAuthProvider: async () => user,
    findUserById: async () => user,
    findUserByIdWithPassword: async () => user,
    createUser: async (data: Record<string, unknown>) => data,
    updateVerificationStatus: async () => user,
    updateUserPassword: async () => user,
    updateUserAvatar: async () => user,
    createGoogleAuthUser: async () => user,
    updateGoogleAuthUser: async () => user,
  }));

const login = async (email: string, password: string) =>
  import("./user.service").then((m) =>
    m.loginUserService({ email, password }),
  );

test("login succeeds with the correct password", async () => {
  const user = {
    id: "u1",
    username: "alice",
    email: "alice@example.com",
    passwordHash: await passwordHash("hunter2"),
    isVerified: true,
    provider: "local" as const,
  };
  stubRepo(user);

  const result = await login("alice@example.com", "hunter2");

  expect(result.email).toBe("alice@example.com");
  // The stored hash must never ride along in the response.
  expect(JSON.stringify(result)).not.toContain("passwordHash");
});

test("login rejects a wrong password", async () => {
  const user = {
    id: "u1",
    username: "alice",
    email: "alice@example.com",
    passwordHash: await passwordHash("hunter2"),
    isVerified: true,
    provider: "local" as const,
  };
  stubRepo(user);

  await expect(login("alice@example.com", "wrong-password")).rejects.toThrow(
    AppError,
  );
  await expect(
    login("alice@example.com", "wrong-password"),
  ).rejects.toMatchObject({ statusCode: 401 });
});

test("login rejects an unknown user without revealing the account exists", async () => {
  stubRepo(null);

  await expect(login("nobody@example.com", "anything")).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid email or password",
  });
});
