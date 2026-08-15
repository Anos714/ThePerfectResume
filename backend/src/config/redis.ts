import { createClient } from "redis";
import { env } from "./env";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

await redisClient.connect();
