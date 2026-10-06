import { Context, Env } from "hono";
import {
  aiSuggestService,
  aiSummaryService,
  atsScoreService,
  coverLetterService,
  interviewService,
} from "./ai.service";
import {
  AiSuggestInput,
  AiSummaryInput,
  AtsScoreInput,
  CoverLetterInput,
  InterviewInput,
} from "./ai.schema";

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

type AtsScoreContext = Context<
  Env,
  string,
  { in: { json: AtsScoreInput }; out: { json: AtsScoreInput } }
>;

type CoverLetterContext = Context<
  Env,
  string,
  { in: { json: CoverLetterInput }; out: { json: CoverLetterInput } }
>;

type InterviewContext = Context<
  Env,
  string,
  { in: { json: InterviewInput }; out: { json: InterviewInput } }
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

export const atsScoreController = async (c: AtsScoreContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const result = await atsScoreService(user.id, data);
  return c.json({ success: true, data: result });
};

export const coverLetterController = async (c: CoverLetterContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const result = await coverLetterService(user.id, data);
  return c.json({ success: true, data: result });
};

export const interviewController = async (c: InterviewContext) => {
  const data = c.req.valid("json");
  const result = await interviewService(data);
  return c.json({ success: true, data: result });
};
