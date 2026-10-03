import { Context, Env } from "hono";
import { aiSuggestService, aiSummaryService } from "./ai.service";
import { AiSuggestInput, AiSummaryInput } from "./ai.schema";

type SuggestContext = Context<
  Env,
  string,
  { in: { json: AiSuggestInput }; out: { json: AiSuggestInput } }
>;

type SummaryContext = Context<
  Env,
  string,
  { in: { json: AiSummaryInput }; out: { json: AiSummaryInput } }
>;

export const aiSuggestController = async (c: SuggestContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const result = await aiSuggestService(user.id, data);
  return c.json({ success: true, data: result });
};

export const aiSummaryController = async (c: SummaryContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const result = await aiSummaryService(user.id, data);
  return c.json({ success: true, data: result });
};
