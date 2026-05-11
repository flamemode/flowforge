import type { ProjectQuestionnaire, GeneratedFile } from "@/types";
import { getAnthropicClient } from "@/lib/anthropic";
import { FILE_LANGUAGE_MAP } from "@/lib/constants";
import {
  getSystemPrompt,
  getEnvExamplePrompt,
  getDatabaseSchemaPrompt,
  getRootFilesPrompt,
  getLibFilesPrompt,
  getFeaturePagesPrompt,
  getUIPrimitivesPrompt,
  getLayoutComponentsPrompt,
  getFeatureComponentsPrompt,
  getApiRoutesPrompt,
  getCMSFilesPrompt,
  getPublicFilesPrompt,
  getReadmePrompt,
  getPackageJsonPrompt,
  getConfigFilesPrompt,
} from "./prompts";

export interface GenerationEvent {
  type: "progress" | "file" | "complete" | "error";
  data: {
    label?: string;
    file?: Omit<GeneratedFile, "id" | "project_id" | "created_at">;
    files?: Omit<GeneratedFile, "id" | "project_id" | "created_at">[];
    message?: string;
  };
}

export type OnEvent = (event: GenerationEvent) => void;

function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (path.endsWith(".env.example") || path.startsWith(".env")) return "bash";
  if (path === ".gitignore") return "bash";
  return FILE_LANGUAGE_MAP[ext] ?? "text";
}

function makeFile(
  path: string,
  content: string
): Omit<GeneratedFile, "id" | "project_id" | "created_at"> {
  return { path, content: content.trim(), language: detectLanguage(path) };
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

function parseJsonResponse(raw: string): Record<string, string> {
  // Strip markdown fences
  let cleaned = raw
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/^```\s*$/gm, "")
    .trim();

  // Find the first { and last } to extract the JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to fix truncated JSON by finding the last complete key-value pair
    // and closing the object
    const lastComma = cleaned.lastIndexOf('",\n');
    if (lastComma !== -1) {
      const partial = cleaned.slice(0, lastComma) + '"}';
      try { return JSON.parse(partial); } catch { /* fall through */ }
    }
    console.error("Failed to parse JSON response:", cleaned.slice(0, 200));
    return {};
  }
}

export async function generateProject(
  questionnaire: ProjectQuestionnaire,
  onEvent: OnEvent
): Promise<Omit<GeneratedFile, "id" | "project_id" | "created_at">[]> {
  const system = getSystemPrompt();
  const allFiles: Omit<GeneratedFile, "id" | "project_id" | "created_at">[] = [];

  const emit = (
    files: Omit<GeneratedFile, "id" | "project_id" | "created_at">[],
    label?: string
  ) => {
    for (const file of files) {
      allFiles.push(file);
      onEvent({ type: "file", data: { file } });
    }
    if (label) onEvent({ type: "progress", data: { label } });
  };

  const step = async (
    label: string,
    promptFn: () => string,
    mode: "json" | "raw" = "json",
    outputPath?: string
  ) => {
    onEvent({ type: "progress", data: { label } });
    const raw = await callClaude(system, promptFn());

    if (mode === "raw" && outputPath) {
      const cleaned = raw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
      emit([makeFile(outputPath, cleaned)]);
      return;
    }

    const files = parseJsonResponse(raw);
    const count = Object.keys(files).length;
    if (count > 0) {
      emit(Object.entries(files).map(([path, content]) => makeFile(path, content)));
    } else {
      console.warn(`No files parsed for step: ${label}`);
    }
  };

  try {
    // 1 — package.json
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    const pkgRaw = await callClaude(system, getPackageJsonPrompt(questionnaire));
    const pkgCleaned = pkgRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
    emit([makeFile("package.json", pkgCleaned)]);

    // 2 — Config files (tsconfig, next.config, tailwind, .gitignore, .eslintrc, .prettierrc)
    await step("Generating config files...", () => getConfigFilesPrompt(questionnaire));

    // 3 — .env.example
    onEvent({ type: "progress", data: { label: "Generating .env.example..." } });
    const envRaw = await callClaude(system, getEnvExamplePrompt(questionnaire));
    emit([makeFile(".env.example", envRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    // 4 — Database schema
    if (questionnaire.database !== "none") {
      await step("Generating database schema...", () => getDatabaseSchemaPrompt(questionnaire),
        questionnaire.database === "mongodb" || questionnaire.database === "firebase" ? "json" : "raw",
        questionnaire.database === "supabase" ? "supabase/schema.sql" :
        questionnaire.database === "prisma_postgres" || questionnaire.database === "planetscale" ? "prisma/schema.prisma" :
        undefined
      );
    }

    // 5a — Root files: layout, page, not-found, middleware, auth pages
    await step("Generating app layout and pages...", () => getRootFilesPrompt(questionnaire));

    // 5b — Lib files: utils, supabase, stripe, db, etc.
    const libPrompt = getLibFilesPrompt(questionnaire);
    if (libPrompt) {
      await step("Generating lib utilities...", () => libPrompt);
    }

    // 5c — Feature pages: project-type specific pages
    const featurePrompt = getFeaturePagesPrompt(questionnaire);
    if (featurePrompt) {
      await step("Generating feature pages...", () => featurePrompt);
    }

    // 6a — UI primitive components
    await step("Generating UI components...", () => getUIPrimitivesPrompt(questionnaire));

    // 6b — Layout components: Navbar, Footer
    await step("Generating layout components...", () => getLayoutComponentsPrompt(questionnaire));

    // 6c — Feature-specific components
    await step("Generating feature components...", () => getFeatureComponentsPrompt(questionnaire));

    // 7 — API routes
    await step("Generating API routes...", () => getApiRoutesPrompt(questionnaire));

    // 8 — CMS files (when CMS is configured)
    if (questionnaire.cms !== "none") {
      await step(`Generating ${questionnaire.cms} CMS files...`, () => getCMSFilesPrompt(questionnaire));
    }

    // 9 — Public folder
    await step("Generating public assets...", () => getPublicFilesPrompt(questionnaire));

    // 10 — README
    onEvent({ type: "progress", data: { label: "Generating README..." } });
    const readmeRaw = await callClaude(system, getReadmePrompt(questionnaire));
    emit([makeFile("README.md", readmeRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    onEvent({ type: "complete", data: {} });
    return allFiles;
  } catch (err) {
    onEvent({ type: "error", data: { message: String(err) } });
    throw err;
  }
}
