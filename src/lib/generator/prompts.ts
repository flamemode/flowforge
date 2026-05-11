import type { ProjectQuestionnaire } from "@/types";

export function getSystemPrompt(): string {
  return `You are an expert software engineer. You generate complete, production-quality starter projects.

CRITICAL RULES:
- Always use FULL file paths. For Next.js: "src/app/page.tsx", "src/components/ui/Button.tsx", "public/favicon.ico" etc.
- Never use short paths like "page.tsx" — always include the full path from project root.
- Write complete, working code — no placeholders, no TODOs, no "// add code here".
- Every file must be fully implemented and functional.
- Use TypeScript when the language is "typescript". Use .ts/.tsx extensions.
- Follow framework conventions exactly (Next.js App Router, not Pages Router).
- Honor the design_style and color_scheme fields: apply the correct color palette, typography, and spacing in all UI files.
- Honor the animations field: "none" means no transitions; "subtle" means CSS transitions only; "moderate" means CSS + scroll reveal; "rich" means framer-motion with page transitions and micro-interactions.
- Honor the features field: implement every selected feature (dark_mode toggle, SEO meta tags, PWA manifest, analytics script, search UI, notifications, file upload, admin panel, comments, social login, export buttons, i18n setup, multi-tenant middleware, rate limiting, webhooks).
- When returning JSON, return ONLY the raw JSON object. No markdown fences, no explanation, no text before or after.`;
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
    q.extra_apis.length > 0 ? `Extra APIs: ${q.extra_apis.join(", ")}` : null,
    q.design_style ? `Design style: ${q.design_style}` : null,
    q.color_scheme ? `Color scheme: ${q.color_scheme}` : null,
    q.animations ? `Animations: ${q.animations}` : null,
    q.features?.length > 0 ? `Features: ${q.features.join(", ")}` : null,
    `Description: ${q.description}`,
  ].filter(Boolean).join("\n");
}

const ext = (q: ProjectQuestionnaire) => q.language === "typescript" ? "ts" : "js";
const tsx = (q: ProjectQuestionnaire) => q.language === "typescript" ? "tsx" : "jsx";

// ─── Step 1: package.json ─────────────────────────────────────────────────────

export function getPackageJsonPrompt(q: ProjectQuestionnaire): string {
  const name = q.project_name.toLowerCase().replace(/\s+/g, "-");
  return `Generate a complete, valid package.json for this project:

${stackSummary(q)}

Requirements:
- name: "${name}"
- Include ALL required dependencies with real current version numbers
- Include devDependencies (TypeScript, ESLint, Prettier, types packages)
- Scripts: dev, build, start, lint, type-check
${q.framework === "nextjs" ? "- Next.js 15, React 19" : ""}
${q.styling === "tailwind" ? "- tailwindcss 4, @tailwindcss/vite or postcss" : ""}
${q.database === "supabase" ? "- @supabase/supabase-js, @supabase/ssr" : ""}
${q.database === "prisma_postgres" || q.database === "planetscale" ? "- @prisma/client, prisma" : ""}
${q.database === "mongodb" ? "- mongoose" : ""}
${q.auth === "nextauth" ? "- next-auth" : ""}
${q.auth === "clerk" ? "- @clerk/nextjs" : ""}
${q.payments === "stripe" ? "- stripe, @stripe/stripe-js" : ""}
${q.payments === "lemonsqueezy" ? "- @lemonsqueezy/lemonsqueezy-js" : ""}
${q.extra_apis.includes("resend") ? "- resend" : ""}
${q.extra_apis.includes("openai") ? "- openai" : ""}
${q.extra_apis.includes("anthropic") ? "- @anthropic-ai/sdk" : ""}
${q.extra_apis.includes("cloudinary") ? "- cloudinary, next-cloudinary" : ""}
${q.cms === "payload" ? "- payload, @payloadcms/next, @payloadcms/db-postgres or @payloadcms/db-mongodb" : ""}
${q.cms === "sanity" ? "- next-sanity, @sanity/image-url, sanity" : ""}
${q.cms === "contentful" ? "- contentful" : ""}
${q.animations === "rich" ? "- framer-motion" : ""}
${q.features?.includes("i18n") ? "- next-intl" : ""}
${q.features?.includes("analytics") ? "- @vercel/analytics" : ""}
${q.features?.includes("pwa") ? "- next-pwa" : ""}
${q.project_type === "game" ? "- phaser" : ""}

Return ONLY the raw JSON content of package.json. No markdown, no explanation.`;
}

// ─── Step 2: Config files ─────────────────────────────────────────────────────

export function getConfigFilesPrompt(q: ProjectQuestionnaire): string {
  return `Generate config files for this project. Return a JSON object where every key is the FULL file path from project root and values are complete file contents.

${stackSummary(q)}

Generate ALL of these files (use the exact paths shown):
${q.framework === "nextjs" ? `- "next.config.ts" — Next.js config with any needed plugins
- "tsconfig.json" — TypeScript config with paths alias (@/*)
- "postcss.config.mjs" — PostCSS config${q.styling === "tailwind" ? " with Tailwind" : ""}
${q.styling === "tailwind" ? `- "tailwind.config.ts" — Tailwind config with content paths src/**/*.{ts,tsx}` : ""}` : ""}
${q.framework === "astro" ? `- "astro.config.mjs"
- "tsconfig.json"` : ""}
${q.framework === "remix" ? `- "remix.config.js"
- "tsconfig.json"` : ""}
${q.framework === "vue" ? `- "nuxt.config.ts"
- "tsconfig.json"` : ""}
- ".gitignore" — Include .env*, .env.local, node_modules, .next, dist, build, .DS_Store
- ".eslintrc.json" — ESLint config for ${q.language}
- ".prettierrc" — Prettier config

Return a JSON object: { "full/path/filename": "complete content", ... }
Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// ─── Step 3: .env.example ─────────────────────────────────────────────────────

export function getEnvExamplePrompt(q: ProjectQuestionnaire): string {
  return `Generate a .env.example file for this project.

${stackSummary(q)}

Include ALL environment variables needed, grouped with comments:
${q.database === "supabase" ? "# Supabase\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=" : ""}
${q.database === "planetscale" || q.database === "prisma_postgres" ? "# Database\nDATABASE_URL=" : ""}
${q.database === "mongodb" ? "# MongoDB\nMONGODB_URI=" : ""}
${q.database === "firebase" ? "# Firebase\nNEXT_PUBLIC_FIREBASE_API_KEY=\nNEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=\nNEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=\nNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=\nNEXT_PUBLIC_FIREBASE_APP_ID=" : ""}
${q.auth === "nextauth" ? "# NextAuth\nNEXTAUTH_SECRET=\nNEXTAUTH_URL=http://localhost:3000\n# Add OAuth provider keys here e.g. GITHUB_CLIENT_ID=" : ""}
${q.auth === "clerk" ? "# Clerk\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\nCLERK_SECRET_KEY=" : ""}
${q.payments === "stripe" ? "# Stripe\nSTRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" : ""}
${q.payments === "lemonsqueezy" ? "# Lemon Squeezy\nLEMONSQUEEZY_API_KEY=\nLEMONSQUEEZY_WEBHOOK_SECRET=" : ""}
${q.cms === "payload" ? "# Payload CMS\nPAYLOAD_SECRET=\nDATABASE_URI=" : ""}
${q.cms === "sanity" ? "# Sanity\nNEXT_PUBLIC_SANITY_PROJECT_ID=\nNEXT_PUBLIC_SANITY_DATASET=production\nSANITY_API_TOKEN=" : ""}
${q.cms === "contentful" ? "# Contentful\nCONTENTFUL_SPACE_ID=\nCONTENTFUL_ACCESS_TOKEN=" : ""}
${q.extra_apis.includes("cloudinary") ? "# Cloudinary\nCLOUDINARY_CLOUD_NAME=\nCLOUDINARY_API_KEY=\nCLOUDINARY_API_SECRET=" : ""}
${q.extra_apis.includes("resend") ? "# Resend\nRESEND_API_KEY=" : ""}
${q.extra_apis.includes("openai") ? "# OpenAI\nOPENAI_API_KEY=" : ""}
${q.extra_apis.includes("anthropic") ? "# Anthropic\nANTHROPIC_API_KEY=" : ""}
${q.extra_apis.includes("mapbox") ? "# Mapbox\nNEXT_PUBLIC_MAPBOX_TOKEN=" : ""}
${q.extra_apis.includes("pusher") ? "# Pusher\nPUSHER_APP_ID=\nPUSHER_KEY=\nPUSHER_SECRET=\nPUSHER_CLUSTER=" : ""}
${q.extra_apis.includes("algolia") ? "# Algolia\nNEXT_PUBLIC_ALGOLIA_APP_ID=\nNEXT_PUBLIC_ALGOLIA_SEARCH_KEY=\nALGOLIA_ADMIN_KEY=" : ""}
${q.extra_apis.includes("twilio") ? "# Twilio\nTWILIO_ACCOUNT_SID=\nTWILIO_AUTH_TOKEN=\nTWILIO_PHONE_NUMBER=" : ""}

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

Add a comment above each group explaining what the service does and where to get the keys.
Return ONLY the .env.example content. No markdown fences.`;
}

// ─── Step 4: Database schema ──────────────────────────────────────────────────

export function getDatabaseSchemaPrompt(q: ProjectQuestionnaire): string {
  if (q.database === "supabase") {
    return `Generate a complete Supabase SQL schema file at path "supabase/schema.sql" for this project.

${stackSummary(q)}

Include:
- All tables needed for a ${q.project_type} application
- uuid-ossp extension
- profiles table linked to auth.users with trigger to auto-create on signup
- Row Level Security (RLS) enabled on every table with appropriate policies
- Indexes on all foreign key columns
- Any helper functions (e.g. increment counters, check limits)
- Useful enums

Return ONLY the SQL content. No markdown fences, no explanation.`;
  }

  if (q.database === "prisma_postgres" || q.database === "planetscale") {
    return `Generate a complete Prisma schema at path "prisma/schema.prisma" for this project.

${stackSummary(q)}

Include:
- generator client and datasource db blocks
- All models needed for a ${q.project_type} application
- Proper @relation annotations
- Enums where appropriate
- @@index on foreign keys
- createdAt/updatedAt on all models

Return ONLY the Prisma schema content. No markdown fences.`;
  }

  if (q.database === "mongodb") {
    return `Generate Mongoose model files for this project as a JSON object with full file paths as keys.

${stackSummary(q)}

Generate all models needed for a ${q.project_type} app. Use paths like "src/models/User.ts".
Each model file should export a Mongoose model with proper TypeScript types.

Return a JSON object: { "src/models/ModelName.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  if (q.database === "firebase") {
    return `Generate Firebase config files for this project as a JSON object.

${stackSummary(q)}

Generate:
- "firestore.rules" — Security rules for a ${q.project_type} app
- "src/lib/firebase.ts" — Firebase initialization and exports

Return a JSON object: { "filepath": "content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  return "";
}

// ─── Step 5: Core app files ───────────────────────────────────────────────────

export function getCoreFilesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);
  const t = tsx(q);

  const files: string[] = [];

  if (q.framework === "nextjs") {
    files.push(
      `"src/app/layout.${t}" — Root layout. Include metadata, Inter font from next/font/google, body with children. ${q.styling === "tailwind" ? "Import globals.css." : ""} ${q.auth === "clerk" ? "Wrap with ClerkProvider." : ""}`,
      `"src/app/globals.css" — ${q.styling === "tailwind" ? "Tailwind v4 @import, base styles, CSS custom properties for colors/fonts." : "Base CSS reset and global styles."}`,
      `"src/app/page.${t}" — Homepage for a ${q.project_type} app. Real content relevant to: ${q.description}. Include hero section, features, CTA.`,
      `"src/app/not-found.${t}" — 404 page with link back home.`,
      `"src/lib/utils.${e}" — cn() helper using clsx + tailwind-merge, formatDate, formatCurrency utilities.`,
    );

    if (q.auth !== "none") {
      files.push(
        `"src/app/(auth)/login/page.${t}" — Sign in page with email/password form. Handles ${q.auth} sign in.`,
        `"src/app/(auth)/signup/page.${t}" — Sign up page with name, email, password. Handles ${q.auth} signup.`,
      );
    }

    if (q.database === "supabase") {
      files.push(
        `"src/lib/supabase/client.${e}" — Supabase browser client using createBrowserClient from @supabase/ssr.`,
        `"src/lib/supabase/server.${e}" — Supabase server client using createServerClient from @supabase/ssr with Next.js cookies().`,
      );
    }

    if (q.database === "prisma_postgres" || q.database === "planetscale") {
      files.push(`"src/lib/db.${e}" — Prisma client singleton with global caching for development hot reload.`);
    }

    if (q.database === "mongodb") {
      files.push(`"src/lib/mongodb.${e}" — MongoDB connection singleton using mongoose with global caching.`);
    }

    if (q.payments === "stripe") {
      files.push(`"src/lib/stripe.${e}" — Stripe client singleton, lazy-initialized. Export getStripe() function.`);
    }

    if (q.extra_apis.includes("resend")) {
      files.push(`"src/lib/email.${e}" — Resend client and sendEmail() helper function.`);
    }

    if (q.extra_apis.includes("openai")) {
      files.push(`"src/lib/openai.${e}" — OpenAI client singleton.`);
    }

    if (q.extra_apis.includes("anthropic")) {
      files.push(`"src/lib/anthropic.${e}" — Anthropic client singleton.`);
    }

    if (q.extra_apis.includes("cloudinary")) {
      files.push(`"src/lib/cloudinary.${e}" — Cloudinary config and upload helper.`);
    }

    if (q.auth === "nextauth") {
      files.push(`"src/lib/auth.${e}" — NextAuth config with providers, callbacks, session strategy.`);
    }

    // Project-type specific pages
    if (q.project_type === "saas") {
      files.push(
        `"src/app/dashboard/page.${t}" — Protected dashboard page with stats overview.`,
        `"src/app/dashboard/layout.${t}" — Dashboard layout with sidebar navigation.`,
      );
    } else if (q.project_type === "ecommerce") {
      files.push(
        `"src/app/products/page.${t}" — Products listing page with grid layout.`,
        `"src/app/products/[slug]/page.${t}" — Product detail page.`,
        `"src/app/cart/page.${t}" — Shopping cart page.`,
      );
    } else if (q.project_type === "blog") {
      files.push(
        `"src/app/blog/page.${t}" — Blog listing page with post cards.`,
        `"src/app/blog/[slug]/page.${t}" — Blog post detail page.`,
      );
    } else if (q.project_type === "photography") {
      files.push(
        `"src/app/gallery/page.${t}" — Photography gallery with masonry/grid layout.`,
        `"src/app/gallery/[album]/page.${t}" — Individual album/gallery page.`,
      );
    } else if (q.project_type === "dashboard") {
      files.push(
        `"src/app/dashboard/page.${t}" — Main dashboard with data visualisation placeholders.`,
        `"src/app/dashboard/layout.${t}" — Dashboard layout with sidebar.`,
      );
    } else if (q.project_type === "portfolio") {
      files.push(
        `"src/app/work/page.${t}" — Portfolio/work listing page.`,
        `"src/app/work/[slug]/page.${t}" — Individual project case study.`,
        `"src/app/about/page.${t}" — About page.`,
      );
    }

    // Proxy/middleware for auth
    if (q.auth === "supabase_auth" || q.auth === "nextauth" || q.auth === "clerk") {
      files.push(`"src/middleware.${e}" — Middleware to protect dashboard/account routes. Redirect unauthenticated users to /login.`);
    }
  }

  if (q.framework === "astro") {
    files.push(
      `"src/layouts/Layout.astro" — Base layout with head, nav, footer.`,
      `"src/pages/index.astro" — Homepage for a ${q.project_type} site.`,
      `"src/styles/global.css" — Global styles.`,
    );
  }

  if (q.framework === "remix") {
    files.push(
      `"app/root.tsx" — Remix root with Links, Meta, Scripts, Outlet.`,
      `"app/routes/_index.tsx" — Homepage.`,
      `"app/styles/global.css" — Global styles.`,
    );
  }

  return `Generate these core application files as a JSON object. Keys are FULL file paths from project root, values are complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n")}

IMPORTANT:
- Every file must be complete and functional — no truncation, no "// TODO", no placeholders
- Use correct imports with the @/ path alias for internal modules
- Make the homepage and pages genuinely useful for a ${q.project_type} project about: ${q.description}

Return a JSON object: { "full/path/file.tsx": "complete content", ... }
Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// ─── Step 6: Components ───────────────────────────────────────────────────────

export function getComponentsPrompt(q: ProjectQuestionnaire): string {
  const t = tsx(q);
  const e = ext(q);

  const files: string[] = [
    `"src/components/ui/Button.${t}" — Reusable Button with variants (primary, secondary, outline, ghost, destructive), sizes (sm, md, lg), loading state.`,
    `"src/components/ui/Card.${t}" — Card component with CardHeader, CardContent, CardFooter sub-components.`,
    `"src/components/ui/Input.${t}" — Input component with label, error state, helper text.`,
    `"src/components/ui/Badge.${t}" — Badge/tag component with color variants.`,
    `"src/components/ui/Modal.${t}" — Modal/dialog component with backdrop, close button.`,
    `"src/components/layout/Navbar.${t}" — Top navigation with logo, links, ${q.auth !== "none" ? "auth state (login/logout/avatar)" : "CTA button"}.`,
    `"src/components/layout/Footer.${t}" — Footer with links, copyright.`,
  ];

  if (q.project_type === "ecommerce") {
    files.push(
      `"src/components/products/ProductCard.${t}" — Product card with image, name, price, add-to-cart button.`,
      `"src/components/products/ProductGrid.${t}" — Responsive product grid.`,
      `"src/components/cart/CartItem.${t}" — Cart item with quantity controls and remove button.`,
      `"src/components/cart/CartSummary.${t}" — Order summary with subtotal, checkout button.`,
    );
  } else if (q.project_type === "photography") {
    files.push(
      `"src/components/gallery/GalleryGrid.${t}" — Masonry/CSS grid photo gallery.`,
      `"src/components/gallery/PhotoCard.${t}" — Individual photo card with hover overlay.`,
      `"src/components/gallery/Lightbox.${t}" — Full-screen lightbox with prev/next navigation.`,
    );
  } else if (q.project_type === "saas" || q.project_type === "dashboard") {
    files.push(
      `"src/components/dashboard/Sidebar.${t}" — Collapsible sidebar with nav items, active states.`,
      `"src/components/dashboard/StatsCard.${t}" — Metric card with value, label, trend indicator.`,
      `"src/components/dashboard/DataTable.${t}" — Sortable, paginated data table.`,
    );
    if (q.payments !== "none") {
      files.push(`"src/components/pricing/PricingCard.${t}" — Pricing plan card with features list, CTA.`);
    }
  } else if (q.project_type === "blog") {
    files.push(
      `"src/components/blog/PostCard.${t}" — Blog post preview card with title, excerpt, date, author.`,
      `"src/components/blog/PostHeader.${t}" — Post detail header with title, metadata, cover image.`,
    );
  } else if (q.project_type === "portfolio") {
    files.push(
      `"src/components/portfolio/ProjectCard.${t}" — Portfolio project card with image, title, tags.`,
      `"src/components/portfolio/SkillBadge.${t}" — Technology/skill badge component.`,
    );
  }

  if (q.extra_apis.includes("resend")) {
    files.push(`"src/components/forms/ContactForm.${t}" — Contact form that submits to /api/contact. Includes name, email, message fields with validation.`);
  }

  // Types file
  files.push(`"src/types/index.${e}" — TypeScript interfaces and types for all data models used in the app (User, ${q.project_type === "ecommerce" ? "Product, Order, CartItem" : q.project_type === "blog" ? "Post, Author, Category" : q.project_type === "photography" ? "Photo, Album, Gallery" : "etc."}).`);

  return `Generate UI components for this project as a JSON object. Keys are FULL file paths from project root, values are complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n")}

IMPORTANT:
- Every component must be complete — no truncation, no placeholders
- Use ${q.styling === "tailwind" ? "Tailwind CSS classes" : q.styling === "css_modules" ? "CSS Modules (import styles from './Component.module.css', and generate that file too)" : q.styling} for all styling
- Include proper TypeScript props interfaces
- Import from @/ path alias

Return a JSON object: { "full/path/Component.tsx": "complete content", ... }
Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// ─── Step 7: API routes ───────────────────────────────────────────────────────

export function getApiRoutesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);

  const files: string[] = [];

  if (q.database === "supabase" && q.auth !== "none") {
    files.push(`"src/app/api/auth/callback/route.${e}" — Supabase OAuth callback. Exchange code for session.`);
  }

  if (q.payments === "stripe") {
    files.push(
      `"src/app/api/stripe/checkout/route.${e}" — Create Stripe Checkout Session. Accept price/plan in body, return {url}.`,
      `"src/app/api/stripe/webhook/route.${e}" — Handle Stripe webhooks. Verify signature, handle checkout.session.completed, subscription events.`,
      `"src/app/api/stripe/portal/route.${e}" — Create Stripe Customer Portal session for subscription management.`,
    );
  }

  if (q.payments === "lemonsqueezy") {
    files.push(
      `"src/app/api/lemonsqueezy/webhook/route.${e}" — Handle Lemon Squeezy webhook events.`,
    );
  }

  if (q.extra_apis.includes("resend")) {
    files.push(`"src/app/api/contact/route.${e}" — Send contact form email via Resend. Validate input, send email, return success.`);
  }

  if (q.extra_apis.includes("openai")) {
    files.push(`"src/app/api/chat/route.${e}" — OpenAI streaming chat completion endpoint using ReadableStream.`);
  }

  if (q.extra_apis.includes("anthropic")) {
    files.push(`"src/app/api/chat/route.${e}" — Anthropic streaming chat completion endpoint using ReadableStream.`);
  }

  if (q.project_type === "ecommerce") {
    files.push(
      `"src/app/api/products/route.${e}" — GET list products, POST create product.`,
      `"src/app/api/products/[id]/route.${e}" — GET, PUT, DELETE single product.`,
      `"src/app/api/orders/route.${e}" — GET list orders, POST create order.`,
    );
  } else if (q.project_type === "blog") {
    files.push(
      `"src/app/api/posts/route.${e}" — GET list posts, POST create post.`,
      `"src/app/api/posts/[slug]/route.${e}" — GET single post by slug.`,
    );
  } else if (q.project_type === "saas" || q.project_type === "dashboard") {
    files.push(
      `"src/app/api/user/route.${e}" — GET current user profile, PATCH update profile.`,
    );
  }

  if (files.length === 0) {
    files.push(`"src/app/api/health/route.${e}" — Simple health check endpoint returning {status: "ok", timestamp}.`);
  }

  return `Generate API route files for this Next.js project as a JSON object. Keys are FULL file paths, values are complete file contents.

${stackSummary(q)}

Files to generate:
${files.map(f => `- ${f}`).join("\n")}

IMPORTANT:
- All routes use Next.js App Router route handlers (export async function GET/POST/etc.)
- Include proper error handling and status codes
- Use TypeScript types for request/response
- Validate input with proper checks

Return a JSON object: { "full/path/route.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// ─── Step 8: CMS config ───────────────────────────────────────────────────────

export function getCMSFilesPrompt(q: ProjectQuestionnaire): string {
  const e = ext(q);
  const t = tsx(q);

  if (q.cms === "payload") {
    return `Generate Payload CMS configuration files as a JSON object with FULL file paths as keys.

${stackSummary(q)}

Generate ALL of these Payload CMS files:
- "payload.config.ts" — Main Payload config with collections, db adapter (postgres or mongodb based on database choice: ${q.database}), secret from env
- "src/collections/Users.ts" — Users collection with auth enabled
- "src/collections/Media.ts" — Media/uploads collection
${q.project_type === "blog" ? `- "src/collections/Posts.ts" — Blog posts collection with title, slug, content (richText), author, status, publishedAt` : ""}
${q.project_type === "ecommerce" ? `- "src/collections/Products.ts" — Products collection with name, slug, description, price, images, inventory` : ""}
${q.project_type === "photography" ? `- "src/collections/Photos.ts" — Photos collection with title, image, album, description\n- "src/collections/Albums.ts" — Albums collection` : ""}
- "src/app/(payload)/admin/[[...segments]]/page.${t}" — Payload admin page
- "src/app/(payload)/admin/[[...segments]]/not-found.${t}" — Payload admin not-found
- "src/app/(payload)/api/[...slug]/route.${e}" — Payload API route handler

Return a JSON object: { "full/path/file.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  if (q.cms === "sanity") {
    return `Generate Sanity CMS configuration files as a JSON object with FULL file paths as keys.

${stackSummary(q)}

Generate:
- "sanity.config.ts" — Sanity Studio config with project ID from env, dataset, schema
- "sanity.cli.ts" — Sanity CLI config
- "src/sanity/schemaTypes/index.ts" — Schema type index
${q.project_type === "blog" ? `- "src/sanity/schemaTypes/post.ts" — Post schema with title, slug, body (block content), author, mainImage, publishedAt` : ""}
${q.project_type === "photography" ? `- "src/sanity/schemaTypes/photo.ts" — Photo schema\n- "src/sanity/schemaTypes/album.ts" — Album schema` : ""}
${q.project_type === "ecommerce" ? `- "src/sanity/schemaTypes/product.ts" — Product schema with name, slug, price, images, description` : ""}
- "src/sanity/lib/client.ts" — Sanity client configured with projectId/dataset from env
- "src/sanity/lib/queries.ts" — GROQ queries for fetching content
- "src/sanity/lib/image.ts" — Image URL builder helper
- "src/app/studio/[[...tool]]/page.${tsx(q)}" — Embedded Sanity Studio page

Return a JSON object: { "full/path/file.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  if (q.cms === "contentful") {
    return `Generate Contentful configuration files as a JSON object with FULL file paths as keys.

${stackSummary(q)}

Generate:
- "src/lib/contentful.${e}" — Contentful client setup using contentful package
- "src/lib/contentful-types.${e}" — TypeScript types for Contentful content models
- "src/lib/contentful-queries.${e}" — Helper functions to fetch entries (getEntries, getEntry, etc.)

Return a JSON object: { "full/path/file.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  if (q.cms === "wordpress") {
    return `Generate WordPress headless API helper files as a JSON object with FULL file paths as keys.

${stackSummary(q)}

Generate:
- "src/lib/wordpress.${e}" — WordPress REST API client with helper functions (getPosts, getPost, getPages)
- "src/lib/wordpress-types.${e}" — TypeScript types for WordPress REST API responses

Return a JSON object: { "full/path/file.ts": "complete content", ... }
Return ONLY the JSON object. No markdown fences.`;
  }

  return "";
}

// ─── Step 9: Public folder ────────────────────────────────────────────────────

export function getPublicFilesPrompt(q: ProjectQuestionnaire): string {
  return `Generate public folder files for this project as a JSON object with FULL file paths as keys.

${stackSummary(q)}

Generate:
- "public/favicon.svg" — A simple SVG favicon appropriate for a ${q.project_type} project called "${q.project_name}". Use a simple, clean icon shape with the brand color.
- "public/og-image.svg" — Open Graph image (1200x630 SVG) with the project name "${q.project_name}" and a clean design.
- "public/robots.txt" — Standard robots.txt allowing all crawlers.
- "public/sitemap.xml" — Basic sitemap.xml with homepage URL as https://example.com (user will update).

Return a JSON object: { "public/filename": "content", ... }
Return ONLY the JSON object. No markdown fences.`;
}

// ─── Step 10: README ──────────────────────────────────────────────────────────

export function getReadmePrompt(q: ProjectQuestionnaire): string {
  return `Generate a comprehensive README.md for this project.

${stackSummary(q)}

Include these sections:
# ${q.project_name}

Brief description from: ${q.description}

## Tech Stack
List all technologies with brief descriptions.

## Features
- List 6-10 features relevant to a ${q.project_type} app

## Project Structure
Show the directory tree.

## Getting Started

### Prerequisites
Node.js 18+, npm/yarn/pnpm, any service accounts needed.

### Installation
\`\`\`bash
git clone ...
cd ${q.project_name.toLowerCase().replace(/\s+/g, "-")}
npm install
cp .env.example .env.local
# Fill in your .env.local values
${q.database === "supabase" ? "# Run supabase/schema.sql in your Supabase SQL Editor" : ""}
${q.database === "prisma_postgres" || q.database === "planetscale" ? "npx prisma db push" : ""}
${q.cms === "payload" ? "# Payload admin will be at /admin on first run" : ""}
npm run dev
\`\`\`

## Environment Variables
Table with VARIABLE | Required | Description for every env var.

## Deployment
Instructions for deploying to Vercel${q.database === "supabase" ? " + Supabase" : ""}${q.payments === "stripe" ? " + Stripe webhook setup" : ""}.

Return ONLY the README.md content. No extra text before or after.`;
}
