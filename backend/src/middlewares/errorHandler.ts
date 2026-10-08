import type { Context } from "hono";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { env } from "@/config/env";

export const errorHandler = (err: Error, c: Context) => {
  let statusCode: ContentfulStatusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = "Validation Failed";
    errors = err.issues.map((issue) => {
      if (issue.code === "unrecognized_keys") {
        const wrongKeys = issue.keys.join(", ");
        return {
          field: wrongKeys,
          message: `Unrecognized keys: ${wrongKeys}`,
        };
      } else {
        return {
          field: issue.path.join("."),
          message: issue.message,
        };
      }
    });
  } else if ((err as any).code === "23505") {
    // 23505 = unique_violation in Postgres
    statusCode = 409;
    message = "This record or email already exists in our system";
  } else if (err instanceof SyntaxError && err.message.includes("JSON")) {
    statusCode = 400;
    message = "Invalid JSON syntax in request body";
  }

  // The rest of the app reads HONO_ENV; NODE_ENV is never set, so the old
  // check was always false and every 500 echoed its stack + originalError to
  // the client.
  const isProd = env.HONO_ENV === "production";

  return c.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
      ...(isProd ? {} : { stack: err.stack, originalError: err.message }),
    },
    statusCode,
  );
};

export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      message: `Cannot ${c.req.method} ${c.req.url} - Route not found`,
    },
    404,
  );
};
