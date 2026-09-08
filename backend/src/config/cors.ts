import { env } from "./env";

export const corsConfig = {
  origin: env.FRONTEND_URL||"http://localhost:5173",
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  maxAge: 86400,
  exposeHeaders: ["X-Total-Count"],
  allowHeaders: ["Content-Type", "Authorization"],
};
