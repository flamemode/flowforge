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

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5-20251001";

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  opts: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const client = getAnthropicClient();
  const maxAttempts = 6;
  const delays = [3000, 8000, 15000, 25000, 40000]; // ms between retries (~91s total)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const message = await client.messages.create({
        model: opts.model ?? SONNET,
        max_tokens: opts.maxTokens ?? 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      const block = message.content[0];
      return block.type === "text" ? block.text : "";
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const isRetryable = status === 529 || status === 503 || status === 429 || status === 500;
      if (!isRetryable || attempt === maxAttempts - 1) {
        // Throw a clean message instead of raw API JSON
        if (status === 529) throw new Error("The AI service is temporarily overloaded. Please click Retry in a moment.");
        if (status === 429) throw new Error("Rate limit reached. Please click Retry in a moment.");
        throw err;
      }
      await new Promise(res => setTimeout(res, delays[attempt]));
    }
  }
  throw new Error("callClaude: unreachable");
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
    opts: { model?: string; maxTokens?: number; mode?: "json" | "raw"; outputPath?: string } = {}
  ) => {
    onEvent({ type: "progress", data: { label } });
    const raw = await callClaude(system, promptFn(), {
      model: opts.model ?? SONNET,
      maxTokens: opts.maxTokens ?? 8000,
    });

    if (opts.mode === "raw" && opts.outputPath) {
      const cleaned = raw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
      emit([makeFile(opts.outputPath, cleaned)]);
      return;
    }

    const files = parseJsonResponse(raw);
    if (Object.keys(files).length > 0) {
      emit(Object.entries(files).map(([path, content]) => makeFile(path, content)));
    } else {
      console.warn(`No files parsed for step: ${label}`);
    }
  };

  try {
    // 1 — package.json (Haiku: simple JSON, 1500 tokens plenty)
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    const pkgRaw = await callClaude(system, getPackageJsonPrompt(questionnaire), { model: HAIKU, maxTokens: 1500 });
    emit([makeFile("package.json", pkgRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    // 2 — Config files (Haiku: templated configs, not complex logic)
    await step("Generating config files...", () => getConfigFilesPrompt(questionnaire), { model: HAIKU, maxTokens: 3000 });

    // Overwrite globals.css deterministically — Claude consistently reverts to Tailwind v3 syntax
    if (questionnaire.styling === "tailwind") {
      const isDark = questionnaire.color_scheme === "dark";
      const isToggle = questionnaire.color_scheme === "system_toggle";
      const globalsCss = `@import "tailwindcss";

:root {
  --background: ${isDark ? "0 0% 4%" : "0 0% 100%"};
  --foreground: ${isDark ? "0 0% 95%" : "0 0% 4%"};
  --primary: 262 80% ${isDark ? "65%" : "60%"};
  --primary-foreground: 0 0% 100%;
  --muted: ${isDark ? "0 0% 15%" : "0 0% 94%"};
  --muted-foreground: ${isDark ? "0 0% 55%" : "0 0% 45%"};
  --border: ${isDark ? "0 0% 18%" : "0 0% 88%"};
  --radius: 0.5rem;
}
${isToggle ? `
.dark {
  --background: 0 0% 4%;
  --foreground: 0 0% 95%;
  --primary: 262 80% 65%;
  --primary-foreground: 0 0% 100%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 55%;
  --border: 0 0% 18%;
}` : ""}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

* {
  border-color: hsl(var(--border));
}
`;
      emit([makeFile("src/app/globals.css", globalsCss)]);
    }

    // 3 — .env.example (Haiku: pure template)
    onEvent({ type: "progress", data: { label: "Generating .env.example..." } });
    const envRaw = await callClaude(system, getEnvExamplePrompt(questionnaire), { model: HAIKU, maxTokens: 1000 });
    emit([makeFile(".env.example", envRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    // 4 — Database schema (Sonnet: schema design matters)
    if (questionnaire.database !== "none") {
      const isJson = questionnaire.database === "mongodb" || questionnaire.database === "firebase";
      await step("Generating database schema...", () => getDatabaseSchemaPrompt(questionnaire), {
        maxTokens: 4000,
        mode: isJson ? "json" : "raw",
        outputPath: isJson ? undefined :
          questionnaire.database === "supabase" ? "supabase/schema.sql" :
          "prisma/schema.prisma",
      });
    }

    // 5a — Root files: layout, page, globals, middleware, auth pages (Sonnet: real UI code)
    await step("Generating app layout and pages...", () => getRootFilesPrompt(questionnaire), { maxTokens: 10000 });

    // 5b — Lib files: utils, clients (Sonnet)
    const libPrompt = getLibFilesPrompt(questionnaire);
    if (libPrompt) {
      await step("Generating lib utilities...", () => libPrompt, { maxTokens: 6000 });
    }

    // 5c — Feature pages (Sonnet: most complex UI)
    const featurePrompt = getFeaturePagesPrompt(questionnaire);
    if (featurePrompt) {
      await step("Generating feature pages...", () => featurePrompt, { maxTokens: 12000 });
    }

    // 6a — UI primitive components (Sonnet)
    await step("Generating UI components...", () => getUIPrimitivesPrompt(questionnaire), { maxTokens: 8000 });

    // 6b — Layout: Navbar, Footer (Sonnet)
    await step("Generating layout components...", () => getLayoutComponentsPrompt(questionnaire), { maxTokens: 6000 });

    // 6c — Feature components (Sonnet: largest step)
    await step("Generating feature components...", () => getFeatureComponentsPrompt(questionnaire), { maxTokens: 12000 });

    // 7 — API routes (Sonnet)
    await step("Generating API routes...", () => getApiRoutesPrompt(questionnaire), { maxTokens: 8000 });

    // 8 — CMS files (Sonnet: config-heavy)
    if (questionnaire.cms !== "none") {
      await step(`Generating ${questionnaire.cms} CMS files...`, () => getCMSFilesPrompt(questionnaire), { maxTokens: 8000 });
    }

    // 9 — Public folder (Haiku: SVG + text files)
    await step("Generating public assets...", () => getPublicFilesPrompt(questionnaire), { model: HAIKU, maxTokens: 2000 });

    // 10 — README (Haiku: docs, not code)
    onEvent({ type: "progress", data: { label: "Generating README..." } });
    const readmeRaw = await callClaude(system, getReadmePrompt(questionnaire), { model: HAIKU, maxTokens: 2000 });
    emit([makeFile("README.md", readmeRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    onEvent({ type: "complete", data: {} });
    return allFiles;
  } catch (err) {
    onEvent({ type: "error", data: { message: String(err) } });
    throw err;
  }
}
