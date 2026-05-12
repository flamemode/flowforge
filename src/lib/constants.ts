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

export const FREE_CREDITS = 0;
export const ITERATION_PRICE = 5;

// ─── Questionnaire options ────────────────────────────────────────────────────

export const PROJECT_TYPE_OPTIONS = [
  { value: "saas", label: "SaaS App", icon: "⚡" },
  { value: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { value: "marketplace", label: "Marketplace", icon: "🏪" },
  { value: "photography", label: "Photography", icon: "📷" },
  { value: "portfolio", label: "Portfolio", icon: "🎨" },
  { value: "blog", label: "Blog / CMS", icon: "✍️" },
  { value: "dashboard", label: "Dashboard", icon: "📊" },
  { value: "landing", label: "Landing Page", icon: "🚀" },
  { value: "social", label: "Social / Community", icon: "👥" },
  { value: "booking", label: "Booking / Scheduling", icon: "📅" },
  { value: "directory", label: "Directory / Listings", icon: "📋" },
  { value: "forum", label: "Forum / Discussion", icon: "💬" },
  { value: "game", label: "Browser Game", icon: "🎮" },
  { value: "api_backend", label: "API / Backend", icon: "🔧" },
] as const;

export const DESIGN_STYLE_OPTIONS = [
  { value: "minimalist", label: "Minimalist", description: "Clean, lots of whitespace, simple typography" },
  { value: "bold", label: "Bold & Vibrant", description: "Strong colors, big type, high contrast" },
  { value: "glassmorphism", label: "Glassmorphism", description: "Frosted glass, blur effects, gradients" },
  { value: "brutalist", label: "Brutalist", description: "Raw, unconventional, stark layouts" },
  { value: "corporate", label: "Corporate / Professional", description: "Clean, trustworthy, business-focused" },
  { value: "playful", label: "Playful / Fun", description: "Rounded, colorful, energetic feel" },
] as const;

export const COLOR_SCHEME_OPTIONS = [
  { value: "dark", label: "Dark mode", description: "Dark background, light text" },
  { value: "light", label: "Light mode", description: "White/light background" },
  { value: "system_toggle", label: "Toggle (Dark + Light)", description: "User can switch — includes both themes" },
] as const;

export const ANIMATION_OPTIONS = [
  { value: "none", label: "None", description: "Static — no motion effects" },
  { value: "subtle", label: "Subtle", description: "Light transitions and hover effects" },
  { value: "moderate", label: "Moderate", description: "Page transitions, scroll animations" },
  { value: "rich", label: "Rich", description: "Framer Motion — full micro-interactions" },
] as const;

export const FEATURE_OPTIONS = [
  { value: "dark_mode", label: "Dark / Light toggle", description: "Theme switcher component" },
  { value: "seo", label: "SEO optimized", description: "Meta tags, OG image, sitemap, robots.txt" },
  { value: "pwa", label: "Progressive Web App", description: "Service worker, manifest, offline support" },
  { value: "analytics", label: "Analytics", description: "Google Analytics or Plausible integration" },
  { value: "search", label: "Search", description: "Full-text search across content" },
  { value: "notifications", label: "Notifications", description: "In-app or push notification system" },
  { value: "file_upload", label: "File upload", description: "Drag-and-drop file upload component" },
  { value: "admin_panel", label: "Admin panel", description: "Back-office dashboard for managing data" },
  { value: "comments", label: "Comments / Reviews", description: "User comment or rating system" },
  { value: "social_auth", label: "Social login", description: "Sign in with Google / GitHub / etc." },
  { value: "export_data", label: "Export data", description: "Download CSV or PDF exports" },
  { value: "i18n", label: "Internationalization", description: "Multi-language support (next-intl)" },
  { value: "multi_tenant", label: "Multi-tenancy", description: "Separate data per org/workspace" },
  { value: "rate_limiting", label: "Rate limiting", description: "API rate limiting middleware" },
  { value: "webhooks", label: "Webhooks", description: "Outbound webhook delivery system" },
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

// ─── Mobile options ───────────────────────────────────────────────────────────

export const MOBILE_APP_TYPE_OPTIONS = [
  { value: "social", label: "Social Network", icon: "👥" },
  { value: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { value: "fitness", label: "Fitness & Health", icon: "💪" },
  { value: "finance", label: "Finance & Banking", icon: "💰" },
  { value: "food_delivery", label: "Food & Delivery", icon: "🍔" },
  { value: "productivity", label: "Productivity", icon: "✅" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "news", label: "News & Media", icon: "📰" },
  { value: "travel", label: "Travel & Maps", icon: "✈️" },
  { value: "game", label: "Game", icon: "🎮" },
] as const;

export const MOBILE_FRAMEWORK_OPTIONS = [
  { value: "expo", label: "Expo (React Native)", description: "Cross-platform iOS + Android with TypeScript" },
  { value: "flutter", label: "Flutter", description: "Cross-platform iOS + Android with Dart" },
  { value: "swift", label: "Swift + SwiftUI", description: "Native iOS only" },
  { value: "kotlin", label: "Kotlin + Jetpack Compose", description: "Native Android only" },
] as const;

export const MOBILE_BACKEND_OPTIONS = [
  { value: "supabase", label: "Supabase", description: "Postgres + Auth + Realtime" },
  { value: "firebase", label: "Firebase", description: "Google NoSQL + Auth + FCM" },
  { value: "rest_api", label: "Custom REST API", description: "Fetch from your own API" },
  { value: "none", label: "None", description: "Local only / offline app" },
] as const;

export const MOBILE_FEATURE_OPTIONS = [
  { value: "push_notifications", label: "Push Notifications", description: "Send alerts to users" },
  { value: "camera", label: "Camera & Photos", description: "Take photos, access gallery" },
  { value: "maps", label: "Maps & Location", description: "Show maps, get GPS location" },
  { value: "biometric_auth", label: "Biometric Auth", description: "Face ID / fingerprint login" },
  { value: "offline_mode", label: "Offline Mode", description: "Works without internet" },
  { value: "in_app_purchases", label: "In-App Purchases", description: "Sell features or subscriptions" },
  { value: "social_login", label: "Social Login", description: "Sign in with Google / Apple" },
  { value: "dark_mode", label: "Dark Mode", description: "Light and dark theme" },
  { value: "analytics", label: "Analytics", description: "Track user behaviour" },
  { value: "deep_linking", label: "Deep Linking", description: "Open app from URLs" },
] as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const FONT_PAIRING_OPTIONS = [
  { value: "inter", label: "Inter", description: "Clean, modern sans-serif — default for most apps", preview: "Aa" },
  { value: "geist", label: "Geist", description: "Vercel's typeface — crisp and technical", preview: "Aa" },
  { value: "cal_sans", label: "Cal Sans + Inter", description: "Bold display headings + clean body — great for SaaS", preview: "Aa" },
  { value: "playfair", label: "Playfair Display + Lato", description: "Elegant serif headings — blogs, portfolios, luxury", preview: "Aa" },
  { value: "sora", label: "Sora", description: "Geometric and friendly — good for startups", preview: "Aa" },
  { value: "space_grotesk", label: "Space Grotesk", description: "Quirky geometric — landing pages, creative projects", preview: "Aa" },
  { value: "mono", label: "JetBrains Mono", description: "Monospace — developer tools, API docs, terminals", preview: "Aa" },
] as const;

// ─── Dev environment ─────────────────────────────────────────────────────────

export const DEV_OS_OPTIONS = [
  { value: "macos_modern", label: "macOS (Monterey+)", description: "macOS 12 or newer", icon: "🍎" },
  { value: "macos_catalina", label: "macOS (Catalina/Big Sur)", description: "macOS 10.15–11", icon: "🍏" },
  { value: "windows", label: "Windows 10/11", description: "Windows with PowerShell or WSL", icon: "🪟" },
  { value: "linux", label: "Linux", description: "Ubuntu, Debian, Fedora, etc.", icon: "🐧" },
] as const;

export const NODE_VERSION_OPTIONS = [
  { value: "18", label: "Node 18 LTS", description: "Older LTS — max compatibility" },
  { value: "20", label: "Node 20 LTS", description: "Recommended LTS" },
  { value: "22", label: "Node 22 LTS", description: "Latest LTS" },
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
  dart: "dart",
};
