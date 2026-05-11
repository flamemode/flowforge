export type AgentRole =
  | "client_liaison"
  | "project_manager"
  | "creative_director"
  | "copywriter"
  | "developer"
  | "qa_tester"
  | "account_manager";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SimulationStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export type SubscriptionTier = "free" | "pro" | "team" | "agency";

export type ClientPersonality =
  | "collaborative"
  | "indecisive_founder"
  | "micromanager_cmo"
  | "visionary_vague"
  | "budget_hawk"
  | "scope_creeper";

export type ProjectType =
  | "brand_identity"
  | "website_design"
  | "web_development"
  | "ui_ux_design"
  | "digital_marketing"
  | "content_strategy"
  | "full_service";

export interface Agent {
  role: AgentRole;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  client_type: string;
  project_type: ProjectType;
  budget: number;
  timeline_weeks: number;
  team_size: number;
  client_personality: ClientPersonality;
  scope_description: string;
  special_requirements?: string;
  created_at: string;
}

export interface Simulation {
  id: string;
  project_id: string;
  user_id: string;
  status: SimulationStatus;
  current_round: number;
  total_rounds: number;
  risk_score: number;
  success_probability: number;
  created_at: string;
  completed_at?: string;
}

export interface SimulationMessage {
  id: string;
  simulation_id: string;
  round: number;
  agent_role: AgentRole;
  content: string;
  message_type: "statement" | "question" | "concern" | "decision" | "conflict";
  created_at: string;
}

export interface Risk {
  id: string;
  simulation_id: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  mitigation: string;
}

export type RiskCategory =
  | "scope_creep"
  | "communication"
  | "timeline"
  | "budget"
  | "technical"
  | "resource"
  | "client_relations"
  | "quality";

export interface SimulationReport {
  id: string;
  simulation_id: string;
  project_id: string;
  overall_risk_level: RiskLevel;
  success_probability: number;
  executive_summary: string;
  risks: Risk[];
  recommendations: Recommendation[];
  revised_timeline_weeks: number;
  revised_budget_multiplier: number;
  process_improvements: string[];
  agent_performance: AgentPerformance[];
  created_at: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface AgentPerformance {
  role: AgentRole;
  concerns_raised: number;
  conflicts_involved: number;
  effectiveness_score: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  agency_name?: string;
  subscription_tier: SubscriptionTier;
  simulations_used_this_month: number;
  stripe_customer_id?: string;
  created_at: string;
}

export interface SimulationRound {
  round: number;
  messages: SimulationMessage[];
  conflicts: ConflictDetected[];
  phase: ProjectPhase;
}

export interface ConflictDetected {
  between: AgentRole[];
  description: string;
  severity: RiskLevel;
  resolution?: string;
}

export type ProjectPhase =
  | "kickoff"
  | "discovery"
  | "planning"
  | "design"
  | "development"
  | "review"
  | "delivery"
  | "retrospective";

export interface SimulationConfig {
  project: Project;
  agents: AgentRole[];
  total_rounds: number;
  simulation_speed: "step" | "fast" | "instant";
}

export interface CreateProjectInput {
  name: string;
  client_type: string;
  project_type: ProjectType;
  budget: number;
  timeline_weeks: number;
  team_size: number;
  client_personality: ClientPersonality;
  scope_description: string;
  special_requirements?: string;
}

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
