import type { ProjectQuestionnaire, GeneratedFile } from "@/types";
import { getAnthropicClient } from "@/lib/anthropic";
import { FILE_LANGUAGE_MAP } from "@/lib/constants";
import {
  getSystemPrompt,
  getEnvExamplePrompt,
  getDatabaseSchemaPrompt,
  getCoreFilesPrompt,
  getComponentsPrompt,
  getApiRoutesPrompt,
  getReadmePrompt,
  getPackageJsonPrompt,
  getConfigFilesPrompt,
  getCMSFilesPrompt,
  getPublicFilesPrompt,
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
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

function parseJsonResponse(raw: string): Record<string, string> {
  // Strip markdown fences if present
  const cleaned = raw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return {};
  }
}

export async function generateProject(
  questionnaire: ProjectQuestionnaire,
  onEvent: OnEvent
): Promise<Omit<GeneratedFile, "id" | "project_id" | "created_at">[]> {
  const system = getSystemPrompt();
  const allFiles: Omit<GeneratedFile, "id" | "project_id" | "created_at">[] = [];

  const emit = (files: Omit<GeneratedFile, "id" | "project_id" | "created_at">[], label?: string) => {
    for (const file of files) {
      allFiles.push(file);
      onEvent({ type: "file", data: { file } });
    }
    if (label) onEvent({ type: "progress", data: { label } });
  };

  try {
    // 1 — package.json
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    const pkgRaw = await callClaude(system, getPackageJsonPrompt(questionnaire));
    const pkgCleaned = pkgRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
    emit([makeFile("package.json", pkgCleaned)]);

    // 2 — Config files
    onEvent({ type: "progress", data: { label: "Generating config files..." } });
    const configRaw = await callClaude(system, getConfigFilesPrompt(questionnaire));
    const configs = parseJsonResponse(configRaw);
    emit(Object.entries(configs).map(([path, content]) => makeFile(path, content)));

    // 3 — .env.example
    onEvent({ type: "progress", data: { label: "Generating .env.example..." } });
    const envRaw = await callClaude(system, getEnvExamplePrompt(questionnaire));
    const envCleaned = envRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
    emit([makeFile(".env.example", envCleaned)]);

    // 4 — Database schema
    if (questionnaire.database !== "none") {
      onEvent({ type: "progress", data: { label: "Generating database schema..." } });
      const dbRaw = await callClaude(system, getDatabaseSchemaPrompt(questionnaire));
      const dbCleaned = dbRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
      const schemaPath =
        questionnaire.database === "supabase" ? "supabase/schema.sql" :
        questionnaire.database === "prisma_postgres" || questionnaire.database === "planetscale" ? "prisma/schema.prisma" :
        questionnaire.database === "firebase" ? "firestore.rules" :
        "schema.txt";

      if (questionnaire.database === "mongodb") {
        const models = parseJsonResponse(dbRaw);
        emit(Object.entries(models).map(([path, content]) => makeFile(path, content)));
      } else {
        emit([makeFile(schemaPath, dbCleaned)]);
      }
    }

    // 5 — Core files
    onEvent({ type: "progress", data: { label: "Generating core app files..." } });
    const coreRaw = await callClaude(system, getCoreFilesPrompt(questionnaire));
    const coreFiles = parseJsonResponse(coreRaw);
    emit(Object.entries(coreFiles).map(([path, content]) => makeFile(path, content)));

    // 6 — Components
    onEvent({ type: "progress", data: { label: "Generating components..." } });
    const compRaw = await callClaude(system, getComponentsPrompt(questionnaire));
    const compFiles = parseJsonResponse(compRaw);
    emit(Object.entries(compFiles).map(([path, content]) => makeFile(path, content)));

    // 7 — API routes
    onEvent({ type: "progress", data: { label: "Generating API routes..." } });
    const apiRaw = await callClaude(system, getApiRoutesPrompt(questionnaire));
    const apiFiles = parseJsonResponse(apiRaw);
    emit(Object.entries(apiFiles).map(([path, content]) => makeFile(path, content)));

    // 8 — CMS files (when CMS is configured)
    if (questionnaire.cms !== "none") {
      onEvent({ type: "progress", data: { label: `Generating ${questionnaire.cms} CMS files...` } });
      const cmsRaw = await callClaude(system, getCMSFilesPrompt(questionnaire));
      const cmsFiles = parseJsonResponse(cmsRaw);
      emit(Object.entries(cmsFiles).map(([path, content]) => makeFile(path, content)));
    }

    // 9 — Public folder
    onEvent({ type: "progress", data: { label: "Generating public assets..." } });
    const pubRaw = await callClaude(system, getPublicFilesPrompt(questionnaire));
    const pubFiles = parseJsonResponse(pubRaw);
    emit(Object.entries(pubFiles).map(([path, content]) => makeFile(path, content)));

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
