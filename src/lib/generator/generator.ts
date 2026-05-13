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
  const isNextjs = q.framework === "nextjs";
  const isAstro = q.framework === "astro";
  const isRemix = q.framework === "remix";
  const isVue = q.framework === "vue";
  const isPlainHtml = q.framework === "plain_html";
  const usesReact = !isVue && !isPlainHtml; // Astro/Remix/Next all use React
  const isPayload = q.cms === "payload";
  const isCatalina = q.dev_os === "macos_catalina";
  const needsThemes = q.color_scheme === "system_toggle" || q.features?.includes("dark_mode");

  // Framework-specific scripts
  const scripts: Record<string, string> = isAstro
    ? { dev: "astro dev", build: "astro build", preview: "astro preview", "type-check": "tsc --noEmit" }
    : isRemix
    ? { dev: "remix dev", build: "remix build", start: "remix-serve ./build/server/index.js", "type-check": "tsc --noEmit" }
    : isVue
    ? { dev: "nuxt dev", build: "nuxt build", generate: "nuxt generate", preview: "nuxt preview", "type-check": "tsc --noEmit" }
    : isPlainHtml
    ? { dev: "npx serve .", build: "echo 'No build step'", "type-check": "tsc --noEmit" }
    : { dev: "next dev", build: "next build", start: "next start", lint: "next lint", "type-check": "tsc --noEmit" };

  const deps: Record<string, string> = {
    // Framework core
    ...(isNextjs ? { next: isPayload ? "15.4.11" : "^15.0.0" } : {}),
    ...(isAstro ? { astro: "^5.0.0", "@astrojs/react": "^4.0.0", "@astrojs/tailwind": "^5.1.0" } : {}),
    ...(isRemix ? { "@remix-run/node": "^2.15.0", "@remix-run/react": "^2.15.0", "@remix-run/serve": "^2.15.0", isbot: "^4.4.0" } : {}),
    ...(isVue ? { nuxt: "^3.14.0", vue: "^3.5.0" } : {}),
    // React (all frameworks except Vue and plain HTML)
    ...(usesReact ? { react: "^19.0.0", "react-dom": "^19.0.0" } : {}),
    // Utility
    clsx: "^2.1.0",
    ...(usesReact ? { "tailwind-merge": "^2.5.0", "lucide-react": "^0.460.0" } : {}),
    // Tailwind
    ...(q.styling === "tailwind" && !isVue ? { tailwindcss: "^4.0.0", "@tailwindcss/postcss": "^4.0.0" } : {}),
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
    ...(q.features?.includes("i18n") && isNextjs ? { "next-intl": "^3.20.0" } : {}),
    ...(q.features?.includes("analytics") && isNextjs ? { "@vercel/analytics": "^1.3.0" } : {}),
    ...(q.features?.includes("pwa") && isNextjs ? { "@ducanh2912/next-pwa": "^10.0.0" } : {}),
    ...(needsThemes && usesReact ? { "next-themes": "^0.4.6" } : {}),
    ...(q.project_type === "game" ? { phaser: "^3.86.0" } : {}),
  };

  const devDeps: Record<string, string> = {
    typescript: "^5.0.0",
    ...(isNextjs || isRemix ? { eslint: "^9.0.0" } : {}),
    prettier: "^3.0.0",
    "@types/node": "^22.0.0",
    ...(usesReact ? { "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0" } : {}),
    ...(isRemix ? { "@remix-run/dev": "^2.15.0", vite: "^6.0.0" } : {}),
    ...(isAstro ? { "@astrojs/ts-plugin": "^1.10.0" } : {}),
    ...(q.database === "prisma_postgres" || q.database === "planetscale" ? { prisma: "^6.0.0" } : {}),
    ...(q.extra_apis?.includes("mapbox") ? { "@types/mapbox-gl": "^3.4.0" } : {}),
  };

  // Overrides only relevant for React-based projects
  const overrides: Record<string, string> = usesReact ? {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "next-themes": "^0.4.6",
    ...(isCatalina ? { esbuild: "0.17.19", tsx: "3.14.0" } : {}),
  } : {
    ...(isCatalina ? { esbuild: "0.17.19" } : {}),
  };

  const pkg: Record<string, unknown> = {
    name,
    version: "1.0.0",
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
    ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
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

// ─── Deterministic config files builder ──────────────────────────────────────
// tsconfig, next.config, postcss, gitignore, eslint, prettier — never via Claude.

function buildConfigFiles(q: ProjectQuestionnaire): Omit<GeneratedFile, "id" | "project_id" | "created_at">[] {
  const files: Omit<GeneratedFile, "id" | "project_id" | "created_at">[] = [];
  const isNextjs = q.framework === "nextjs";
  const isAstro = q.framework === "astro";
  const isRemix = q.framework === "remix";
  const isVue = q.framework === "vue";
  const isTs = q.language !== "javascript";

  // tsconfig.json
  if (!isVue) {
    const tsconfig = {
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
        ...(isNextjs ? { plugins: [{ name: "next" }] } : {}),
        paths: { "@/*": ["./src/*"] },
      },
      include: isNextjs
        ? ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
        : ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules"],
    };
    files.push(makeFile("tsconfig.json", JSON.stringify(tsconfig, null, 2)));
  }

  // next.config.ts
  if (isNextjs) {
    const withPayload = q.cms === "payload";
    const nextConfig = withPayload
      ? `import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPayload(nextConfig);
`
      : `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
    files.push(makeFile("next.config.ts", nextConfig));
  }

  // postcss.config.mjs (Tailwind v4)
  if (q.styling === "tailwind" && !isVue) {
    files.push(makeFile("postcss.config.mjs", `export default {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n`));
  }

  // astro.config.mjs
  if (isAstro) {
    files.push(makeFile("astro.config.mjs", `import { defineConfig } from "astro/config";\nimport react from "@astrojs/react";\nimport tailwind from "@astrojs/tailwind";\n\nexport default defineConfig({\n  integrations: [react(), tailwind()],\n});\n`));
  }

  // vite.config.ts (Remix)
  if (isRemix) {
    files.push(makeFile("vite.config.ts", `import { vitePlugin as remix } from "@remix-run/dev";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  plugins: [remix()],\n});\n`));
  }

  // nuxt.config.ts
  if (isVue) {
    files.push(makeFile("nuxt.config.ts", `export default defineNuxtConfig({\n  devtools: { enabled: true },\n  modules: [],\n  css: [],\n});\n`));
  }

  // .gitignore
  files.push(makeFile(".gitignore", [
    "# dependencies",
    "node_modules",
    ".pnp",
    ".pnp.js",
    "",
    "# builds",
    ".next",
    "out",
    "dist",
    "build",
    ".astro",
    "",
    "# env",
    ".env",
    ".env.local",
    ".env.*.local",
    "",
    "# misc",
    ".DS_Store",
    "*.log",
    ".vercel",
    ".turbo",
  ].join("\n")));

  // .eslintrc.json (only for frameworks that use it)
  if (!isVue && !isAstro) {
    const eslintConfig = isNextjs
      ? { extends: ["next/core-web-vitals", ...(isTs ? ["next/typescript"] : [])] }
      : { extends: ["eslint:recommended", ...(isTs ? ["plugin:@typescript-eslint/recommended"] : [])] };
    files.push(makeFile(".eslintrc.json", JSON.stringify(eslintConfig, null, 2)));
  }

  // .prettierrc
  files.push(makeFile(".prettierrc", JSON.stringify({
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    printWidth: 100,
  }, null, 2)));

  // PWA manifest
  if (q.features?.includes("pwa")) {
    const manifest = {
      name: q.project_name,
      short_name: q.project_name.split(" ")[0],
      description: q.description,
      start_url: "/",
      display: "standalone",
      background_color: q.color_scheme === "dark" ? "#0a0a0a" : "#ffffff",
      theme_color: "#7c3aed",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    };
    files.push(makeFile("public/manifest.json", JSON.stringify(manifest, null, 2)));
  }

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
    // 1 — package.json (deterministic — never via Claude to avoid wrong versions)
    onEvent({ type: "progress", data: { label: "Generating package.json..." } });
    emit([makeFile("package.json", buildPackageJson(questionnaire))]);

    // 2 — Config files (deterministic — tsconfig, next.config, postcss, gitignore, eslint, prettier)
    onEvent({ type: "progress", data: { label: "Generating config files..." } });
    emit(buildConfigFiles(questionnaire));

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
