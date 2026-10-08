import { createClient } from "redis";
import { env } from "./env";

// A single client serves the whole app (the rate limiter used to open a second
// ioredis pool to the same instance). It connects eagerly but without a
// top-level `await`: the socket opens synchronously inside connect() and
// node-redis queues any command issued before the handshake finishes, so app
// startup no longer blocks on Redis and no call site has to await readiness.
export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    // Reconnect with a linear backoff, capped at 3s, forever: auth, rate
    // limiting and quotas all depend on Redis, so giving up would just turn a
    // transient outage into a permanent one.
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    connectTimeout: 10_000,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

// Fire the handshake now; the promise is intentionally not awaited at module
// scope. A rejection here is surfaced by the "error" listener above and the
// reconnect strategy retries — it must not become an unhandled rejection that
// takes the process down.
void redisClient.connect().catch(() => {
  // handled by the error listener; keep the process alive
});
