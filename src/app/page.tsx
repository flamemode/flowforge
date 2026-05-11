import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_TIERS, AGENTS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Zap,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Pre-Project Simulation",
    description:
      "Run a full dry-run of your project before a single hour is billed. Catch scope creep, timeline gaps, and communication risks in minutes.",
  },
  {
    icon: Users,
    title: "7 Specialized AI Agents",
    description:
      "Project Manager, Client Liaison, Creative Director, Copywriter, Developer, QA Tester, and Account Manager — all with distinct personas and real-world concerns.",
  },
  {
    icon: AlertTriangle,
    title: "Conflict & Risk Detection",
    description:
      "Automatic detection of scope creep triggers, communication breakdowns, skill gaps, deadline pressure, and revision hell — before they happen.",
  },
  {
    icon: FileText,
    title: "Actionable Risk Reports",
    description:
      "Post-simulation PDF report with ranked risks, mitigation strategies, revised timeline & budget estimates, and concrete process improvements.",
  },
  {
    icon: TrendingUp,
    title: "Success Probability Score",
    description:
      "Get a concrete 0–100% success probability score based on your project specifics, team size, client personality, and timeline realism.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We ran a FlowForge simulation before pitching a $120k rebrand. The scope creep alert saved us — we caught 3 major revision risks before signing the contract.",
    author: "Sarah K.",
    title: "Creative Director, boutique branding agency",
    stars: 5,
  },
  {
    quote:
      "The 'Indecisive Founder' client personality template is terrifyingly accurate. We now require every new project to go through simulation before kickoff.",
    author: "Marcus T.",
    title: "Founder, web design studio (7 people)",
    stars: 5,
  },
  {
    quote:
      "Paid for itself in week 1. The simulator flagged a $30k scope gap we'd have eaten. Now I use it as part of our proposal process.",
    author: "Priya M.",
    title: "Project Manager, digital marketing agency",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <header className="border-b border-zinc-200 h-14 flex items-center px-6 gap-6 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          FlowForge
        </div>
        <nav className="hidden md:flex items-center gap-6 ml-4">
          <Link href="#features" className="text-sm text-zinc-600 hover:text-zinc-900">
            Features
          </Link>
          <Link href="#agents" className="text-sm text-zinc-600 hover:text-zinc-900">
            Agents
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Start free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5">
          <Zap className="w-3 h-3" />
          AI-powered project simulation for creative agencies
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
          Fly your project before
          <br />
          <span className="text-indigo-600">you build it.</span>
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          FlowForge simulates your entire client project with 7 specialized AI
          agents — predicting scope creep, communication failures, and timeline
          risks before a single hour is billed.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button size="lg" asChild className="gap-2">
            <Link href="/auth/signup">
              Start simulating free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">See how it works</Link>
          </Button>
        </div>
        <p className="text-sm text-zinc-400 mt-4">
          3 free simulations · No credit card required
        </p>
      </section>

      {/* Demo simulation preview */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-xl">
          <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-zinc-400 text-xs ml-2">
              FlowForge Simulation — Acme Corp Rebrand
            </span>
          </div>
          <div className="bg-white p-4 space-y-3">
            {[
              {
                emoji: "📋",
                name: "Jordan Taylor",
                role: "Project Manager",
                type: "concern",
                msg: "The 8-week timeline for a full brand identity + website is extremely tight given the scope described. We typically need 12–14 weeks minimum, and that's with a decisive client. With an Indecisive Founder personality on the client side, I'd budget for at least 2 additional revision rounds...",
                color: "#f59e0b",
              },
              {
                emoji: "🤝",
                name: "Alex Chen",
                role: "Client Liaison",
                type: "concern",
                msg: "Flagging now: 'Indecisive Founder' is a high-risk personality profile. In my experience, these clients approve creative direction, disappear for a week, then come back wanting to restart from scratch. We need revision limits in the contract — maximum 2 rounds of amends per deliverable — and get that in writing before kickoff...",
                color: "#6366f1",
              },
              {
                emoji: "💻",
                name: "Riley Kim",
                role: "Developer",
                type: "question",
                msg: "Quick technical flag: the scope mentions 'Shopify integration' but the budget is $45k. Full custom Shopify development with the design system described is a 6–8 week dev effort alone. Are we scoping a custom theme or a template modification? This decision needs to be locked before design starts...",
                color: "#3b82f6",
              },
            ].map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 p-3 rounded-xl border ${
                  msg.type === "concern"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: msg.color + "20" }}
                >
                  {msg.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.name}</span>
                    <span className="text-xs text-zinc-400">{msg.role}</span>
                    {msg.type === "concern" && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        ⚠️ Concern
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">{msg.msg}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">
                3 conflicts detected · Success probability: 61% · Estimated
                real timeline: 14 weeks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">
            Everything your PM wishes they had
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Built specifically for creative agencies who are tired of
            discovering problems mid-project.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-zinc-200">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="bg-zinc-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">
              Meet your AI team
            </h2>
            <p className="text-zinc-500">
              7 agents with distinct personas, concerns, and areas of expertise.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(AGENTS).map((agent) => (
              <div
                key={agent.role}
                className="bg-white rounded-xl p-4 border border-zinc-200 text-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ backgroundColor: agent.color + "15" }}
                >
                  {agent.emoji}
                </div>
                <p className="font-semibold text-sm text-zinc-900">
                  {agent.name}
                </p>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: agent.color }}
                >
                  {agent.role.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-zinc-400 mt-2">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">
            Agencies shipping smarter
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="border-zinc-200">
              <CardContent className="pt-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-zinc-500">{t.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-zinc-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-zinc-500">
              Less than one billable hour. Cancel any time.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-xl p-6 border ${
                  tier.highlighted
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {tier.highlighted && (
                  <Badge className="mb-3 bg-white text-indigo-600">
                    Most Popular
                  </Badge>
                )}
                <h3
                  className={`font-bold text-lg ${
                    tier.highlighted ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="my-3">
                  <span
                    className={`text-3xl font-bold ${
                      tier.highlighted ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {tier.price_monthly === 0
                      ? "Free"
                      : formatCurrency(tier.price_monthly)}
                  </span>
                  {tier.price_monthly > 0 && (
                    <span
                      className={`text-sm ${
                        tier.highlighted ? "text-indigo-200" : "text-zinc-400"
                      }`}
                    >
                      /mo
                    </span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        className={`w-4 h-4 flex-shrink-0 ${
                          tier.highlighted ? "text-indigo-200" : "text-emerald-500"
                        }`}
                      />
                      <span
                        className={
                          tier.highlighted ? "text-indigo-100" : "text-zinc-600"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlighted ? "secondary" : "outline"}
                  size="sm"
                >
                  <Link href={tier.id === "free" ? "/auth/signup" : "/pricing"}>
                    {tier.id === "free" ? "Start free" : "Get started"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-zinc-900 mb-4">
          Stop discovering problems mid-project.
        </h2>
        <p className="text-zinc-500 text-lg mb-8">
          Join agencies using FlowForge to simulate before they ship.
        </p>
        <Button size="lg" asChild className="gap-2">
          <Link href="/auth/signup">
            Run your first simulation free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-900">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            FlowForge
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/pricing" className="hover:text-zinc-900">Pricing</Link>
            <Link href="/auth/login" className="hover:text-zinc-900">Sign in</Link>
          </div>
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} FlowForge. Built for agencies that ship.
          </p>
        </div>
      </footer>
    </div>
  );
}
