export type DeliverableType =
  | "logo_svg"
  | "brand_guidelines"
  | "website_html"
  | "marketing_strategy"
  | "social_media_pack"
  | "ad_copy";

export type DeliverableStatus = "pending" | "generating" | "complete" | "failed";

export interface Deliverable {
  id: string;
  simulation_id: string;
  project_id: string;
  type: DeliverableType;
  title: string;
  content: string;
  status: DeliverableStatus;
  created_at: string;
}

export interface ExecutionEvent {
  type: "start" | "progress" | "deliverable" | "complete" | "error";
  data: unknown;
}
