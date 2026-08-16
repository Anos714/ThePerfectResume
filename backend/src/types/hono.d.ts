import "hono";

declare module "hono" {
  interface Env {
    Variables: {
      user: {
        id: string;
      };
    };
  }

  interface ContextVariableMap {
    user: {
      id: string;
    };
  }
}
