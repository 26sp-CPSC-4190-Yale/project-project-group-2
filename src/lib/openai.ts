import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

/** Singleton OpenAI client. Server-side only */
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Model used by Chat Reponses API. */
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.4-mini";

/** Model used by PDF Extraction API. */
export const EXTRACT_MODEL = process.env.OPENAI_EXTRACT_MODEL ?? "gpt-5.4-mini";

/** Timeout for single OpenAI request in ms. */
export const OPENAI_TIMEOUT_MS = 120_000;