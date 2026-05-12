import type { ProjectQuestionnaire, GeneratedFile } from "@/types";
import { getAnthropicClient } from "@/lib/anthropic";
import { FILE_LANGUAGE_MAP } from "@/lib/constants";
import {
  getSystemPrompt,
  getEnvExamplePrompt,
  getDatabaseSchemaPrompt,
  getRootFilesPrompt,
  getHomeSectionsPrompt,
  getAuthPagesPrompt,
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
    // Attempt to fix truncated JSON by finding the last complete key-value pair.
    // Strategy: find the last occurrence of a complete "key": "value" pair ending
    // with either a comma+newline or just newline before the truncation point.
    // We try progressively from the end to find a valid parse.
    const patterns = ['",\n  "', '"\n}', '",\n"', '"\n'];
    for (const pattern of patterns) {
      let searchFrom = cleaned.length;
      // Try up to 5 positions from the end
      for (let i = 0; i < 5; i++) {
        const pos = cleaned.lastIndexOf(pattern, searchFrom - 1);
        if (pos === -1) break;
        const candidate = cleaned.slice(0, pos + 1) + "\n}";
        try {
          const result = JSON.parse(candidate);
          // Validate: drop the last entry if its value looks truncated
          // (doesn't end with common file endings like }, ;, or a closing tag)
          const keys = Object.keys(result);
          if (keys.length > 0) {
            const lastKey = keys[keys.length - 1];
            const lastValue = result[lastKey];
            if (lastValue && lastValue.length > 100 &&
                !lastValue.trimEnd().match(/[;}\]>)`'"]\s*$/) &&
                !lastValue.trimEnd().endsWith("*/")) {
              // Last file is likely truncated — remove it
              delete result[lastKey];
            }
          }
          return result;
        } catch { /* try next position */ }
        searchFrom = pos;
      }
    }
    console.error("Failed to parse JSON response:", cleaned.slice(0, 200));
    return {};
  }
}

function generateDeterministicConfigs(
  q: ProjectQuestionnaire
): Omit<GeneratedFile, "id" | "project_id" | "created_at">[] {
  const files: Omit<GeneratedFile, "id" | "project_id" | "created_at">[] = [];

  if (q.framework === "nextjs") {
    // tsconfig.json — always the same structure for Next.js
    files.push(makeFile("tsconfig.json", JSON.stringify({
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }, null, 2)));

    // next.config.ts — minimal, valid config
    const nextConfigLines = [
      `import type { NextConfig } from "next";`,
      ``,
      `const nextConfig: NextConfig = {`,
      `  reactStrictMode: true,`,
    ];
    if (q.cms === "payload") {
      nextConfigLines[0] = `import type { NextConfig } from "next";\nimport { withPayload } from "@payloadcms/next/withPayload";`;
    }
    nextConfigLines.push(`};`);
    nextConfigLines.push(``);
    if (q.cms === "payload") {
      nextConfigLines.push(`export default withPayload(nextConfig);`);
    } else {
      nextConfigLines.push(`export default nextConfig;`);
    }
    files.push(makeFile("next.config.ts", nextConfigLines.join("\n")));

    // postcss.config.mjs — critical for Tailwind v4
    if (q.styling === "tailwind") {
      files.push(makeFile("postcss.config.mjs", `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`));
    }
  }

  // .gitignore — always the same
  files.push(makeFile(".gitignore", [
    "node_modules",
    ".next",
    "dist",
    "build",
    "out",
    ".env",
    ".env.local",
    ".env*.local",
    ".DS_Store",
    "*.log",
    ".vercel",
    ".turbo",
  ].join("\n")));

  // .prettierrc
  files.push(makeFile(".prettierrc", JSON.stringify({
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  }, null, 2)));

  return files;
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
    // 1 — package.json (Sonnet: complex dependency resolution)
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    const pkgRaw = await callClaude(system, getPackageJsonPrompt(questionnaire), { model: SONNET, maxTokens: 3000 });
    emit([makeFile("package.json", pkgRaw.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "").trim())]);

    // 2a — Deterministic config files (never trust AI for these)
    onEvent({ type: "progress", data: { label: "Generating config files..." } });
    emit(generateDeterministicConfigs(questionnaire));

    // 2b — Remaining config files from Claude (non-critical ones like .eslintrc)
    const configPrompt = getConfigFilesPrompt(questionnaire);
    if (configPrompt) {
      await step("Generating config files...", () => configPrompt, { model: HAIKU, maxTokens: 4000 });
    }

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

    // 5a — Root files: layout, page, not-found (Sonnet: core app shell)
    await step("Generating app layout and pages...", () => getRootFilesPrompt(questionnaire), { maxTokens: 8000 });

    // 5a-ii — Home section components (separate to avoid truncation)
    const homeSectionsPrompt = getHomeSectionsPrompt(questionnaire);
    if (homeSectionsPrompt) {
      await step("Generating home sections...", () => homeSectionsPrompt, { maxTokens: 12000 });
    }

    // 5a-iii — Auth pages + middleware (separate call)
    const authPrompt = getAuthPagesPrompt(questionnaire);
    if (authPrompt) {
      await step("Generating auth pages...", () => authPrompt, { maxTokens: 6000 });
    }

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

    // ─── Final validation: check for broken @/ imports and generate stubs ──────
    const generatedPaths = new Set(allFiles.map(f => f.path));
    const missingImports = new Map<string, string[]>();

    for (const file of allFiles) {
      if (!file.content) continue;
      // Match import ... from '@/...' or import ... from "@/..."
      const importRegex = /from\s+['"]@\/([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(file.content)) !== null) {
        const importPath = match[1];
        // Resolve to possible file paths
        const candidates = [
          `src/${importPath}`,
          `src/${importPath}.ts`,
          `src/${importPath}.tsx`,
          `src/${importPath}/index.ts`,
          `src/${importPath}/index.tsx`,
        ];
        const exists = candidates.some(c => generatedPaths.has(c));
        if (!exists) {
          const resolved = `src/${importPath}`;
          if (!missingImports.has(resolved)) {
            missingImports.set(resolved, []);
          }
          missingImports.get(resolved)!.push(file.path);
        }
      }
    }

    // Generate stub files for missing imports to prevent "Module not found" crashes
    if (missingImports.size > 0) {
      const stubs: Omit<GeneratedFile, "id" | "project_id" | "created_at">[] = [];
      for (const [missingPath] of missingImports) {
        // Determine file extension
        const ext = questionnaire.language === "typescript" ? "tsx" : "jsx";
        let filePath = missingPath;
        if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) {
          filePath = `${missingPath}.${ext}`;
        }
        // Generate a simple stub component or module
        const componentName = missingPath.split("/").pop()?.replace(/\.(ts|tsx|js|jsx)$/, "") ?? "Component";
        const isComponent = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
        const stub = isComponent
          ? `export default function ${componentName}() {\n  return <div>{/* ${componentName} */}</div>;\n}\n`
          : `// ${componentName} stub\nexport {};\n`;
        stubs.push(makeFile(filePath, stub));
      }
      emit(stubs);
      console.warn(`Generated ${stubs.length} stub files for missing imports: ${[...missingImports.keys()].join(", ")}`);
    }

    onEvent({ type: "complete", data: {} });
    return allFiles;
  } catch (err) {
    onEvent({ type: "error", data: { message: String(err) } });
    throw err;
  }
}
