import type { ProjectQuestionnaire } from "@/types";

export function getSystemPrompt(): string {
  return `You are an expert software engineer generating complete, production-quality starter projects.

ABSOLUTE RULES — never break these:

IMPORTS & PACKAGES:
1. NEVER import from '@supabase/auth-helpers-nextjs' — deprecated, not installed. Use '@supabase/ssr': createBrowserClient (client components), createServerClient (server/route handlers).
2. NEVER import from 'next/router' — App Router uses 'next/navigation' (useRouter, usePathname, useSearchParams).
3. Only import packages listed in package.json. Never invent packages that weren't specified.
4. Every import path must resolve: if you import '@/components/X', that file must also be generated in this same response or a previous step.

TAILWIND CSS (v4):
5. globals.css first line MUST be: @import "tailwindcss"; — NEVER @tailwind base/components/utilities.
6. In @layer components, NEVER use @apply with a class you defined yourself. @apply ONLY works with built-in Tailwind utilities (bg-blue-500, flex, etc). If .btn-primary uses gradient-primary, inline the gradient classes directly instead.
7. NEVER create custom utility classes like 'border-border', 'bg-background', 'text-foreground' and then @apply them — those aren't Tailwind utilities. Use hsl(var(--border)) in plain CSS or inline Tailwind color classes.

NEXT.JS APP ROUTER:
8. FULL file paths always — "src/app/page.tsx" not "page.tsx".
9. Every file 100% complete — no "// TODO", no "// implement here", no truncation, no "...".
10. App Router only — never Pages Router (no pages/ directory, no getServerSideProps, no getStaticProps).
11. Client components that use hooks (useState, useEffect, useRouter, etc.) MUST have "use client"; as the very first line.
12. Server components must NOT use useState, useEffect, or browser APIs.

next.config.ts:
13. Valid top-level keys ONLY: images, reactStrictMode, experimental, env, redirects, rewrites, headers. NEVER add typescript, eslint, compiler, or unknown keys.
14. In experimental: NEVER use dynamicIO, ppr, or any flag marked canary-only. Only stable flags.

OUTPUT FORMAT:
15. When returning JSON: ONLY the raw JSON object. Zero markdown fences, zero explanation, nothing before or after {.
16. Apply design_style and color_scheme to every UI file.
17. animations="none" → no motion. "subtle" → CSS transitions only. "moderate" → CSS + IntersectionObserver. "rich" → framer-motion.
18. Implement every item in features[].`;
}

function stackSummary(q: ProjectQuestionnaire): string {
  return [
    `Project name: ${q.project_name}`,
    `Project type: ${q.project_type}`,
    `Framework: ${q.framework}`,
    `Language: ${q.language}`,
    `Styling: ${q.styling}`,
    `Database: ${q.database}`,
    q.cms !== "none" ? `CMS: ${q.cms}` : null,
    q.auth !== "none" ? `Auth: ${q.auth}` : null,
    q.payments !== "none" ? `Payments: ${q.payments}` : null,
    q.extra_apis && q.extra_apis.length > 0 ? `Extra APIs: ${q.extra_apis.join(", ")}` : null,
    q.design_style ? `Design style: ${q.design_style}` : null,
    q.color_scheme ? `Color scheme: ${q.color_scheme}` : null,
    q.animations ? `Animations: ${q.animations}` : null,
    q.font_pairing ? `Typography: ${q.font_pairing}` : null,
    q.features && q.features.length > 0 ? `Features: ${q.features.join(", ")}` : null,
    `Description: ${q.description}`,
  ].filter(Boolean).join("\n");
}

const ext = (q: ProjectQuestionnaire) => q.language === "typescript" ? "ts" : "js";
const tsx = (q: ProjectQuestionnaire) => q.language === "typescript" ? "tsx" : "jsx";

function jsonInstruction(): string {
  return `Return a JSON object: { "full/path/file.ext": "complete file content", ... }
Return ONLY the JSON. No markdown, no explanation, no text outside the JSON.`;
}

// ─── Step 1: package.json ─────────────────────────────────────────────────────

export function getPackageJsonPrompt(q: ProjectQuestionnaire): string {
  const name = q.project_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `Generate a complete, valid package.json for this project.

${stackSummary(q)}

Requirements:
- "name": "${name}"
- Use EXACT pinned versions listed below — do not substitute newer versions. These are tested compatible.
- devDependencies: typescript: ^5.0.0, eslint: ^9.0.0, prettier: ^3.0.0, @types/node: ^22.0.0, @types/react: ^19.0.0, @types/react-dom: ^19.0.0
- scripts: { "dev": "next dev", "build": "next build", "start": "next start", "lint": "next lint", "type-check": "tsc --noEmit" }

${q.node_version === "18" ? `NODE 18 CONSTRAINT: Node 18 does not support some newer package APIs. Use these safe versions:
- next: 14.2.18 (Next 15 requires Node 18.18+, pin to 14 for safety)
- Do NOT use packages that require Node 20+` :
q.node_version === "20" ? `NODE 20: Use current stable versions. Next.js 15 works fine on Node 20.` :
`NODE 22: Use latest stable versions.`}

${q.dev_os === "macos_catalina" ? `MACOS CATALINA CONSTRAINT: macOS 10.15 cannot run esbuild 0.20+ (missing _SecTrustCopyCertificateChain symbol). Pin in overrides: esbuild: "0.17.19", tsx: "3.14.0". Also avoid any package whose native binary requires macOS 12+.` : ""}

Required dependencies (use these exact version ranges):
${q.framework === "nextjs" ? `- next: ${q.node_version === "18" ? "14.2.18" : q.cms === "payload" ? "15.4.11" : "^15.0.0"}, react: ^19.0.0, react-dom: ^19.0.0` : ""}
${q.styling === "tailwind" ? "- tailwindcss: ^4.0.0, @tailwindcss/postcss: ^4.0.0" : ""}
${q.styling === "styled_components" ? "- styled-components: ^6.0.0" : ""}
- clsx: ^2.1.0, tailwind-merge: ^2.5.0, lucide-react: ^0.460.0
${q.database === "supabase" ? "- @supabase/supabase-js: ^2.46.0, @supabase/ssr: ^0.5.0" : ""}
${q.database === "prisma_postgres" || q.database === "planetscale" ? "- @prisma/client: ^6.0.0\n- prisma: ^6.0.0 (devDependency)" : ""}
${q.database === "mongodb" ? "- mongoose: ^8.0.0" : ""}
${q.database === "firebase" ? "- firebase: ^11.0.0" : ""}
${q.auth === "nextauth" ? "- next-auth: ^5.0.0" : ""}
${q.auth === "clerk" ? "- @clerk/nextjs: ^6.0.0" : ""}
${q.auth === "lucia" ? "- lucia: ^3.0.0, oslo: ^1.2.0" : ""}
${q.payments === "stripe" ? "- stripe: ^17.0.0, @stripe/stripe-js: ^4.0.0" : ""}
${q.payments === "lemonsqueezy" ? "- @lemonsqueezy/lemonsqueezy-js: ^1.3.0" : ""}
${q.extra_apis?.includes("resend") ? "- resend: ^4.0.0" : ""}
${q.extra_apis?.includes("openai") ? "- openai: ^4.70.0" : ""}
${q.extra_apis?.includes("anthropic") ? "- @anthropic-ai/sdk: ^0.39.0" : ""}
${q.extra_apis?.includes("cloudinary") ? "- cloudinary: ^2.5.0, next-cloudinary: ^6.0.0" : ""}
${q.extra_apis?.includes("pusher") ? "- pusher: ^5.2.0, pusher-js: ^8.4.0" : ""}
${q.extra_apis?.includes("algolia") ? "- algoliasearch: ^5.0.0" : ""}
${q.extra_apis?.includes("mapbox") ? "- mapbox-gl: ^3.7.0, @types/mapbox-gl: ^3.4.0" : ""}
${q.extra_apis?.includes("twilio") ? "- twilio: ^5.3.0" : ""}
${q.cms === "payload" ? `- payload: ^3.0.0, @payloadcms/next: ^3.0.0, @payloadcms/richtext-lexical: ^3.0.0${q.database === "mongodb" ? ", @payloadcms/db-mongodb: ^3.0.0" : ", @payloadcms/db-postgres: ^3.0.0"}` : ""}
${q.cms === "sanity" ? "- next-sanity: ^9.0.0, @sanity/image-url: ^1.0.3, sanity: ^3.60.0" : ""}
${q.cms === "contentful" ? "- contentful: ^11.0.0" : ""}
${q.animations === "rich" ? "- framer-motion: ^12.0.0" : ""}
${q.features?.includes("i18n") ? "- next-intl: ^3.20.0" : ""}
${q.features?.includes("analytics") ? "- @vercel/analytics: ^1.3.0" : ""}
${q.features?.includes("pwa") ? "- @ducanh2912/next-pwa: ^10.0.0" : ""}
${q.project_type === "game" ? "- phaser: ^3.86.0" : ""}

Include an "overrides" field to force React 19 across all transitive deps:
{
  "overrides": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"${q.dev_os === "macos_catalina" ? `,
    "esbuild": "0.17.19",
    "tsx": "3.14.0"` : ""}
  }
}

Include an "engines" field: { "node": ">=${q.node_version ?? "18"}.0.0" }

Return ONLY the raw JSON content of package.json. No markdown, no explanation.`;
}

// ─── Step 2: Config files ─────────────────────────────────────────────────────

export function getConfigFilesPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);
  return `Generate configuration files for this project.

${stackSummary(q)}

Generate ALL of these files exactly as named:
${q.framework === "nextjs" ? `- "next.config.ts" — Next.js 15 config.${q.cms === "payload" ? ` Must use: import { withPayload } from '@payloadcms/next/withPayload'; export default withPayload(nextConfig);` : ""} Valid top-level keys ONLY: images, reactStrictMode, experimental, env, redirects, rewrites, headers${q.cms === "payload" ? ", withPayload wrapper" : ""}. NEVER add typescript, eslint, or compiler keys — those belong in tsconfig.json not here. For experimental: NEVER use dynamicIO, ppr, or any canary-only flags — only use stable experimental options like serverActions. Keep it minimal.
- "tsconfig.json" — TypeScript config. compilerOptions: target ES2017, lib [dom, dom.iterable, esnext], jsx preserve, strict true, moduleResolution bundler, paths {"@/*": ["./src/*"]}. TypeScript strict mode goes HERE, not in next.config.ts.
- "postcss.config.mjs" — PostCSS config${q.styling === "tailwind" ? ` with @tailwindcss/postcss plugin: export default { plugins: { '@tailwindcss/postcss': {} } }` : ""}.
${q.styling === "tailwind" ? `- "src/app/globals.css" — CRITICAL: This project uses Tailwind CSS v4. The ONLY correct first line is: @import "tailwindcss"; — do NOT use @tailwind base, @tailwind components, or @tailwind utilities (those are Tailwind v3 and will cause a fatal error). After the import, add CSS custom properties for theme colors and fonts based on ${q.design_style} style and ${q.color_scheme} scheme.` : ""}` : ""}
${q.framework === "astro" ? `- "astro.config.mjs" — Astro config
- "tsconfig.json" — TypeScript config for Astro` : ""}
${q.framework === "remix" ? `- "remix.config.js" — Remix config
- "tsconfig.json" — TypeScript config for Remix` : ""}
${q.framework === "vue" ? `- "nuxt.config.ts" — Nuxt 3 config
- "tsconfig.json" — TypeScript config` : ""}
- ".gitignore" — Include: .env .env.local .env*.local node_modules .next dist build out .DS_Store *.log .vercel
- ".eslintrc.json" — ESLint for ${q.language} with next/core-web-vitals
- ".prettierrc" — Prettier: semi true, singleQuote false, tabWidth 2, trailingComma es5
${q.features?.includes("pwa") ? `- "public/manifest.json" — PWA manifest with name, short_name "${q.project_name}", icons array, theme_color, background_color, display standalone` : ""}

${jsonInstruction()}`;
}

// ─── Step 3: .env.example ─────────────────────────────────────────────────────

export function getEnvExamplePrompt(q: ProjectQuestionnaire): string {
  return `Generate a .env.example file for this project. This file is shown to developers so they know what to fill in.

${stackSummary(q)}

Include ALL of these environment variable groups, each with a comment explaining the service and where to get the keys:

${q.database === "supabase" ? `# Supabase — https://supabase.com/dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=` : ""}
${q.database === "planetscale" || q.database === "prisma_postgres" ? `# Database — Your Postgres/PlanetScale connection string
DATABASE_URL=` : ""}
${q.database === "mongodb" ? `# MongoDB — https://mongodb.com/atlas → Connect → Drivers
MONGODB_URI=` : ""}
${q.database === "firebase" ? `# Firebase — https://console.firebase.google.com → Project Settings → General
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=` : ""}
${q.auth === "nextauth" ? `# NextAuth — Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000` : ""}
${q.auth === "clerk" ? `# Clerk — https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` : ""}
${q.payments === "stripe" ? `# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` : ""}
${q.payments === "lemonsqueezy" ? `# Lemon Squeezy — https://app.lemonsqueezy.com/settings/api
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STORE_ID=` : ""}
${q.cms === "payload" ? `# Payload CMS — Generate: openssl rand -base64 32
PAYLOAD_SECRET=
DATABASE_URI=` : ""}
${q.cms === "sanity" ? `# Sanity — https://sanity.io/manage → Project → API
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=` : ""}
${q.cms === "contentful" ? `# Contentful — https://app.contentful.com → Settings → API Keys
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_PREVIEW_ACCESS_TOKEN=` : ""}
${q.extra_apis?.includes("cloudinary") ? `# Cloudinary — https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=` : ""}
${q.extra_apis?.includes("resend") ? `# Resend — https://resend.com/api-keys
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com` : ""}
${q.extra_apis?.includes("openai") ? `# OpenAI — https://platform.openai.com/api-keys
OPENAI_API_KEY=` : ""}
${q.extra_apis?.includes("anthropic") ? `# Anthropic — https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=` : ""}
${q.extra_apis?.includes("mapbox") ? `# Mapbox — https://account.mapbox.com/access-tokens
NEXT_PUBLIC_MAPBOX_TOKEN=` : ""}
${q.extra_apis?.includes("pusher") ? `# Pusher — https://dashboard.pusher.com/apps
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_CLUSTER=eu` : ""}
${q.extra_apis?.includes("algolia") ? `# Algolia — https://dashboard.algolia.com/account/api-keys
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=` : ""}
${q.extra_apis?.includes("twilio") ? `# Twilio — https://console.twilio.com
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=` : ""}

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

Return ONLY the .env.example content. No markdown fences, no extra text.`;
}

// ─── Step 4: Database schema ──────────────────────────────────────────────────

export function getDatabaseSchemaPrompt(q: ProjectQuestionnaire): string {
  if (q.database === "supabase") {
    return `Generate a complete Supabase SQL schema for a ${q.project_type} application.

${stackSummary(q)}

Requirements:
- Enable uuid-ossp extension
- profiles table (id uuid references auth.users, email text, full_name text, avatar_url text, created_at timestamptz, updated_at timestamptz)
- Trigger: auto-create profile row on auth.users insert
- All tables needed for a ${q.project_type} app — think about what data models this needs
- Row Level Security (RLS) enabled on every table with correct policies
- Indexes on all foreign key columns
- created_at / updated_at columns on all tables
- Useful enums for status fields

Return ONLY the SQL. No markdown fences.`;
  }

  if (q.database === "prisma_postgres" || q.database === "planetscale") {
    return `Generate a complete Prisma schema for a ${q.project_type} application.

${stackSummary(q)}

Requirements:
- generator client block with output = "../node_modules/.prisma/client"
- datasource db block with provider = "${q.database === "planetscale" ? "mysql" : "postgresql"}" and url = env("DATABASE_URL")
- All models for a ${q.project_type} app
- User model with id, email, name, createdAt, updatedAt
- Proper @relation annotations, @@index on foreign keys
- Enums for status/type fields
- @default(now()) createdAt, @updatedAt updatedAt on all models

Return ONLY the Prisma schema content. No markdown fences.`;
  }

  if (q.database === "mongodb") {
    return `Generate Mongoose model files for a ${q.project_type} application as a JSON object.

${stackSummary(q)}

Generate all models needed. Each model file at "src/models/ModelName.ts" must:
- Define a TypeScript interface
- Create a Mongoose schema with proper types
- Add timestamps: true
- Export the model with proper typing to prevent re-compilation in dev

${jsonInstruction()}`;
  }

  if (q.database === "firebase") {
    return `Generate Firebase config files for a ${q.project_type} application.

${stackSummary(q)}

Generate:
- "firestore.rules" — Firestore security rules appropriate for a ${q.project_type} app
- "src/lib/firebase.ts" — Firebase app initialization, auth, firestore, storage exports

${jsonInstruction()}`;
  }

  return "";
}

// ─── Step 5a: Root app files (layout, page, globals, middleware) ──────────────

export function getRootFilesPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);
  const e = ext(q);

  const files: string[] = [];

  if (q.framework === "nextjs") {
    files.push(`"src/app/layout.${t}":
  - Root layout component.
  - Font setup from next/font/google: ${
      q.font_pairing === "geist" ? "Import { GeistSans } from 'geist/font/sans'" :
      q.font_pairing === "playfair" ? "Import Playfair_Display and Lato, apply both as CSS variables" :
      q.font_pairing === "sora" ? "Import Sora" :
      q.font_pairing === "space_grotesk" ? "Import Space_Grotesk" :
      q.font_pairing === "cal_sans" ? "Import Cal_Sans (if unavailable use Plus_Jakarta_Sans) + Inter" :
      q.font_pairing === "mono" ? "Import JetBrains_Mono" :
      "Import Inter"
    }
  - Set metadata: title "${q.project_name}", description from the project description.
  - HTML structure: <html lang="en"><body className={font.className}>{children}</body></html>
  ${q.styling === "tailwind" ? "- Import './globals.css'" : ""}
  ${q.auth === "clerk" ? "- Wrap children with <ClerkProvider>" : ""}
  ${q.features?.includes("analytics") ? "- Include <Analytics /> from @vercel/analytics/react" : ""}
  ${q.color_scheme === "system_toggle" ? "- Include ThemeProvider wrapper for dark/light toggle" : ""}`);

    files.push(`"src/app/not-found.${t}":
  - 404 page with a friendly message
  - Link back to homepage
  - Styled consistently with the ${q.design_style} design style`);

    // Generate page.tsx + every section component it imports in the SAME step
    // so there are never missing module errors.
    const homeSections = q.project_type === "ecommerce" || q.project_type === "marketplace"
      ? ["HeroSection", "CategoryGrid", "FeaturedProducts", "PromoBanner", "BenefitsRow", "NewsletterSection"]
      : q.project_type === "saas" || q.project_type === "dashboard"
      ? ["HeroSection", "FeaturesGrid", "TestimonialsSection", "PricingSection", "CTASection"]
      : q.project_type === "landing"
      ? ["HeroSection", "FeaturesGrid", "TestimonialsSection", "PricingSection", "FAQSection", "CTASection"]
      : q.project_type === "blog"
      ? ["HeroSection", "FeaturedPosts", "CategoriesRow", "NewsletterSection"]
      : q.project_type === "photography"
      ? ["HeroSection", "GalleryPreview", "AboutSection", "ContactSection"]
      : q.project_type === "portfolio"
      ? ["HeroSection", "ProjectsPreview", "SkillsSection", "AboutSection", "ContactSection"]
      : q.project_type === "booking"
      ? ["HeroSection", "ServicesGrid", "HowItWorks", "TestimonialsSection", "CTASection"]
      : q.project_type === "social" || q.project_type === "forum"
      ? ["HeroSection", "FeedPreview", "FeaturesGrid", "CTASection"]
      : q.project_type === "directory"
      ? ["HeroSection", "SearchSection", "FeaturedListings", "CategoriesGrid", "CTASection"]
      : q.project_type === "game"
      ? ["HeroSection", "GamePreview", "FeaturesGrid", "CTASection"]
      : ["HeroSection", "FeaturesGrid", "CTASection"];

    files.push(`"src/app/page.${t}":
  - Homepage that imports ONLY these section components (all generated below):
    ${homeSections.map(s => `import ${s} from '@/components/home/${s}';`).join("\n    ")}
  - page.tsx body: render sections in order: <main>{${homeSections.map(s => `<${s} />`).join("")}}</main>
  - No inline section code in page.tsx — everything is in the component files below
  - Content about: ${q.description}`);

    // Co-generate every section component that page.tsx imports
    homeSections.forEach(section => {
      const sectionDesc =
        section === "HeroSection" ? `Full-width hero. Large headline, subheadline relevant to "${q.description}". ${q.project_type === "ecommerce" || q.project_type === "marketplace" ? 'Two CTA buttons (Shop Now + View Deals). Badge: "Free shipping over $50". Background: bold gradient.' : "Primary CTA button. Gradient or image background. Real copy."} ${q.animations !== "none" ? "Entrance animations." : ""}` :
        section === "CategoryGrid" ? `4-6 category cards in a responsive grid. Each: icon/emoji, category name, item count. Hover lift effect. Links to /products?category=X.` :
        section === "FeaturedProducts" ? `4-column responsive grid of product cards. Each card: gradient placeholder image, product name, price (bold), star rating row, "Add to Cart" button. Real product names from: ${q.description}.` :
        section === "PromoBanner" ? `Full-width colored strip. Bold headline, discount offer, CTA button. High-contrast colors.` :
        section === "BenefitsRow" ? `Row of 4 benefit items: Free Shipping, Easy Returns, Secure Payment, 24/7 Support. Each: lucide icon + title + short description.` :
        section === "NewsletterSection" ? `Email signup. Headline, subheadline, email input + submit button in a row. Success state shows confirmation message.` :
        section === "FeaturesGrid" ? `3-column grid (1 col mobile) of feature cards. 6 features with lucide icon in colored box, title, description. Relevant to: ${q.description}.` :
        section === "TestimonialsSection" ? `3 testimonial cards in a grid. Each: star rating, quote, avatar placeholder circle, name, role/company. Real-sounding names and quotes.` :
        section === "PricingSection" ? `3 pricing plan cards. Middle plan highlighted with primary color border + "Most popular" badge. Features checklist. CTA button.` :
        section === "CTASection" ? `Full-width section with large headline, subheadline, primary CTA button. Contrasting background color.` :
        section === "FAQSection" ? `Accordion FAQ. 6 questions and answers relevant to ${q.description}. Click to expand/collapse.` :
        section === "FeaturedPosts" ? `Grid of 3 blog post preview cards. Each: cover image placeholder, category badge, title, excerpt, author + date.` :
        section === "CategoriesRow" ? `Horizontal scrollable row of category pills/cards with icons.` :
        section === "GalleryPreview" ? `4-6 photo placeholder cards in a masonry-style grid. "View All" button.` :
        section === "AboutSection" ? `Two-column layout: text left (headline, bio/description, bullet points), image placeholder right.` :
        section === "ContactSection" ? `Contact form: name, email, message fields + submit button. Success/error states.` :
        section === "ProjectsPreview" ? `Grid of 3 portfolio project cards with image placeholder, title, tags, links.` :
        section === "SkillsSection" ? `Skill badges grid grouped by category (Frontend, Backend, Tools).` :
        section === "ServicesGrid" ? `Grid of service cards: icon, name, description, price, "Book Now" button.` :
        section === "HowItWorks" ? `3-step process with numbered circles, title, description per step. Connected by line on desktop.` :
        section === "FeedPreview" ? `2-3 sample post cards showing the platform's content format.` :
        section === "GamePreview" ? `Game screenshot/preview area with description and play button.` :
        section === "FeaturedListings" ? `Grid of listing cards with image, title, price/category, rating.` :
        section === "SearchSection" ? `Large search input with filters. Prominent placement.` :
        section === "CategoriesGrid" ? `Grid of category cards with icon and count.` :
        `Section for ${section} relevant to ${q.description}.`;

      files.push(`"src/components/home/${section}.${t}":
  - ${sectionDesc}
  - Fully styled with ${q.styling} using ${q.design_style} design and ${q.color_scheme} color scheme
  - Production quality — polished, not a template placeholder
  - Uses lucide-react for icons, real copy relevant to: ${q.description}`);
    });

    if (q.auth !== "none") {
      files.push(`"src/app/(auth)/login/page.${t}":
  - Sign-in form with email + password fields
  - Form submission calls ${q.auth} sign-in
  - Link to signup page
  - Error display on invalid credentials
  - Styled consistently`);

      files.push(`"src/app/(auth)/signup/page.${t}":
  - Registration form with name, email, password fields
  - Form submission calls ${q.auth} sign-up
  - Link to login page
  - Styled consistently`);
    }

    if (q.auth === "supabase_auth" || q.auth === "nextauth" || q.auth === "clerk") {
      files.push(`"src/middleware.${e}":
  - Protect routes: /dashboard/*, /account/*, /admin/*
  - Redirect unauthenticated users to /login
  - Use ${q.auth === "clerk" ? "clerkMiddleware from @clerk/nextjs/server" : q.auth === "nextauth" ? "withAuth from next-auth/middleware" : "createServerClient from @supabase/ssr to check session"}`);
    }

    if (q.auth === "supabase_auth") {
      files.push(`"src/app/auth/callback/route.${e}":
  - Exchange Supabase auth code for session
  - Redirect to /dashboard on success`);
    }
  }

  if (q.framework === "astro") {
    files.push(
      `"src/layouts/Layout.astro" — Base layout with <head> (meta, title, fonts), nav slot, <main>, footer`,
      `"src/pages/index.astro" — Homepage for ${q.project_type} with hero and features sections`,
      `"src/styles/global.css" — CSS reset, custom properties, base styles`
    );
  }

  if (q.framework === "remix") {
    files.push(
      `"app/root.tsx" — Remix root with Links, Meta, Scripts, Outlet, global error boundary`,
      `"app/routes/_index.tsx" — Homepage for ${q.project_type}`,
      `"app/styles/global.css" — Global styles`
    );
  }

  return `Generate root/layout application files as a JSON object. Keys = FULL file paths from project root. Values = complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n\n")}

CRITICAL component structure rules:
- NEVER put Navbar, Footer, Sidebar, or any reusable UI inside page.tsx inline — always import them from @/components/layout/Navbar, @/components/layout/Footer etc.
- src/app/layout.tsx must import <Navbar /> and <Footer /> from @/components/layout/ and render them around {children}
- page.tsx files contain ONLY page-specific content sections — no nav, no footer, no header chrome
- page.tsx may ONLY import components that are explicitly listed as files being generated in THIS response — never invent import paths for files not in this list
- Every component file is independently editable without touching page.tsx

Every file must be 100% complete and functional. Use ${q.styling === "tailwind" ? "Tailwind CSS classes" : q.styling} for styling.
Every client component (uses hooks, event handlers, browser APIs) MUST have "use client"; as line 1.
Never @apply a custom class from @layer components — only @apply built-in Tailwind utilities.

${jsonInstruction()}`;
}

// ─── Step 5b: Lib/utility files ───────────────────────────────────────────────

export function getLibFilesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);
  const files: string[] = [];

  files.push(`"src/lib/utils.${e}":
  - cn() function using clsx + tailwind-merge
  - formatDate(date: string | Date): string — human-readable date
  - formatCurrency(amount: number, currency?: string): string — locale currency format
  - slugify(text: string): string — convert to URL-safe slug
  - truncate(text: string, maxLength: number): string`);

  if (q.database === "supabase") {
    files.push(
      `"src/lib/supabase/client.${e}" — createBrowserClient from @supabase/ssr. Export createClient() for browser.`,
      `"src/lib/supabase/server.${e}" — createServerClient from @supabase/ssr with Next.js cookies(). Export async createClient().`
    );
  }

  if (q.database === "prisma_postgres" || q.database === "planetscale") {
    files.push(`"src/lib/db.${e}" — PrismaClient singleton. Use global var to prevent multiple instances in dev hot reload. Export db.`);
  }

  if (q.database === "mongodb") {
    files.push(`"src/lib/mongodb.${e}" — Mongoose connection singleton. Cache connection in global. Export connectDB() async function.`);
  }

  if (q.payments === "stripe") {
    files.push(`"src/lib/stripe.${e}" — Server-side Stripe client: export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {apiVersion: "2024-10-28"}). Also export getStripePublic() for client-side.`);
  }

  if (q.auth === "nextauth") {
    files.push(`"src/lib/auth.${e}" — NextAuth v5 config. Providers: Credentials (email/password), GitHub, Google. Callbacks: session, jwt. Pages: {signIn: "/login"}. Export { auth, handlers, signIn, signOut }.`);
  }

  if (q.extra_apis?.includes("resend")) {
    files.push(`"src/lib/email.${e}" — Resend client. Export sendEmail({to, subject, html}) async function with error handling.`);
  }

  if (q.extra_apis?.includes("openai")) {
    files.push(`"src/lib/openai.${e}" — OpenAI client singleton. Export openai instance.`);
  }

  if (q.extra_apis?.includes("anthropic")) {
    files.push(`"src/lib/anthropic.${e}" — Anthropic client singleton. Export anthropic instance.`);
  }

  if (q.extra_apis?.includes("cloudinary")) {
    files.push(`"src/lib/cloudinary.${e}" — Configure cloudinary v2 with env vars. Export uploadImage(file: File) async helper returning secure_url.`);
  }

  if (q.features?.includes("dark_mode") || q.color_scheme === "system_toggle") {
    files.push(`"src/lib/theme.${e}" — ThemeProvider component using next-themes or localStorage. Export ThemeProvider and useTheme hook.`);
  }

  if (files.length === 0) return "";

  return `Generate lib/utility files as a JSON object. Keys = FULL file paths from project root. Values = complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n\n")}

All files must be complete and production-quality.

${jsonInstruction()}`;
}

// ─── Step 5c: Feature pages ───────────────────────────────────────────────────

export function getFeaturePagesPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);
  const files: string[] = [];

  if (q.framework !== "nextjs") return "";

  if (q.project_type === "saas" || q.project_type === "dashboard") {
    files.push(
      `"src/app/dashboard/layout.${t}" — Dashboard layout. Renders <Sidebar /> on left, <main> on right. Fetches current user from ${q.database === "supabase" ? "Supabase" : "database"}. Redirects to /login if not authenticated.`,
      `"src/app/dashboard/page.${t}" — Main dashboard. Shows welcome message, stats grid (4 StatsCards), recent activity table. Real data fetched from DB.`,
      `"src/app/account/page.${t}" — User account/profile settings page. Form to update name, email, avatar.`,
    );
    if (q.payments !== "none") {
      files.push(`"src/app/pricing/page.${t}" — Pricing page with 3 plan cards. Each has a "Subscribe" button that hits the checkout API.`);
    }
  } else if (q.project_type === "ecommerce" || q.project_type === "marketplace") {
    files.push(
      `"src/app/products/page.${t}" — Products listing page. Layout: left filter sidebar (sticky, 260px) + right product grid. Sidebar: category checkboxes, price range slider, rating filter, "Clear filters" button. Top bar: result count + sort dropdown (Featured, Price low-high, Price high-low, Newest). Grid: responsive 2-4 columns of ProductCard. Skeleton loading state. Empty state with illustration. Breadcrumb at top.`,
      `"src/app/products/[slug]/page.${t}" — Product detail page. Layout: left column image gallery (main image + 4 thumbnail row), right column product info. Info column: breadcrumb, name (h1), star rating + review count, price (large, bold) with original crossed-out if on sale, color/size variant selector (button group), quantity stepper, "Add to Cart" (full width, primary) + "Save to Wishlist" buttons, shipping badge ("Free delivery"), accordion for Description / Specifications / Reviews.`,
      `"src/app/cart/page.${t}" — Shopping cart page. Two-column layout: left = cart items list (CartItem components), right = sticky OrderSummary sidebar. CartItem: product thumbnail, name, variant, unit price, quantity +/- stepper, remove button. OrderSummary: subtotal, shipping (free over threshold), taxes, bold total, Checkout button, PayPal/Apple Pay logos, security badges (SSL lock icon). Empty cart state with illustration and "Continue Shopping" link.`,
    );
  } else if (q.project_type === "blog") {
    files.push(
      `"src/app/blog/page.${t}" — Blog index. Fetches posts. Renders grid of <PostCard> components. Includes category filter.`,
      `"src/app/blog/[slug]/page.${t}" — Post detail. Renders <PostHeader>, post body content, author bio, related posts.`,
    );
  } else if (q.project_type === "photography") {
    files.push(
      `"src/app/gallery/page.${t}" — Gallery index. Shows all albums as cards with cover photo, title, photo count.`,
      `"src/app/gallery/[album]/page.${t}" — Album detail. Renders <GalleryGrid> with all photos. Clicking a photo opens <Lightbox>.`,
    );
  } else if (q.project_type === "portfolio") {
    files.push(
      `"src/app/work/page.${t}" — Portfolio projects listing. Grid of <ProjectCard> components.`,
      `"src/app/work/[slug]/page.${t}" — Case study detail with cover image, description, tech stack, live link.`,
      `"src/app/about/page.${t}" — About page with bio, skills, experience timeline, contact CTA.`,
    );
  } else if (q.project_type === "social" || q.project_type === "forum") {
    files.push(
      `"src/app/feed/page.${t}" — Main feed with posts/threads list.`,
      `"src/app/feed/[id]/page.${t}" — Single post/thread detail with comments.`,
      `"src/app/profile/[username]/page.${t}" — User profile page.`,
    );
  } else if (q.project_type === "booking") {
    files.push(
      `"src/app/services/page.${t}" — Services/offerings listing page.`,
      `"src/app/booking/page.${t}" — Booking form with date picker, time slots, service selection.`,
      `"src/app/dashboard/page.${t}" — Provider dashboard showing upcoming bookings.`,
    );
  } else if (q.project_type === "directory") {
    files.push(
      `"src/app/listings/page.${t}" — Directory listings with search and filter.`,
      `"src/app/listings/[slug]/page.${t}" — Individual listing detail page.`,
      `"src/app/submit/page.${t}" — Form to submit a new listing.`,
    );
  } else if (q.project_type === "game") {
    files.push(
      `"src/app/game/page.${t}" — Game page. Renders the Phaser.js game canvas in a client component. Loads the game config.`,
      `"src/game/config.${ext(q)}" — Phaser game config object: type AUTO, parent 'game', scene list.`,
      `"src/game/scenes/MainScene.${ext(q)}" — Main Phaser scene class extending Phaser.Scene. Implements preload(), create(), update(). Full working game logic.`,
    );
  } else if (q.project_type === "landing") {
    files.push(
      `"src/app/page.${t}" — Enhanced landing page. Hero section, features grid, testimonials section (3 testimonials), pricing preview, FAQ accordion, newsletter signup, footer. All with real copy about: ${q.description}`,
    );
  }

  // API backend
  if (q.project_type === "api_backend") {
    files.push(
      `"src/app/api/v1/route.${ext(q)}" — API index with available endpoints list.`,
      `"src/app/api/v1/[resource]/route.${ext(q)}" — Generic REST resource handler (GET list, POST create).`,
      `"src/app/api/v1/[resource]/[id]/route.${ext(q)}" — Single resource handler (GET, PUT, DELETE).`,
    );
  }

  if (files.length === 0) return "";

  return `Generate feature/page files as a JSON object. Keys = FULL file paths from project root. Values = complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n\n")}

Requirements:
- Every file complete — no truncation, no placeholders
- Pages should fetch real data from ${q.database !== "none" ? q.database : "local state or mock data"}
- Use @/ path alias for all imports
- Apply ${q.design_style} design style and ${q.color_scheme} color scheme consistently
- page.tsx files import components from @/components/ — never define reusable UI inline in a page file
- Each logical section of a page (hero, product grid, filters, cart summary) must be its own component file
- Client components using hooks or event handlers MUST start with "use client"; on line 1
- NEVER @apply a custom class name — only built-in Tailwind utilities in @apply

${jsonInstruction()}`;
}

// ─── Step 6a: UI primitive components ────────────────────────────────────────

export function getUIPrimitivesPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);

  return `Generate UI primitive components as a JSON object.

${stackSummary(q)}

Generate these 5 files exactly:

- "src/components/ui/Button.${t}":
  Props: variant (primary|secondary|outline|ghost|destructive), size (sm|md|lg), loading (boolean), disabled, onClick, href, children, className
  If href provided, render as <a> or Next.js <Link>
  Loading state: spinner icon + disabled
  Full TypeScript props interface

- "src/components/ui/Card.${t}":
  Sub-components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  Each accepts className prop
  Proper TypeScript interfaces

- "src/components/ui/Input.${t}":
  Props: label, error, helperText, type, placeholder, value, onChange, name, id, required, disabled, className
  Shows red border + error message when error prop set
  Full TypeScript interface

- "src/components/ui/Badge.${t}":
  Props: variant (default|success|warning|danger|info|outline), size (sm|md), children, className
  Color variants actually implemented with ${q.styling === "tailwind" ? "Tailwind classes" : "CSS"}

- "src/components/ui/Modal.${t}":
  Props: open, onClose, title, children, size (sm|md|lg)
  Backdrop click closes modal
  Escape key closes modal
  useEffect for keyboard listener
  Portal or fixed positioning

All styled with ${q.styling === "tailwind" ? "Tailwind CSS" : q.styling}. Match the ${q.design_style} design style.

${jsonInstruction()}`;
}

// ─── Step 6b: Layout components ───────────────────────────────────────────────

export function getLayoutComponentsPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);

  return `Generate layout components as a JSON object.

${stackSummary(q)}

Generate these files:

- "src/components/layout/Navbar.${t}":
  - Logo/brand name "${q.project_name}" on the left
  - Navigation links relevant to a ${q.project_type} site
  ${q.auth !== "none" ? `- Auth state: if logged in show user avatar + dropdown (profile, settings, sign out); if logged out show Login + Sign Up buttons` : "- CTA button on right"}
  ${q.auth === "supabase_auth" ? `- CRITICAL: Use createBrowserClient from '@supabase/ssr' to get session. NEVER import from '@supabase/auth-helpers-nextjs' — that package is deprecated and not installed.` : ""}
  ${q.color_scheme === "system_toggle" ? `- Import ThemeToggle from '@/components/ui/ThemeToggle' and render it in the navbar` : `- CRITICAL: do NOT import or use ThemeToggle — this project does not have a dark/light toggle`}
  - Mobile hamburger menu that opens a drawer/sheet
  - Sticky on scroll

- "src/components/layout/Footer.${t}":
  - Logo + tagline
  - 3-4 column links grid (Product, Company, Legal, Social)
  - Copyright line with current year
  - Social media icons (GitHub, Twitter/X, LinkedIn)

${q.color_scheme === "system_toggle" ? `- "src/components/ui/ThemeToggle.${t}":
  - Button that toggles between dark and light mode
  - Sun/Moon icons (use lucide-react)
  - Reads/writes to localStorage and applies class to document.documentElement` : ""}

Styled with ${q.styling === "tailwind" ? "Tailwind CSS" : q.styling}. Match ${q.design_style} design style and ${q.color_scheme} color scheme.

CRITICAL: Every component with useState/useEffect/useRouter MUST start with "use client"; on line 1.
CRITICAL: Only @apply built-in Tailwind utilities. Never @apply a class you defined in @layer components.

${jsonInstruction()}`;
}

// ─── Step 6c: Feature-specific components ────────────────────────────────────

export function getFeatureComponentsPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);
  const e = ext(q);

  const files: string[] = [];

  if (q.project_type === "ecommerce" || q.project_type === "marketplace") {
    files.push(
      `"src/components/products/ProductCard.${t}" — Polished product card. Props: id, name, price, originalPrice?, image, slug, rating, reviewCount, badge? (e.g. "Sale", "New", "Low Stock"). Layout: square image container (aspect-ratio: 1/1) with next/image, badge chip top-left, wishlist heart button top-right (hover reveal). Below image: category label (small muted text), product name (font-medium, 2 lines truncate), star rating row (filled stars + count), price row (current price bold + originalPrice crossed out in muted color if sale). "Add to Cart" button appears on hover with slide-up animation. Full card is a link to /products/[slug].`,
      `"src/components/products/ProductGrid.${t}" — Responsive product grid. Props: products[], loading?, columns? (default 4). Uses CSS grid: 1 col mobile, 2 col sm, 3 col md, 4 col lg. Loading state renders 8 skeleton cards (pulsing gray placeholders). Empty state shows search icon + "No products found" + clear filters link.`,
      `"src/components/cart/CartItem.${t}" — Cart line item row. Props: id, name, price, quantity, image, variant?, slug, onRemove, onQuantityChange. Layout: product thumbnail (64x64, rounded, next/image), product info column (name linked to product, variant in muted text, unit price), quantity stepper (minus button, number input, plus button — min 1), line total (price × qty, bold), trash icon remove button. Hover highlights row.`,
      `"src/components/cart/CartSummary.${t}" — Sticky order summary card. Props: items[], shippingThreshold (default 50), onCheckout, loading?. Shows: "Order Summary" heading, itemised list of name+qty+price, divider, subtotal row, shipping row (free if above threshold, else calculated), tax row (estimated), bold total row, primary "Proceed to Checkout" button (full width, shows spinner when loading), divider, PayPal alternative button (outlined), trust badges row (lock icon "Secure checkout", shield "Buyer protection").`,
    );
  } else if (q.project_type === "photography") {
    files.push(
      `"src/components/gallery/GalleryGrid.${t}" — CSS masonry photo gallery. Props: photos[] with { src, alt, width, height, title? }, onPhotoClick. Uses CSS columns (2 col mobile, 3 col md, 4 col lg) for masonry effect. Each photo uses next/image with hover overlay (darkens + shows title + expand icon). Subtle gap between photos.`,
      `"src/components/gallery/PhotoCard.${t}" — Single photo card. Props: src, alt, title?, albumName?, onClick. next/image with fill layout inside aspect-ratio container. Hover: overlay fades in with title + icon. Cursor pointer. Transition duration 300ms.`,
      `"src/components/gallery/Lightbox.${t}" — Full-screen photo lightbox. Props: photos[], currentIndex, isOpen, onClose, onPrev, onNext. Fixed overlay (backdrop blur + dark bg). Center: large photo with next/image. Left/right arrow buttons. Keyboard: ← → navigate, Escape close. Photo counter "3 / 24". Close button top-right. Swipe gesture support via touch events.`,
    );
  } else if (q.project_type === "saas" || q.project_type === "dashboard") {
    files.push(
      `"src/components/dashboard/Sidebar.${t}" — Collapsible sidebar nav. Props: items[] with { label, href, icon (lucide name), badge? }. Width 240px expanded / 64px collapsed. Collapse toggle button at bottom. Active route highlighted (primary bg, white text) using usePathname. Each item: icon + label in expanded, icon only with tooltip in collapsed. Section dividers with muted labels. User profile row at bottom (avatar, name, email, settings icon).`,
      `"src/components/dashboard/StatsCard.${t}" — KPI metric card. Props: title, value (string), change (number, percent), trend ('up'|'down'|'neutral'), icon (lucide name), color? ('blue'|'green'|'orange'|'purple'). Layout: icon in colored rounded square (top-left), value (large bold), title (muted small), trend chip (arrow + percent, green if up, red if down). Subtle hover shadow.`,
      `"src/components/dashboard/DataTable.${t}" — Sortable data table. Props: columns[] with { key, label, sortable?, render? }, data[], onRowClick?, loading?, emptyMessage?. Column header click toggles sort asc/desc (shows arrow icon). Striped rows. Loading state: skeleton rows. Empty state: icon + message. Pagination controls (prev/next + page info). Sticky header.`,
      `"src/components/dashboard/ChartCard.${t}" — Chart container card. Props: title, subtitle?, children (chart content), actions? (JSX buttons top-right). Wraps any chart library output in a styled card with header.`,
    );
  } else if (q.project_type === "blog") {
    files.push(
      `"src/components/blog/PostCard.${t}" — Blog post preview card. Props: title, slug, excerpt (max 160 chars), publishedAt, readingTime, author ({ name, avatarUrl }), coverImage, category, featured?. Layout: cover image top (16/9 aspect, next/image), category badge (colored pill), title (hover underline), excerpt (2 lines), author row (avatar + name + date + reading time). Featured variant is larger with horizontal layout.`,
      `"src/components/blog/PostHeader.${t}" — Article page header. Props: title, publishedAt, updatedAt?, author ({ name, bio, avatarUrl, twitter? }), coverImage, readingTime, category, tags[]. Full-width cover image with overlay gradient. Below: category badge, h1 title (large), tag row, author card (avatar, name, bio excerpt, social links), meta row (date, reading time, share buttons).`,
      `"src/components/blog/TableOfContents.${t}" — Sticky floating ToC. Props: headings[] with { id, text, level }. Fixed sidebar (desktop) or collapsible (mobile). Highlights active section as user scrolls using IntersectionObserver.`,
    );
  } else if (q.project_type === "portfolio") {
    files.push(
      `"src/components/portfolio/ProjectCard.${t}" — Portfolio project card. Props: title, description, image, tags[], liveUrl?, githubUrl?, featured?. Image container with hover zoom (scale-105 transition). Gradient overlay on image. Below: title, description (3 lines truncate), tech tag badges. Footer: GitHub icon link + external link icon — both open in new tab. Featured variant: full-width horizontal layout with larger image.`,
      `"src/components/portfolio/SkillBadge.${t}" — Technology skill badge. Props: name, icon? (svg or emoji), level? ('beginner'|'intermediate'|'expert'), color?. Pill with icon + name. Optional proficiency bar below (thin colored bar). Groups well in a flex-wrap grid.`,
      `"src/components/portfolio/TimelineItem.${t}" — Experience/education timeline entry. Props: title, company, period, description, tags[], logo?. Left: vertical line + dot. Right: date range (muted), job title (bold), company + logo, description, tech tags.`,
    );
  } else if (q.project_type === "social" || q.project_type === "forum") {
    files.push(
      `"src/components/feed/PostCard.${t}" — Social post / forum thread card. Props: author (name, username, avatarUrl), content (text, up to 500 chars), createdAt, likes, replies, reposts, tags[], mediaUrls?[]. Layout: avatar left, content right. Header: display name (bold) + @username + timestamp (relative e.g. "2h ago"). Content body with hashtag highlighting. Media grid (1-4 images in responsive grid). Action row: Like (heart, toggles red), Reply (speech bubble), Repost, Share — each with count. Full card is clickable to thread detail.`,
      `"src/components/feed/CommentThread.${t}" — Threaded comment list. Props: comments[] with id, author (name+avatarUrl), content, createdAt, likes, children[]. Renders recursively up to 3 levels deep with left indent line. Each comment: avatar, author name+timestamp, content, like+reply actions. "Load more replies" expander for 3+ children.`,
    );
  } else if (q.project_type === "booking") {
    files.push(
      `"src/components/booking/DatePicker.${t}" — Full calendar date picker. Props: value, onChange, minDate, maxDate, disabledDates[]. Shows current month grid (7-column weekday header + day cells). Prev/next month navigation. Days before minDate are dimmed. disabledDates shown with strikethrough. Selected day highlighted with primary color circle. Today marker with dot.`,
      `"src/components/booking/TimeSlots.${t}" — Time slot selector grid. Props: slots[] with { time, available, price? }, selectedSlot, onSelect. Renders as responsive button grid (3-4 columns). Available slots: outlined button, hover fill. Unavailable: gray + "Full" label + disabled. Selected: filled primary. Shows slot count summary ("8 of 12 slots available").`,
      `"src/components/booking/BookingCard.${t}" — Service/provider card. Props: name, description, duration (mins), price, image, rating, reviewCount, tags[]. Image top, content bottom. Tags as small badges. Duration + price in a row. "Book Now" button.`,
    );
  } else if (q.project_type === "landing") {
    files.push(
      `"src/components/landing/HeroSection.${t}" — Full-width hero. Props: headline, subheadline, ctaPrimary ({label, href}), ctaSecondary? ({label, href}), badge? (small label above headline), stats? ([{value, label}]). Layout: centered or split (text left, image/graphic right). Gradient or image background. Headline uses large responsive type (text-4xl → text-7xl). Social proof: "Trusted by X+ companies" with logo strip or avatar stack + star rating. Stats row below CTAs.`,
      `"src/components/landing/FeaturesGrid.${t}" — Features section. Props: title, subtitle, features[] with { icon (lucide name), title, description, color? }. 3-column grid (1 col mobile). Each feature: icon in colored rounded square, bold title, muted description. Optional: alternating left/right layout for main features.`,
      `"src/components/landing/TestimonialsSection.${t}" — Testimonials. Props: testimonials[] with { quote, author, role, company, avatarUrl, rating }. Card grid (3 cols) or carousel with prev/next arrows. Each card: star rating, quote in italic, avatar + name + role. Background: subtle pattern or solid section color to stand out from page.`,
      `"src/components/landing/PricingCards.${t}" — Pricing section. Props: plans[] with { name, price, period, description, features[], cta, highlighted? }. 3-column card layout. Highlighted plan has primary color border, "Most popular" badge, slightly larger scale. Features list with check icons. Annual/monthly toggle at top.`,
    );
  }

  if (q.extra_apis?.includes("resend")) {
    files.push(`"src/components/forms/ContactForm.${t}" — Contact form. Fields: name, email, subject, message. Client-side validation. Submits to /api/contact. Shows success/error state.`);
  }

  if (q.extra_apis?.includes("openai") || q.extra_apis?.includes("anthropic")) {
    files.push(`"src/components/chat/ChatInterface.${t}" — Chat UI component. Messages list (user + assistant). Input box at bottom. Streams responses from /api/chat using fetch with ReadableStream.`);
  }

  if (q.features?.includes("search")) {
    files.push(`"src/components/ui/SearchBar.${t}" — Search bar with debounced input. Props: onSearch, placeholder, isLoading. Shows loading spinner while searching.`);
  }

  if (q.features?.includes("file_upload")) {
    files.push(`"src/components/ui/FileUpload.${t}" — Drag-and-drop file upload zone. Props: accept, maxSize, onUpload, multiple. Shows upload progress, preview for images.`);
  }

  // Types file always
  files.push(`"src/types/index.${e}" — TypeScript interfaces for all data models: User, ${
    q.project_type === "ecommerce" || q.project_type === "marketplace" ? "Product, Order, CartItem, Category" :
    q.project_type === "blog" ? "Post, Author, Category, Comment" :
    q.project_type === "photography" ? "Photo, Album, Gallery" :
    q.project_type === "saas" || q.project_type === "dashboard" ? "UserProfile, Subscription, Analytics" :
    q.project_type === "booking" ? "Service, Booking, TimeSlot, Provider" :
    q.project_type === "forum" || q.project_type === "social" ? "Post, Comment, Profile, Thread" :
    "ApiResponse, PaginatedResponse, ErrorResponse"
  }. Export all as named types.`);

  if (files.length === 0) {
    files.push(`"src/types/index.${e}" — TypeScript interfaces for all data models used in this ${q.project_type} application.`);
  }

  return `Generate feature-specific components as a JSON object.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n\n")}

Requirements:
- Every component complete — no truncation, no placeholders
- ${q.styling === "tailwind" ? "Tailwind CSS classes for all styling" : q.styling + " for all styling"}
- Proper TypeScript props interfaces with JSDoc if helpful
- Import from @/ path alias
- Every component using useState/useEffect/useRouter/event handlers MUST have "use client"; as line 1
- NEVER @apply a custom class — only built-in Tailwind utilities in @apply statements

${jsonInstruction()}`;
}

// ─── Step 7: API routes ───────────────────────────────────────────────────────

export function getApiRoutesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);

  const files: string[] = [];

  if (q.database === "supabase" && q.auth !== "none") {
    files.push(`"src/app/api/auth/callback/route.${e}" — Supabase OAuth callback. Exchange code for session using @supabase/ssr. Redirect to /dashboard on success.`);
  }

  if (q.auth === "nextauth") {
    files.push(`"src/app/api/auth/[...nextauth]/route.${e}" — NextAuth handlers. Export { GET, POST } = handlers from @/lib/auth.`);
  }

  if (q.payments === "stripe") {
    files.push(
      `"src/app/api/stripe/checkout/route.${e}" — Create Stripe Checkout Session. Accept {priceId, successUrl, cancelUrl} in body. Return {url}.`,
      `"src/app/api/stripe/webhook/route.${e}" — Handle Stripe webhooks. Verify signature with stripe.webhooks.constructEvent. Handle checkout.session.completed: update user subscription. Handle customer.subscription.deleted.`,
      `"src/app/api/stripe/portal/route.${e}" — Create Customer Portal session. Return {url}. For subscription management.`,
    );
  }

  if (q.payments === "lemonsqueezy") {
    files.push(`"src/app/api/lemonsqueezy/webhook/route.${e}" — Lemon Squeezy webhook handler. Verify signature. Handle order_created, subscription_created, subscription_cancelled events.`);
  }

  if (q.extra_apis?.includes("resend")) {
    files.push(`"src/app/api/contact/route.${e}" — POST /api/contact. Validate name, email, message. Send email via Resend. Rate limit: 1 request per IP per minute. Return {success: true}.`);
  }

  if (q.extra_apis?.includes("openai")) {
    files.push(`"src/app/api/chat/route.${e}" — POST /api/chat. Accept {messages: [{role, content}]}. Stream response using OpenAI streaming with ReadableStream. Set headers for SSE.`);
  }

  if (q.extra_apis?.includes("anthropic")) {
    files.push(`"src/app/api/chat/route.${e}" — POST /api/chat. Accept {messages: [{role, content}]}. Stream response using Anthropic streaming. Return SSE stream.`);
  }

  if (q.features?.includes("file_upload") && q.extra_apis?.includes("cloudinary")) {
    files.push(`"src/app/api/upload/route.${e}" — POST /api/upload. Accept multipart/form-data with file field. Upload to Cloudinary. Return {url, publicId}.`);
  }

  if (q.project_type === "ecommerce" || q.project_type === "marketplace") {
    files.push(
      `"src/app/api/products/route.${e}" — GET: list products with pagination (?page, ?limit, ?category). POST: create product (admin only). Return {products, total, page}.`,
      `"src/app/api/products/[id]/route.${e}" — GET single product. PUT update product. DELETE product. Auth checks.`,
      `"src/app/api/orders/route.${e}" — GET user's orders. POST create order: validate cart, check stock, create order row, return order ID.`,
    );
  } else if (q.project_type === "blog") {
    files.push(
      `"src/app/api/posts/route.${e}" — GET: list published posts (?page, ?category, ?search). POST: create post (authenticated).`,
      `"src/app/api/posts/[slug]/route.${e}" — GET single post by slug, increment view count. PUT: update post. DELETE: delete post.`,
    );
  } else if (q.project_type === "saas" || q.project_type === "dashboard") {
    files.push(
      `"src/app/api/user/route.${e}" — GET: return current user profile from DB. PATCH: update name, avatar. Return updated profile.`,
    );
  } else if (q.project_type === "booking") {
    files.push(
      `"src/app/api/bookings/route.${e}" — GET user's bookings. POST create booking: check availability, create record, send confirmation email if Resend configured.`,
      `"src/app/api/slots/route.${e}" — GET available time slots. Accept ?date, ?serviceId. Return array of {time, available}.`,
    );
  }

  if (files.length === 0) {
    files.push(`"src/app/api/health/route.${e}" — GET /api/health. Return {status: "ok", timestamp: new Date().toISOString(), version: "1.0.0"}.`);
  }

  return `Generate API route files as a JSON object. Keys = FULL file paths from project root. Values = complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n\n")}

Requirements:
- Use Next.js App Router route handlers (export async function GET/POST/PUT/DELETE)
- Return NextResponse.json() with correct HTTP status codes
- Validate all inputs
- Include proper error handling: try/catch, meaningful error messages
- Use TypeScript types for request/response bodies

${jsonInstruction()}`;
}

// ─── Step 8: CMS files ────────────────────────────────────────────────────────

export function getCMSFilesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);
  const t = tsx(q);

  if (q.cms === "payload") {
    return `Generate Payload CMS v3 configuration files as a JSON object.

${stackSummary(q)}

Generate ALL of these files exactly:
- "payload.config.ts" — Main config. Exact imports: import { buildConfig } from 'payload'; import { lexicalEditor } from '@payloadcms/richtext-lexical'; import { ${q.database === "mongodb" ? "mongooseAdapter } from '@payloadcms/db-mongodb'" : "postgresAdapter } from '@payloadcms/db-postgres'"}. Collections: [Users, Media${q.project_type === "blog" ? ", Posts" : q.project_type === "ecommerce" ? ", Products" : ""}]. secret: process.env.PAYLOAD_SECRET. editor: lexicalEditor({}). serverURL: process.env.NEXT_PUBLIC_SERVER_URL.
- "src/payload/collections/Users.ts" — Users collection. auth: true. fields: name, role (admin|user enum).
- "src/payload/collections/Media.ts" — Media collection. upload: { staticDir: "public/media", mimeTypes: ["image/*", "video/*"] }.
${q.project_type === "blog" ? `- "src/payload/collections/Posts.ts" — Posts collection. fields: title, slug (unique), content (richText with lexical), author (relationship to Users), status (draft|published), publishedAt, featuredImage (relationship to Media), categories.` : ""}
${q.project_type === "ecommerce" ? `- "src/payload/collections/Products.ts" — Products collection. fields: name, slug, description, price (number), images (array of Media relationships), category, inventory (number), status.` : ""}
${q.project_type === "photography" ? `- "src/payload/collections/Photos.ts" — Photos collection. fields: title, image (Media relationship), album, description.\n- "src/payload/collections/Albums.ts" — Albums collection. fields: title, slug, coverImage (Media relationship), description.` : ""}
- "src/app/(payload)/admin/[[...segments]]/page.${t}" — import { RootPage, generatePageMetadata } from "@payloadcms/next/views"; export generatePageMetadata as generateMetadata; export RootPage as default.
- "src/app/(payload)/admin/[[...segments]]/not-found.${t}" — import { NotFoundPage } from "@payloadcms/next/views"; export NotFoundPage as default.
- "src/app/(payload)/api/[...slug]/route.${e}" — import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes"; import config from "@payload-config"; export all handlers.

${jsonInstruction()}`;
  }

  if (q.cms === "sanity") {
    return `Generate Sanity v3 configuration files as a JSON object.

${stackSummary(q)}

Generate:
- "sanity.config.ts" — defineConfig with projectId (env), dataset (env), plugins: [structureTool(), visionTool()], schema: { types: [...all schema types] }
- "sanity.cli.ts" — defineCliConfig with api: { projectId, dataset }
- "src/sanity/schemaTypes/index.ts" — Export array of all schema types
${q.project_type === "blog" ? `- "src/sanity/schemaTypes/post.ts" — Post document type. Fields: title, slug (slug type with current), body (block content array for portable text), author (reference to author), mainImage, publishedAt, categories[]` : ""}
${q.project_type === "photography" ? `- "src/sanity/schemaTypes/photo.ts" — Photo document type.\n- "src/sanity/schemaTypes/album.ts" — Album document type with photos array` : ""}
${q.project_type === "ecommerce" ? `- "src/sanity/schemaTypes/product.ts" — Product document type with name, slug, price, images, description (portable text)` : ""}
- "src/sanity/lib/client.ts" — createClient with projectId, dataset, apiVersion "2024-01-01", useCdn true
- "src/sanity/lib/queries.ts" — GROQ queries: exported const strings for fetchAll${q.project_type === "blog" ? "Posts, fetchPost(slug)" : q.project_type === "ecommerce" ? "Products, fetchProduct(slug)" : "Items, fetchItem(slug)"}
- "src/sanity/lib/image.ts" — imageUrl helper using @sanity/image-url. Export urlFor(source) function.
- "src/app/studio/[[...tool]]/page.${tsx(q)}" — "use client"; import { NextStudio } from "next-sanity/studio"; import config. export default function StudioPage() { return <NextStudio config={config} /> }

${jsonInstruction()}`;
  }

  if (q.cms === "contentful") {
    return `Generate Contentful integration files as a JSON object.

${stackSummary(q)}

Generate:
- "src/lib/contentful.${e}" — Contentful client: createClient({ space: process.env.CONTENTFUL_SPACE_ID!, accessToken: process.env.CONTENTFUL_ACCESS_TOKEN! }). Export client.
- "src/lib/contentful-types.${e}" — TypeScript interfaces for Contentful entries: ContentfulPost, ContentfulProduct, etc. matching the ${q.project_type} app needs.
- "src/lib/contentful-queries.${e}" — Helper functions: getEntries(contentType, options?), getEntry(id), getEntriesBySlug(contentType, slug). All async, return typed results.

${jsonInstruction()}`;
  }

  if (q.cms === "wordpress") {
    return `Generate WordPress headless integration files as a JSON object.

${stackSummary(q)}

Generate:
- "src/lib/wordpress.${e}" — WordPress REST API client. Base URL from env. Functions: getPosts(params?), getPost(slug), getPages(), getPage(slug), getCategories(), getTags(). All async with proper error handling and TypeScript return types.
- "src/lib/wordpress-types.${e}" — TypeScript interfaces for WP REST API: WPPost, WPPage, WPCategory, WPTag, WPAuthor, WPMedia, WPEmbedded.

${jsonInstruction()}`;
  }

  return "";
}

// ─── Step 9: Public folder ────────────────────────────────────────────────────

export function getPublicFilesPrompt(q: ProjectQuestionnaire): string {
  return `Generate public folder files as a JSON object.

${stackSummary(q)}

Generate ALL of these files:
- "public/favicon.svg" — SVG favicon. Simple, clean icon related to ${q.project_type}. Use a single path/shape. Size 32x32. Pick a brand color fitting the ${q.design_style} style.
- "public/og-image.svg" — Open Graph image. Exactly 1200x630 SVG. Project name "${q.project_name}" in large text. Brief tagline. Clean background color fitting the ${q.color_scheme} scheme. Professional layout.
- "public/robots.txt" — Allow all crawlers. Sitemap: https://example.com/sitemap.xml
- "public/sitemap.xml" — XML sitemap. Include homepage + main section pages. Use https://example.com as base URL.

${jsonInstruction()}`;
}

// ─── Step 10: README ──────────────────────────────────────────────────────────

export function getReadmePrompt(q: ProjectQuestionnaire): string {
  const pkgName = q.project_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `Generate a complete README.md for this project.

${stackSummary(q)}

The README must include:

# ${q.project_name}

> One-sentence description of the project.

Brief 2-3 sentence overview from: ${q.description}

## ✨ Features

- 8-10 specific features relevant to a ${q.project_type} app

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
(table row for each technology)

## 📁 Project Structure

\`\`\`
${pkgName}/
├── src/
│   ├── app/          # Next.js App Router pages + API routes
│   ├── components/   # React components
│   │   ├── ui/       # Primitives (Button, Card, Input...)
│   │   └── layout/   # Navbar, Footer
│   ├── lib/          # Utilities and service clients
│   └── types/        # TypeScript interfaces
├── public/           # Static assets
└── ...config files
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js ${q.node_version ?? "18"}+
- npm / yarn / pnpm
${q.database === "supabase" ? "- Supabase account (free tier works)" : ""}
${q.payments === "stripe" ? "- Stripe account" : ""}

${q.dev_os === "windows" ? `> **Windows users:** These commands use PowerShell. If you prefer, install [Git Bash](https://gitforwindows.org/) or enable WSL2 for a Linux-like experience.` : ""}
${q.dev_os === "macos_catalina" ? `> **macOS Catalina (10.15) note:** This project's \`package.json\` already pins \`esbuild\` and \`tsx\` to versions compatible with Catalina — newer versions require macOS 12+. If you see \`dyld: Symbol not found\` errors, ensure you haven't removed the \`overrides\` field.
> - Install Node.js via nvm: \`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash\` then \`nvm install ${q.node_version ?? "18"}\`
> - Install Xcode CLI tools if prompted: \`xcode-select --install\`` : ""}

### Installation

\`\`\`bash
git clone <your-repo>
cd ${pkgName}
npm install
${q.dev_os === "windows" ? `copy .env.example .env.local` : `cp .env.example .env.local`}
# Edit .env.local with your credentials
${q.database === "supabase" ? "# Run supabase/schema.sql in your Supabase SQL Editor" : ""}
${q.database === "prisma_postgres" || q.database === "planetscale" ? "npx prisma db push" : ""}
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
(one row per env var)

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project at vercel.com/new
3. Add environment variables in Vercel dashboard
4. Deploy
${q.payments === "stripe" ? "\n### Stripe Webhooks\nAfter deploying, set up Stripe webhook endpoint: \`https://yourdomain.com/api/stripe/webhook\`" : ""}

## 📝 License

MIT

Return ONLY the README.md content. No extra text.`;
}
