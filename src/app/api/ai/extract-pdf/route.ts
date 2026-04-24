import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai, EXTRACT_MODEL, OPENAI_TIMEOUT_MS } from "@/lib/openai";
import { rateLimit } from "@/lib/aiRateLimit";
import { extractionSchema, type ExtractionResult } from "@/lib/aiSchemas";

// Maximum PDF size in bytes, 20MB
const MAX_PDF_BYTES = 20 * 1024 * 1024;


/**
 * PDF Extraction API
 *
 * @route   POST /api/ai/extract-pdf
 * @body    {fileId} - the id of the file to extract
 * @body    {timezone} - the timezone of the user
 * @body    {todayISO} - the ISO 8601 date of today
 * @returns {ExtractionResult} the extraction result
 * @error   401 - not authenticated
 * @error   400 - invalid body or missing required fields
 * @error   429 - too many requests
 * @error   404 - file not found
 * @error   413 - PDF too large
 * @error   500 - failed to fetch file
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!rateLimit(`extract:${session.userId}`, 10)) return jsonError("Too many requests", 429);

  const { fileId, timezone, todayISO } = await req.json();
  if (!fileId) return jsonError("fileId required", 400);

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, userId: session.userId },
    include: { calendar: { include: { groups: { where: { isDefault: true }, take: 1 } } } },
  });
  if (!file) return jsonError("File not found", 404);

  // Download file from Supabase
  const { data: blob, error } = await supabaseAdmin.storage.from("user-files").download(file.storagePath);
  if (error || !blob) return jsonError("Failed to fetch file", 500);
  const size = blob.size;
  if (size > MAX_PDF_BYTES) return jsonError(`PDF too large (${Math.round(size/1024/1024)} MB, max 20 MB)`, 413);

  // Upload file to OpenAI Files API
  const openaiFile = await openai.files.create({
    file: new File([blob], file.name, { type: "application/pdf" }),
    purpose: "user_data",
  });

  //Extract data from PDF
  try {
    const resp = await openai.responses.create({
      model: EXTRACT_MODEL,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: buildExtractionPrompt(file.name, timezone, todayISO) },
          { type: "input_file", file_id: openaiFile.id },
        ],
      }],
      text: {
        format: {
          type: "json_schema",
          name: "syllabus_extraction",
          strict: true,
          schema: extractionSchema,
        },
      },
    }, { timeout: OPENAI_TIMEOUT_MS });

    // With strict mode, output_text is always a parseable JSON string matching extractionSchema.
    const parsed = JSON.parse(resp.output_text) as ExtractionResult;

    return jsonSuccess({
      items: parsed.items,
      detectedTimezone: parsed.detectedTimezone,
      unparseableNotes: parsed.unparseableNotes,
      defaultCalendarId: file.calendarId,
      defaultGroupId: file.calendar?.groups[0]?.id ?? null,
    });
  } finally {
    // Clean up OpenAI-side file even if the model call throws.
    await openai.files.delete(openaiFile.id).catch(() => {});
  }
}


// Helper functions below

// ---------------------------------------------------------------------------
// Build Extraction Prompt

function buildExtractionPrompt(fileName: string, timezone: string | undefined, todayISO: string | undefined) {
  return [
    "You are extracting scheduling data from a university course document (syllabus, problem set list, etc.).",
    `File name: ${fileName}`,
    todayISO ? `Today's date: ${todayISO}.` : "",
    timezone ? `User timezone: ${timezone}.` : "",
    "",
    "Rules:",
    "- Output every date-anchored item you find. Use kind=\"task\" for homework / problem sets / essays / quizzes with a due date. Use kind=\"event\" for lectures / exams / office hours / review sessions.",
    "- If the document omits a year, infer the most likely academic year using Today's date.",
    "- Prefer allDay=true unless a specific time appears in the document.",
    "- dateISO must be ISO 8601 with timezone offset.",
    "- confidence must reflect certainty; set <0.5 for guessed dates.",
    "- Do NOT invent items that are not in the document. If the document contains no dated items, return an empty items array.",
  ].filter(Boolean).join("\n");
}