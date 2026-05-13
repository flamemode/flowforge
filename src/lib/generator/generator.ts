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

// ─── Deterministic package.json builder ───────────────────────────────────────
// Every version here is manually verified to be React 19 compatible.
// Never let Claude generate package.json — it consistently uses wrong versions.

function buildPackageJson(q: ProjectQuestionnaire): string {
  const name = q.project_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const isPayload = q.cms === "payload";
  const isCatalina = q.dev_os === "macos_catalina";
  const needsThemes = q.color_scheme === "system_toggle" || q.features?.includes("dark_mode");

  const deps: Record<string, string> = {
    // Core
    ...(q.framework === "nextjs" ? { next: isPayload ? "15.4.11" : "^15.0.0" } : {}),
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    // Styling utilities always present
    clsx: "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0",
    // Tailwind
    ...(q.styling === "tailwind" ? { tailwindcss: "^4.0.0", "@tailwindcss/postcss": "^4.0.0" } : {}),
    ...(q.styling === "styled_components" ? { "styled-components": "^6.0.0" } : {}),
    // Database
    ...(q.database === "supabase" ? { "@supabase/supabase-js": "^2.46.0", "@supabase/ssr": "^0.5.0" } : {}),
    ...(q.database === "mongodb" ? { mongoose: "^8.0.0" } : {}),
    ...(q.database === "firebase" ? { firebase: "^11.0.0" } : {}),
    ...((q.database === "prisma_postgres" || q.database === "planetscale") ? { "@prisma/client": "^6.0.0" } : {}),
    // Auth
    ...(q.auth === "nextauth" ? { "next-auth": "^5.0.0" } : {}),
    ...(q.auth === "clerk" ? { "@clerk/nextjs": "^6.0.0" } : {}),
    ...(q.auth === "lucia" ? { lucia: "^3.0.0", oslo: "^1.2.0" } : {}),
    // Payments
    ...(q.payments === "stripe" ? { stripe: "^17.0.0", "@stripe/stripe-js": "^4.0.0" } : {}),
    ...(q.payments === "lemonsqueezy" ? { "@lemonsqueezy/lemonsqueezy-js": "^1.3.0" } : {}),
    // Extra APIs
    ...(q.extra_apis?.includes("resend") ? { resend: "^4.0.0" } : {}),
    ...(q.extra_apis?.includes("openai") ? { openai: "^4.70.0" } : {}),
    ...(q.extra_apis?.includes("anthropic") ? { "@anthropic-ai/sdk": "^0.39.0" } : {}),
    ...(q.extra_apis?.includes("cloudinary") ? { cloudinary: "^2.5.0", "next-cloudinary": "^6.0.0" } : {}),
    ...(q.extra_apis?.includes("pusher") ? { pusher: "^5.2.0", "pusher-js": "^8.4.0" } : {}),
    ...(q.extra_apis?.includes("algolia") ? { algoliasearch: "^5.0.0" } : {}),
    ...(q.extra_apis?.includes("mapbox") ? { "mapbox-gl": "^3.7.0" } : {}),
    ...(q.extra_apis?.includes("twilio") ? { twilio: "^5.3.0" } : {}),
    // CMS
    ...(q.cms === "payload" ? {
      payload: "^3.0.0",
      "@payloadcms/next": "^3.0.0",
      "@payloadcms/richtext-lexical": "^3.0.0",
      ...(q.database === "mongodb" ? { "@payloadcms/db-mongodb": "^3.0.0" } : { "@payloadcms/db-postgres": "^3.0.0" }),
    } : {}),
    ...(q.cms === "sanity" ? { "next-sanity": "^9.0.0", "@sanity/image-url": "^1.0.3", sanity: "^3.60.0" } : {}),
    ...(q.cms === "contentful" ? { contentful: "^11.0.0" } : {}),
    // Features
    ...(q.animations === "rich" ? { "framer-motion": "^12.0.0" } : {}),
    ...(q.features?.includes("i18n") ? { "next-intl": "^3.20.0" } : {}),
    ...(q.features?.includes("analytics") ? { "@vercel/analytics": "^1.3.0" } : {}),
    ...(q.features?.includes("pwa") ? { "@ducanh2912/next-pwa": "^10.0.0" } : {}),
    ...(needsThemes ? { "next-themes": "^0.4.6" } : {}),
    ...(q.project_type === "game" ? { phaser: "^3.86.0" } : {}),
  };

  const devDeps: Record<string, string> = {
    typescript: "^5.0.0",
    eslint: "^9.0.0",
    prettier: "^3.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    ...(q.database === "prisma_postgres" || q.database === "planetscale" ? { prisma: "^6.0.0" } : {}),
    ...(q.extra_apis?.includes("mapbox") ? { "@types/mapbox-gl": "^3.4.0" } : {}),
  };

  const overrides: Record<string, string> = {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    // Force React 19 compatible versions of common offenders
    "next-themes": "^0.4.6",
    ...(isCatalina ? { esbuild: "0.17.19", tsx: "3.14.0" } : {}),
  };

  const pkg = {
    name,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "type-check": "tsc --noEmit",
    },
    dependencies: deps,
    devDependencies: devDeps,
    overrides,
    engines: { node: `>=${q.node_version ?? "18"}.0.0` },
  };

  return JSON.stringify(pkg, null, 2);
}

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
    // 1 — package.json (deterministic — never via Claude to avoid wrong versions)
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    emit([makeFile("package.json", buildPackageJson(questionnaire))]);

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

    // Inject ThemeToggle deterministically — Navbar always imports it for system_toggle, but Claude often omits the file
    if (questionnaire.color_scheme === "system_toggle") {
      const ext = questionnaire.language === "typescript" ? "tsx" : "jsx";
      const themeToggle = `"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
`;
      emit([makeFile(`src/components/ui/ThemeToggle.${ext}`, themeToggle)]);
    }

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
