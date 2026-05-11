import type { CreditPack } from "@/types";

// ─── Credit packs ─────────────────────────────────────────────────────────────

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 1,
    price: 19,
    price_per_run: 19,
    tag: "Try it out",
  },
  {
    id: "studio",
    name: "Studio Pack",
    credits: 5,
    price: 59,
    price_per_run: 11.8,
    highlighted: true,
    tag: "Most popular",
  },
  {
    id: "agency",
    name: "Agency Pack",
    credits: 20,
    price: 149,
    price_per_run: 7.45,
    tag: "Best value",
  },
];

export const FREE_CREDITS = 2;
export const ITERATION_PRICE = 5;

// ─── Questionnaire options ────────────────────────────────────────────────────

export const PROJECT_TYPE_OPTIONS = [
  { value: "saas", label: "SaaS App", icon: "⚡" },
  { value: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { value: "photography", label: "Photography", icon: "📷" },
  { value: "portfolio", label: "Portfolio", icon: "🎨" },
  { value: "blog", label: "Blog / CMS", icon: "✍️" },
  { value: "dashboard", label: "Dashboard", icon: "📊" },
  { value: "landing", label: "Landing Page", icon: "🚀" },
  { value: "api_backend", label: "API / Backend", icon: "🔧" },
] as const;

export const FRAMEWORK_OPTIONS = [
  { value: "nextjs", label: "Next.js", description: "Full-stack React framework" },
  { value: "remix", label: "Remix", description: "Full-stack web framework" },
  { value: "astro", label: "Astro", description: "Content-focused framework" },
  { value: "vue", label: "Vue / Nuxt", description: "Progressive JS framework" },
  { value: "plain_html", label: "Plain HTML", description: "No framework" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "typescript", label: "TypeScript", description: "Recommended — type safety" },
  { value: "javascript", label: "JavaScript", description: "No types" },
] as const;

export const STYLING_OPTIONS = [
  { value: "tailwind", label: "Tailwind CSS", description: "Utility-first — most popular" },
  { value: "css_modules", label: "CSS Modules", description: "Scoped CSS files" },
  { value: "sass", label: "Sass / SCSS", description: "CSS preprocessor" },
  { value: "styled_components", label: "Styled Components", description: "CSS-in-JS" },
] as const;

export const DATABASE_OPTIONS = [
  { value: "supabase", label: "Supabase", description: "Postgres + Auth + Storage" },
  { value: "planetscale", label: "PlanetScale", description: "Serverless MySQL" },
  { value: "mongodb", label: "MongoDB", description: "Document database" },
  { value: "firebase", label: "Firebase", description: "Google NoSQL + Auth" },
  { value: "prisma_postgres", label: "Prisma + Postgres", description: "ORM + raw Postgres" },
  { value: "none", label: "None", description: "No database" },
] as const;

export const CMS_OPTIONS = [
  { value: "payload", label: "Payload CMS", description: "Code-first, TypeScript native" },
  { value: "sanity", label: "Sanity", description: "Structured content platform" },
  { value: "contentful", label: "Contentful", description: "Headless CMS" },
  { value: "wordpress", label: "WordPress (headless)", description: "WP REST API / GraphQL" },
  { value: "none", label: "None", description: "No CMS" },
] as const;

export const AUTH_OPTIONS = [
  { value: "supabase_auth", label: "Supabase Auth", description: "Built into Supabase" },
  { value: "nextauth", label: "NextAuth.js", description: "Flexible auth for Next.js" },
  { value: "clerk", label: "Clerk", description: "Drop-in auth UI + management" },
  { value: "lucia", label: "Lucia", description: "Lightweight auth library" },
  { value: "none", label: "None", description: "No auth" },
] as const;

export const PAYMENT_OPTIONS = [
  { value: "stripe", label: "Stripe", description: "Most popular payments" },
  { value: "lemonsqueezy", label: "Lemon Squeezy", description: "SaaS-focused payments" },
  { value: "none", label: "None", description: "No payments" },
] as const;

export const EXTRA_API_OPTIONS = [
  { value: "cloudinary", label: "Cloudinary", description: "Image/video hosting" },
  { value: "resend", label: "Resend", description: "Transactional email" },
  { value: "mapbox", label: "Mapbox", description: "Maps & geolocation" },
  { value: "openai", label: "OpenAI", description: "GPT + embeddings" },
  { value: "anthropic", label: "Anthropic", description: "Claude AI" },
  { value: "pusher", label: "Pusher", description: "Real-time websockets" },
  { value: "algolia", label: "Algolia", description: "Search-as-a-service" },
  { value: "twilio", label: "Twilio", description: "SMS / voice" },
] as const;

// ─── File language detection ──────────────────────────────────────────────────

export const FILE_LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  md: "markdown",
  sql: "sql",
  env: "bash",
  gitignore: "bash",
  sh: "bash",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
};
