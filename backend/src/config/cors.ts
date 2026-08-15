export const corsConfig = {
  origin: ["http://localhost:3000"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  maxAge: 86400,
  exposeHeaders: ["X-Total-Count"],
  allowHeaders: ["Content-Type", "Authorization"],
}