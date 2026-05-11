import type { Agent, AgentRole, PricingTier } from "@/types";

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

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Starter",
    price_monthly: 0,
    price_annual: 0,
    simulations_per_month: 3,
    max_users: 1,
    features: [
      "3 simulations per month",
      "4 core agents",
      "Basic risk detection",
      "Watermarked PDF report",
      "7-day history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 49,
    price_annual: 39,
    simulations_per_month: null,
    max_users: 1,
    highlighted: true,
    features: [
      "Unlimited simulations",
      "All 7 specialized agents",
      "Full risk analysis",
      "Export PDF & Markdown",
      "Mermaid flowcharts",
      "Unlimited history",
      "Priority processing",
    ],
  },
  {
    id: "team",
    name: "Team",
    price_monthly: 119,
    price_annual: 99,
    simulations_per_month: null,
    max_users: 10,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared project library",
      "Custom client personas",
      "Team performance analytics",
      "Slack notifications",
      "Comment & collaborate",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price_monthly: 299,
    price_annual: 249,
    simulations_per_month: null,
    max_users: null,
    features: [
      "Everything in Team",
      "Unlimited users",
      "White-label reports",
      "Custom agent training",
      "Advanced analytics dashboard",
      "API access",
      "Priority support (2h SLA)",
      "Onboarding call included",
    ],
  },
];

export const SIMULATION_LIMITS: Record<string, number | null> = {
  free: 3,
  pro: null,
  team: null,
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
