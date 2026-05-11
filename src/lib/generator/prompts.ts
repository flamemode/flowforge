import type { ProjectQuestionnaire } from "@/types";

export function getSystemPrompt(): string {
  return `You are an expert software engineer and architect. You generate production-quality, clean, well-structured code for developer starter projects.

Rules:
- Write complete, working code — no placeholders, no TODOs, no "add your code here"
- Use modern best practices for the chosen stack
- Include proper TypeScript types when TypeScript is selected
- Follow the conventions of each framework exactly
- Keep code clean and readable
- Generate real, useful boilerplate that a developer would actually want to start from`;
}

function stackSummary(q: ProjectQuestionnaire): string {
  const parts = [
    `Project type: ${q.project_type}`,
    `Framework: ${q.framework}`,
    `Language: ${q.language}`,
    `Styling: ${q.styling}`,
    `Database: ${q.database}`,
    q.cms !== "none" ? `CMS: ${q.cms}` : null,
    q.auth !== "none" ? `Auth: ${q.auth}` : null,
    q.payments !== "none" ? `Payments: ${q.payments}` : null,
    q.extra_apis.length > 0 ? `Extra APIs: ${q.extra_apis.join(", ")}` : null,
    `Description: ${q.description}`,
  ].filter(Boolean);
  return parts.join("\n");
}

export function getPackageJsonPrompt(q: ProjectQuestionnaire): string {
  return `Generate a complete package.json for this project:

${stackSummary(q)}
Project name: ${q.project_name.toLowerCase().replace(/\s+/g, "-")}

Include all required dependencies with realistic current version numbers.
Return ONLY the raw JSON content of package.json, nothing else.`;
}

export function getConfigFilesPrompt(q: ProjectQuestionnaire): string {
  return `Generate the following config files for this project as a JSON object where keys are file paths and values are file contents:

${stackSummary(q)}

Generate ALL of these files:
${q.framework === "nextjs" ? "- next.config.ts\n- tsconfig.json (if TypeScript)\n- postcss.config.js\n- tailwind.config.ts (if Tailwind)" : ""}
${q.framework === "astro" ? "- astro.config.mjs\n- tsconfig.json" : ""}
${q.framework === "remix" ? "- remix.config.js\n- tsconfig.json" : ""}
- .gitignore (comprehensive, includes .env*, node_modules, .next, dist, build)
- .eslintrc.json (if TypeScript)

Return a JSON object: { "filename": "content", ... }
Return ONLY the JSON object, no markdown, no explanation.`;
}

export function getEnvExamplePrompt(q: ProjectQuestionnaire): string {
  return `Generate a .env.example file for this project:

${stackSummary(q)}

Include ALL environment variables needed for:
${q.database === "supabase" ? "- Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)" : ""}
${q.database === "planetscale" ? "- PlanetScale (DATABASE_URL)" : ""}
${q.database === "mongodb" ? "- MongoDB (MONGODB_URI)" : ""}
${q.database === "firebase" ? "- Firebase (NEXT_PUBLIC_FIREBASE_API_KEY, etc.)" : ""}
${q.database === "prisma_postgres" ? "- Postgres (DATABASE_URL)" : ""}
${q.auth === "nextauth" ? "- NextAuth (NEXTAUTH_SECRET, NEXTAUTH_URL, OAuth provider keys)" : ""}
${q.auth === "clerk" ? "- Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)" : ""}
${q.payments === "stripe" ? "- Stripe (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)" : ""}
${q.payments === "lemonsqueezy" ? "- Lemon Squeezy (LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_WEBHOOK_SECRET)" : ""}
${q.extra_apis.includes("cloudinary") ? "- Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)" : ""}
${q.extra_apis.includes("resend") ? "- Resend (RESEND_API_KEY)" : ""}
${q.extra_apis.includes("openai") ? "- OpenAI (OPENAI_API_KEY)" : ""}
${q.extra_apis.includes("anthropic") ? "- Anthropic (ANTHROPIC_API_KEY)" : ""}
${q.extra_apis.includes("mapbox") ? "- Mapbox (NEXT_PUBLIC_MAPBOX_TOKEN)" : ""}
${q.extra_apis.includes("pusher") ? "- Pusher (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER)" : ""}
${q.extra_apis.includes("algolia") ? "- Algolia (NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_KEY, ALGOLIA_ADMIN_KEY)" : ""}
${q.extra_apis.includes("twilio") ? "- Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)" : ""}
- NEXT_PUBLIC_APP_URL=http://localhost:3000

Add helpful comments above each group explaining what they're for.
Return ONLY the .env.example file content, no markdown fences.`;
}

export function getDatabaseSchemaPrompt(q: ProjectQuestionnaire): string {
  return `Generate a complete database schema for this project:

${stackSummary(q)}

${q.database === "supabase" ? `Generate a Supabase SQL schema (supabase/schema.sql) with:
- All tables needed for a ${q.project_type} app
- Row Level Security policies
- Indexes on foreign keys
- Helper functions if needed
- Triggers (e.g. auto-create profile on user signup if auth is used)
Return ONLY the SQL, no markdown fences.` : ""}

${q.database === "prisma_postgres" || q.database === "planetscale" ? `Generate a Prisma schema (prisma/schema.prisma) with:
- All models needed for a ${q.project_type} app
- Proper relations
- Enums where appropriate
Return ONLY the Prisma schema content.` : ""}

${q.database === "mongodb" ? `Generate Mongoose models (src/models/) as a JSON object with file paths as keys:
- All models needed for a ${q.project_type} app
Return a JSON object: { "src/models/User.ts": "content", ... }` : ""}

${q.database === "firebase" ? `Generate Firebase security rules (firestore.rules) and initial data structure documentation as a comment.
Return ONLY the rules file content.` : ""}`;
}

export function getCoreFilesPrompt(q: ProjectQuestionnaire): string {
  const ext = q.language === "typescript" ? "ts" : "js";
  const tsx = q.language === "typescript" ? "tsx" : "jsx";

  return `Generate the core application files for this project as a JSON object where keys are file paths and values are complete file contents:

${stackSummary(q)}

Generate these files:
${q.framework === "nextjs" ? `
- src/app/layout.${tsx} (root layout with metadata, font, providers)
- src/app/globals.css (base styles${q.styling === "tailwind" ? ", Tailwind directives" : ""})
- src/app/page.${tsx} (homepage appropriate for ${q.project_type})
- src/lib/utils.${ext} (cn helper and common utilities)
${q.auth !== "none" ? `- src/app/auth/login/page.${tsx} (sign in page)
- src/app/auth/signup/page.${tsx} (sign up page)` : ""}
${(q.database === "supabase") ? `- src/lib/supabase/client.${ext} (browser client)
- src/lib/supabase/server.${ext} (server client)` : ""}
${q.database === "prisma_postgres" || q.database === "planetscale" ? `- src/lib/db.${ext} (Prisma client singleton)` : ""}
${q.payments === "stripe" ? `- src/lib/stripe.${ext} (Stripe client)` : ""}
${q.extra_apis.includes("resend") ? `- src/lib/email.${ext} (Resend email helper)` : ""}
` : ""}
${q.framework === "astro" ? `
- src/layouts/Layout.astro (base layout)
- src/pages/index.astro (homepage)
- src/styles/global.css
` : ""}

Return a JSON object: { "file/path.ext": "complete file content", ... }
Every file must be complete and working — no truncation, no placeholders.
Return ONLY the JSON object, no markdown, no explanation.`;
}

export function getComponentsPrompt(q: ProjectQuestionnaire): string {
  const tsx = q.language === "typescript" ? "tsx" : "jsx";

  return `Generate UI components for this project as a JSON object where keys are file paths and values are complete file contents:

${stackSummary(q)}

Generate these components appropriate for a ${q.project_type} project:
- src/components/ui/Button.${tsx} (primary button component)
- src/components/ui/Card.${tsx} (card component)
- src/components/layout/Navbar.${tsx} (navigation bar${q.auth !== "none" ? " with auth state" : ""})
- src/components/layout/Footer.${tsx} (footer)
${q.project_type === "ecommerce" ? `- src/components/ProductCard.${tsx}
- src/components/Cart.${tsx}` : ""}
${q.project_type === "photography" ? `- src/components/Gallery.${tsx}
- src/components/LightBox.${tsx}` : ""}
${q.project_type === "saas" ? `- src/components/PricingCard.${tsx}
- src/components/FeatureCard.${tsx}` : ""}
${q.project_type === "blog" ? `- src/components/PostCard.${tsx}
- src/components/PostList.${tsx}` : ""}
${q.project_type === "dashboard" ? `- src/components/StatsCard.${tsx}
- src/components/Sidebar.${tsx}` : ""}

Return a JSON object: { "file/path.ext": "complete file content", ... }
Every component must be complete — no truncation, no placeholders.
Return ONLY the JSON object, no markdown, no explanation.`;
}

export function getApiRoutesPrompt(q: ProjectQuestionnaire): string {
  const ext = q.language === "typescript" ? "ts" : "js";

  return `Generate API routes for this project as a JSON object where keys are file paths and values are complete file contents:

${stackSummary(q)}

Generate relevant API routes for a ${q.project_type} app:
${q.auth === "supabase_auth" || q.database === "supabase" ? `- src/app/api/auth/callback/route.${ext} (OAuth callback)` : ""}
${q.payments === "stripe" ? `- src/app/api/stripe/webhook/route.${ext} (Stripe webhook handler)
- src/app/api/stripe/checkout/route.${ext} (create checkout session)` : ""}
${q.project_type === "ecommerce" ? `- src/app/api/products/route.${ext}
- src/app/api/orders/route.${ext}` : ""}
${q.project_type === "saas" ? `- src/app/api/user/route.${ext}` : ""}
${q.project_type === "blog" ? `- src/app/api/posts/route.${ext}` : ""}
${q.extra_apis.includes("resend") ? `- src/app/api/email/route.${ext} (send email endpoint)` : ""}
${q.extra_apis.includes("openai") || q.extra_apis.includes("anthropic") ? `- src/app/api/ai/route.${ext} (AI chat/completion endpoint)` : ""}

Return a JSON object: { "file/path.ext": "complete file content", ... }
Every route must be complete and functional.
Return ONLY the JSON object, no markdown, no explanation.`;
}

export function getReadmePrompt(q: ProjectQuestionnaire): string {
  return `Generate a comprehensive README.md for this project:

${stackSummary(q)}
Project name: ${q.project_name}

Include:
1. Project title and description
2. Tech stack badges/list
3. Features list (relevant to ${q.project_type})
4. Prerequisites
5. Step-by-step Getting Started:
   - Clone repo
   - npm install
   - Copy .env.example to .env.local and fill in values
   - ${q.database === "supabase" ? "Run supabase/schema.sql in Supabase SQL Editor" : ""}
   - ${q.database === "prisma_postgres" || q.database === "planetscale" ? "npx prisma db push" : ""}
   - npm run dev
6. Environment variables explanation (what each one does)
7. Project structure overview
8. Deployment guide (Vercel recommended for Next.js)

Return ONLY the README.md content, no extra text.`;
}
