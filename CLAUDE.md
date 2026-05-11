@AGENTS.md

# FlowForge — Development Guide

## Commands
- `npm run dev` — Start development server (port 3000)
- `npm run build` — Production build + type check
- `npm run lint` — ESLint
- `npm run type-check` — TSC without emit

## Architecture
- **Next.js 15** App Router, TypeScript, Tailwind CSS v4
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Anthropic SDK** — claude-sonnet-4-6 for all agents
- **Stripe** — Subscriptions (webhooks at `/api/stripe/webhook`)

## Key directories
```
src/
  app/                  # Next.js App Router pages + API routes
  components/
    agents/             # AgentAvatar
    simulation/         # SimulationViewer, MessageBubble, RiskReport
    dashboard/          # ProjectCard
    layout/             # Navbar
    ui/                 # Primitives (Button, Card, Badge, etc.)
  lib/
    agents/             # orchestrator.ts, prompts.ts, mermaid.ts
    supabase/           # client.ts, server.ts
    anthropic.ts        # Anthropic client + model constant
    stripe.ts           # Stripe client
    constants.ts        # Agents, pricing tiers, limits
    utils.ts            # cn, formatCurrency, etc.
  types/index.ts        # All shared TypeScript types
supabase/schema.sql     # Full DB schema — run in Supabase SQL Editor
```

## Environment variables
Copy `.env.local.example` to `.env.local` and fill in all values.

## Simulation flow
1. User creates Project → `/api/projects POST`
2. Simulation created → `/api/simulations POST` (checks monthly limit via Supabase RPC)
3. SSE stream started → `/api/simulations/[id]/stream POST`
4. Orchestrator runs 7 rounds, each with phase-appropriate agents
5. Each round: agents respond → conflict detection pass → events streamed to client
6. Final report generated and saved to `simulation_reports`
7. Client switches to Report tab

## Adding new agents
1. Add role to `AgentRole` union in `src/types/index.ts`
2. Add agent config to `AGENTS` in `src/lib/constants.ts`
3. Add system prompt in `src/lib/agents/prompts.ts`
4. Add to `getAgentsForPhase()` in `src/lib/agents/orchestrator.ts`
5. Update Supabase schema `agent_role` check constraint
