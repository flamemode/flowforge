import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  getLogoPrompt,
  getBrandGuidelinesPrompt,
  getWebsitePrompt,
  getMarketingStrategyPrompt,
} from "./execution-prompts";
import type { Project } from "@/types";
import type { Deliverable, DeliverableType, ExecutionEvent } from "@/types/deliverables";

export interface ExecuteProjectOptions {
  project: Project;
  simulationId: string;
  onEvent: (event: ExecutionEvent) => void | Promise<void>;
}

export async function executeProject({
  project,
  simulationId,
  onEvent,
}: ExecuteProjectOptions): Promise<Deliverable[]> {
  const deliverables: Deliverable[] = [];

  // Step 1: Logo
  await onEvent({ type: "start", data: { step: "logo", label: "Designing logo..." } });
  const logoSvg = await generateLogo(project);
  const logoDeliverable = makeDeliverable(simulationId, project.id, "logo_svg", "Brand Logo (SVG)", logoSvg);
  deliverables.push(logoDeliverable);
  await onEvent({ type: "deliverable", data: logoDeliverable });

  // Step 2: Brand Guidelines
  await onEvent({ type: "progress", data: { step: "brand", label: "Writing brand guidelines..." } });
  const brandGuidelinesContent = await generateBrandGuidelines(project, logoSvg);
  const brandDeliverable = makeDeliverable(simulationId, project.id, "brand_guidelines", "Brand Guidelines", brandGuidelinesContent);
  deliverables.push(brandDeliverable);
  await onEvent({ type: "deliverable", data: brandDeliverable });

  // Step 3: Website
  await onEvent({ type: "progress", data: { step: "website", label: "Building website..." } });
  const websiteHtml = await generateWebsite(project);
  const websiteDeliverable = makeDeliverable(simulationId, project.id, "website_html", "Website (HTML/CSS/JS)", websiteHtml);
  deliverables.push(websiteDeliverable);
  await onEvent({ type: "deliverable", data: websiteDeliverable });

  // Step 4: Marketing Strategy
  await onEvent({ type: "progress", data: { step: "marketing", label: "Creating marketing strategy..." } });
  const marketingContent = await generateMarketingStrategy(project);
  const marketingDeliverable = makeDeliverable(simulationId, project.id, "marketing_strategy", "Marketing Strategy & Content Pack", marketingContent);
  deliverables.push(marketingDeliverable);
  await onEvent({ type: "deliverable", data: marketingDeliverable });

  await onEvent({ type: "complete", data: { deliverables } });

  return deliverables;
}

async function generateLogo(project: Project): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: getLogoPrompt(project) }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  // Extract SVG from response
  const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
  return svgMatch ? svgMatch[0] : generateFallbackSvg(project.name);
}

async function generateBrandGuidelines(project: Project, logoSvg: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: getBrandGuidelinesPrompt(project, logoSvg) }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function generateWebsite(project: Project): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: getWebsitePrompt(project) }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const htmlMatch = text.match(/<!DOCTYPE html>[\s\S]*/i);
  return htmlMatch ? htmlMatch[0] : text;
}

async function generateMarketingStrategy(project: Project): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: getMarketingStrategyPrompt(project) }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

function makeDeliverable(
  simulationId: string,
  projectId: string,
  type: DeliverableType,
  title: string,
  content: string
): Deliverable {
  return {
    id: `${simulationId}-${type}`,
    simulation_id: simulationId,
    project_id: projectId,
    type,
    title,
    content,
    status: "complete",
    created_at: new Date().toISOString(),
  };
}

function generateFallbackSvg(name: string): string {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="24" fill="#6366f1"/>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="72" font-weight="bold"
    text-anchor="middle" fill="white">${initials}</text>
</svg>`;
}
