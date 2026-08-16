import { Hono } from "hono";
import userRoutes from "./modules/users/user.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import { logger } from "hono/logger";
import { corsConfig } from "./config/cors";
import { cors } from "hono/cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors(corsConfig));

// global error and 404 handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

// test route (ping route)
app.get("/ping", (c) => {
  return c.json({
    success: true,
    message: "pong",
  });
});

app.route("api/v1/users", userRoutes);
app.route("api/v1/profiles", profileRoutes);

export default {
  port: Number(env.PORT) || 5000,
  fetch: app.fetch,
};

console.log(`Server is running on port ${Number(env.PORT)}`);
