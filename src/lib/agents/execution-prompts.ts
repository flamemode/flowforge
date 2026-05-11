import type { Project } from "@/types";
import { PROJECT_TYPE_LABELS, CLIENT_PERSONALITY_LABELS } from "@/lib/constants";

export function getLogoPrompt(project: Project): string {
  return `You are a world-class brand identity designer. Create a professional SVG logo for the following project.

PROJECT:
- Name: ${project.name}
- Client Type: ${project.client_type}
- Project Type: ${PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
- Scope: ${project.scope_description}

REQUIREMENTS:
- Output ONLY valid, complete SVG code — nothing else, no markdown, no explanation
- The SVG must be 200x200 viewBox, scalable
- Create a clean, modern, memorable logo mark + wordmark
- Use 2-3 colors maximum — choose a palette that fits the brand
- The design must work on both light and dark backgrounds
- Include the brand/company name as text in the SVG
- Make it look like it was designed by a senior brand designer at a top agency
- Use geometric shapes, clean lines, professional typography (use standard web-safe fonts or SVG text)
- NO external image references, NO raster images — pure SVG paths and shapes only

Output the SVG code starting with <svg and ending with </svg>. Nothing else.`;
}

export function getBrandGuidelinesPrompt(project: Project, logoSvg: string): string {
  return `You are a senior brand strategist. Based on this project, create comprehensive brand guidelines.

PROJECT:
- Name: ${project.name}
- Client Type: ${project.client_type}
- Project Type: ${PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
- Client Personality: ${CLIENT_PERSONALITY_LABELS[project.client_personality]}
- Scope: ${project.scope_description}

The logo has been designed with the following SVG (use the colors from it for the palette):
${logoSvg.slice(0, 500)}...

Create brand guidelines in Markdown format covering:

# Brand Guidelines — ${project.name}

## Brand Story & Positioning
(2-3 sentences on what this brand stands for)

## Color Palette
(Primary, Secondary, Accent, Neutral — with hex codes that match or complement the logo)

## Typography
(Primary font for headings, secondary for body — use Google Fonts recommendations)

## Voice & Tone
(3-5 adjectives, do/don't examples for copywriting)

## Logo Usage
(Clear space rules, minimum sizes, what NOT to do)

## Brand Applications
(How the brand looks on website, social media, print)

Be specific, professional, and actionable. This is a real deliverable for a real client.`;
}

export function getWebsitePrompt(project: Project): string {
  return `You are a senior full-stack developer and UI designer. Build a complete, production-ready single-page website.

PROJECT:
- Name: ${project.name}
- Client Type: ${project.client_type}
- Project Type: ${PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
- Scope: ${project.scope_description}
${project.special_requirements ? `- Special Requirements: ${project.special_requirements}` : ""}

REQUIREMENTS:
- Output a single, complete HTML file with all CSS and JS inline
- Modern, professional design — looks like it was built by a top agency
- Fully responsive (mobile-first)
- Sections: Navigation, Hero, Services/About, Social proof/testimonials placeholder, CTA, Footer
- Smooth scroll, subtle animations (CSS only, no external libraries)
- Use a cohesive color scheme appropriate to the business type
- Real, compelling placeholder copy tailored to this specific business
- NO Lorem ipsum — write actual relevant content
- Use CSS Grid and Flexbox
- Include a contact form (HTML only, no backend needed)
- Fast loading — no external dependencies except Google Fonts

Output ONLY the complete HTML file starting with <!DOCTYPE html>. Nothing else.`;
}

export function getMarketingStrategyPrompt(project: Project): string {
  return `You are a senior digital marketing strategist at a top creative agency. Create a comprehensive marketing strategy.

PROJECT:
- Name: ${project.name}
- Client Type: ${project.client_type}
- Project Type: ${PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
- Budget: $${project.budget.toLocaleString()}
- Client Personality: ${CLIENT_PERSONALITY_LABELS[project.client_personality]}
- Scope: ${project.scope_description}

Create a full marketing strategy in Markdown. Be specific, actionable, and tailored to this exact business:

# Marketing Strategy — ${project.name}

## Executive Summary

## Target Audience
### Primary Persona
### Secondary Persona

## Brand Positioning Statement

## Channel Strategy
### Organic Social Media
### Content Marketing
### Paid Advertising
### Email Marketing
### SEO

## 30-Day Content Calendar
(Week-by-week breakdown with specific post ideas for each platform)

## Social Media Post Templates
### 5 Instagram Posts (caption + hashtags)
### 5 LinkedIn Posts
### 5 X/Twitter Posts

## Ad Copy
### Google Search Ads (3 headlines + 2 descriptions each, 3 variations)
### Meta/Instagram Ads (primary text + headline + description, 3 variations)

## Email Campaign
### Welcome Email
### Follow-up Email #1 (Day 3)
### Follow-up Email #2 (Day 7)

## KPIs & Success Metrics
(Specific numbers to hit in 30/60/90 days)

## Budget Allocation Recommendation
(How to split the marketing budget across channels)

Be extremely specific — mention the actual business, actual audience, actual platforms. No generic advice.`;
}
