import { Hono } from "hono";
import userRoutes from "./modules/users/user.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import resumesRoutes from "./modules/resumes/resumes.routes";
import { logger } from "hono/logger";
import { corsConfig } from "./config/cors";
import { cors } from "hono/cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";
import {
  productionAuthLimiter,
  productionGeneralLimiter,
} from "./middlewares/rateLimiter";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors(corsConfig));

// global error and 404 handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

// api rate limiters
app.use("/api/v1/users/*", productionAuthLimiter);
app.use("/api/v1/profiles/*", productionGeneralLimiter);
app.use("/api/v1/resumes/*", productionGeneralLimiter);

// test route (ping route)
app.get("/ping", (c) => {
  return c.json({
    success: true,
    message: "pong",
  });
});

app.route("api/v1/users", userRoutes);
app.route("api/v1/profiles", profileRoutes);
app.route("api/v1/resumes", resumesRoutes);

export default {
  port: Number(env.PORT) || 5000,
  fetch: app.fetch,
};

console.log(`Server is running on port ${Number(env.PORT)}`);
