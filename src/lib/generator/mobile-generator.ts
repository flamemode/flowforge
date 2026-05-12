import type { ProjectQuestionnaire, GeneratedFile } from "@/types";
import { getAnthropicClient } from "@/lib/anthropic";
import { FILE_LANGUAGE_MAP } from "@/lib/constants";
import {
  getMobileSystemPrompt,
  getMobilePackagePrompt,
  getMobileConfigPrompt,
  getMobileEnvPrompt,
  getMobileRootFilesPrompt,
  getMobileScreensPrompt,
  getMobileComponentsPrompt,
  getMobileServicesPrompt,
  getMobileReadmePrompt,
} from "./mobile-prompts";
import type { GenerationEvent, OnEvent } from "./generator";

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5-20251001";

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

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  opts: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: opts.model ?? SONNET,
    max_tokens: opts.maxTokens ?? 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

function parseJsonResponse(raw: string): Record<string, string> {
  let cleaned = raw
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/^```\s*$/gm, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const lastComma = cleaned.lastIndexOf('",\n');
    if (lastComma !== -1) {
      const partial = cleaned.slice(0, lastComma) + '"}';
      try { return JSON.parse(partial); } catch { /* fall through */ }
    }
    console.error("Failed to parse JSON response:", cleaned.slice(0, 200));
    return {};
  }
}

export async function generateMobileProject(
  questionnaire: ProjectQuestionnaire,
  onEvent: OnEvent
): Promise<Omit<GeneratedFile, "id" | "project_id" | "created_at">[]> {
  const system = getMobileSystemPrompt();
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
      console.warn(`No files parsed for mobile step: ${label}`);
    }
  };

  const isFlutter = questionnaire.mobile_framework === "flutter";
  const isSwift = questionnaire.mobile_framework === "swift";
  const isKotlin = questionnaire.mobile_framework === "kotlin";

  try {
    // 1 — Package file (Haiku: templated, not complex logic)
    onEvent({ type: "progress", data: { label: "Generating package file..." } });
    const pkgRaw = await callClaude(system, getMobilePackagePrompt(questionnaire), {
      model: HAIKU,
      maxTokens: 2000,
    });
    const pkgCleaned = pkgRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim();
    const pkgPath = isFlutter ? "pubspec.yaml" : isSwift ? "Package.swift" : isKotlin ? "app/build.gradle.kts" : "package.json";
    emit([makeFile(pkgPath, pkgCleaned)]);

    // 2 — Config files (Haiku: templated configs)
    await step("Generating config files...", () => getMobileConfigPrompt(questionnaire), {
      model: HAIKU,
      maxTokens: 3000,
    });

    // 3 — .env.example (Haiku: pure template)
    onEvent({ type: "progress", data: { label: "Generating .env.example..." } });
    const envRaw = await callClaude(system, getMobileEnvPrompt(questionnaire), {
      model: HAIKU,
      maxTokens: 1000,
    });
    emit([makeFile(".env.example", envRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    // 4 — Root navigation and layout (Sonnet: real UI code)
    await step("Generating root navigation and layout...", () => getMobileRootFilesPrompt(questionnaire), {
      maxTokens: 10000,
    });

    // 5 — Main screens (Sonnet: most complex UI)
    await step("Generating main screens...", () => getMobileScreensPrompt(questionnaire), {
      maxTokens: 12000,
    });

    // 6 — UI components (Sonnet)
    await step("Generating UI components...", () => getMobileComponentsPrompt(questionnaire), {
      maxTokens: 8000,
    });

    // 7 — Services / API layer (Sonnet)
    await step("Generating services and hooks...", () => getMobileServicesPrompt(questionnaire), {
      maxTokens: 8000,
    });

    // 8 — README (Haiku: docs, not code)
    onEvent({ type: "progress", data: { label: "Generating README..." } });
    const readmeRaw = await callClaude(system, getMobileReadmePrompt(questionnaire), {
      model: HAIKU,
      maxTokens: 2000,
    });
    emit([makeFile("README.md", readmeRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    onEvent({ type: "complete", data: {} });
    return allFiles;
  } catch (err) {
    onEvent({ type: "error", data: { message: String(err) } });
    throw err;
  }
}
