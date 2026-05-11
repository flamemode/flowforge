import type { Agent, AgentRole, PricingTier, CreditPack } from "@/types";

export const AGENTS: Record<AgentRole, Agent> = {
  client_liaison: {
    role: "client_liaison",
    name: "Alex Chen",
    emoji: "🤝",
    color: "#6366f1",
    description: "Manages all client communication and expectations",
  },
  project_manager: {
    role: "project_manager",
    name: "Jordan Taylor",
    emoji: "📋",
    color: "#f59e0b",
    description: "Orchestrates timelines, resources, and deliverables",
  },
  creative_director: {
    role: "creative_director",
    name: "Sam Rivera",
    emoji: "🎨",
    color: "#ec4899",
    description: "Drives creative vision and design quality",
  },
  copywriter: {
    role: "copywriter",
    name: "Morgan Blake",
    emoji: "✍️",
    color: "#10b981",
    description: "Shapes brand voice, messaging, and content strategy",
  },
  developer: {
    role: "developer",
    name: "Riley Kim",
    emoji: "💻",
    color: "#3b82f6",
    description: "Builds and integrates technical solutions",
  },
  qa_tester: {
    role: "qa_tester",
    name: "Casey Zhang",
    emoji: "🔍",
    color: "#8b5cf6",
    description: "Ensures quality, catches issues, and validates delivery",
  },
  account_manager: {
    role: "account_manager",
    name: "Drew Santos",
    emoji: "💼",
    color: "#f97316",
    description: "Manages the business relationship and upsell opportunities",
  },
};

export const AGENT_ORDER: AgentRole[] = [
  "project_manager",
  "client_liaison",
  "creative_director",
  "copywriter",
  "developer",
  "qa_tester",
  "account_manager",
];

export const SIMULATION_ROUNDS = 7;

export const PROJECT_PHASES = [
  "kickoff",
  "discovery",
  "planning",
  "design",
  "development",
  "review",
  "delivery",
] as const;

// Credit packs — one-time purchases, no subscription required
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

// Free credits on signup
export const FREE_CREDITS = 2;

// Iterations included per deliverable before paying
export const FREE_ITERATIONS = 2;

// Price per extra iteration (Stripe one-time)
export const ITERATION_PRICE = 5;

// Each "credit" = 1 full simulate + execute run (simulation + all deliverables)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Starter",
    price_monthly: 0,
    price_annual: 0,
    simulations_per_month: 1,
    max_users: 1,
    features: [
      "1 full project run per month",
      "Simulate + Execute",
      "SVG logo + brand guidelines",
      "Basic website (watermarked)",
      "Marketing strategy outline",
      "7-day file access",
    ],
  },
  {
    id: "pro",
    name: "Studio",
    price_monthly: 99,
    price_annual: 79,
    simulations_per_month: 10,
    max_users: 1,
    highlighted: true,
    features: [
      "10 full project runs/month",
      "All 7 specialized agents",
      "SVG logo + full brand pack",
      "Complete website (HTML/CSS/JS)",
      "Full marketing strategy",
      "30-day social media calendar",
      "Ad copy (Google + Meta)",
      "Download all deliverables",
    ],
  },
  {
    id: "team",
    name: "Agency",
    price_monthly: 299,
    price_annual: 249,
    simulations_per_month: 50,
    max_users: 10,
    features: [
      "50 project runs/month",
      "Everything in Studio",
      "Up to 10 team members",
      "Shared project library",
      "White-label deliverables",
      "Custom brand voice training",
      "Priority AI processing",
      "Client-ready export packs",
    ],
  },
  {
    id: "agency",
    name: "Enterprise",
    price_monthly: 799,
    price_annual: 649,
    simulations_per_month: null,
    max_users: null,
    features: [
      "Unlimited project runs",
      "Everything in Agency",
      "Unlimited users",
      "Custom agent training on your past work",
      "API access",
      "Dedicated account manager",
      "2h support SLA",
      "Onboarding + setup call",
    ],
  },
];

export const SIMULATION_LIMITS: Record<string, number | null> = {
  free: 1,
  pro: 10,
  team: 50,
  agency: null,
};

export const CLIENT_PERSONALITY_LABELS: Record<string, string> = {
  collaborative: "Collaborative Partner",
  indecisive_founder: "Indecisive Founder",
  micromanager_cmo: "Micromanager CMO",
  visionary_vague: "Visionary but Vague",
  budget_hawk: "Budget Hawk",
  scope_creeper: "Scope Creeper",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  brand_identity: "Brand Identity",
  website_design: "Website Design",
  web_development: "Web Development",
  ui_ux_design: "UI/UX Design",
  digital_marketing: "Digital Marketing Campaign",
  content_strategy: "Content Strategy",
  full_service: "Full-Service Engagement",
};
