export type SubscriptionTier = "free" | "pro" | "team" | "agency";

export type CreditPackId = "starter" | "studio" | "agency";

export interface CreditPack {
  id: CreditPackId;
  name: string;
  credits: number;
  price: number;
  price_per_run: number;
  stripe_price_id?: string;
  highlighted?: boolean;
  tag?: string;
}

// ─── Project questionnaire ────────────────────────────────────────────────────

export type ProjectType =
  | "photography"
  | "ecommerce"
  | "saas"
  | "blog"
  | "dashboard"
  | "landing"
  | "api_backend"
  | "portfolio";

export type Framework =
  | "nextjs"
  | "remix"
  | "astro"
  | "vue"
  | "plain_html";

export type Language = "typescript" | "javascript";

export type Styling =
  | "tailwind"
  | "css_modules"
  | "sass"
  | "styled_components";

export type Database =
  | "supabase"
  | "planetscale"
  | "mongodb"
  | "firebase"
  | "prisma_postgres"
  | "none";

export type CMS = "payload" | "sanity" | "contentful" | "wordpress" | "none";

export type AuthProvider =
  | "supabase_auth"
  | "nextauth"
  | "clerk"
  | "lucia"
  | "none";

export type PaymentProvider = "stripe" | "lemonsqueezy" | "none";

export type ExtraAPI =
  | "cloudinary"
  | "resend"
  | "mapbox"
  | "openai"
  | "anthropic"
  | "pusher"
  | "algolia"
  | "twilio";

export interface ProjectQuestionnaire {
  project_type: ProjectType;
  framework: Framework;
  language: Language;
  styling: Styling;
  database: Database;
  cms: CMS;
  auth: AuthProvider;
  payments: PaymentProvider;
  extra_apis: ExtraAPI[];
  description: string;
  project_name: string;
}

// ─── Generated project ────────────────────────────────────────────────────────

export type GeneratedProjectStatus = "pending" | "generating" | "complete" | "failed";

export interface GeneratedProject {
  id: string;
  user_id: string;
  name: string;
  questionnaire: ProjectQuestionnaire;
  status: GeneratedProjectStatus;
  file_count: number;
  created_at: string;
  completed_at?: string;
}

export interface GeneratedFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  language: string;
  created_at: string;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: SubscriptionTier;
  credits: number;
  stripe_customer_id?: string;
  created_at: string;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price_monthly: number;
  price_annual: number;
  simulations_per_month: number | null;
  max_users: number | null;
  features: string[];
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  highlighted?: boolean;
}
