import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, FileCode, Download, Settings, ChevronRight } from "lucide-react";
import { FREE_CREDITS } from "@/lib/constants";

const STACK_EXAMPLES = [
  { label: "Next.js + Supabase + Stripe", type: "SaaS" },
  { label: "Astro + Sanity + Tailwind", type: "Blog" },
  { label: "Next.js + Prisma + Clerk", type: "Dashboard" },
  { label: "Next.js + Payload CMS", type: "E-Commerce" },
  { label: "Remix + MongoDB + Resend", type: "Portfolio" },
  { label: "Next.js + Firebase + Stripe", type: "Photography" },
];

const HOW_IT_WORKS = [
  {
    icon: Settings,
    title: "Answer 8 questions",
    desc: "Tell Origo your project type, framework, database, auth, payments, and any extra APIs you need.",
  },
  {
    icon: Zap,
    title: "AI builds your starter",
    desc: "Claude generates every file — pages, components, API routes, DB schema, config, and .env.example.",
  },
  {
    icon: Download,
    title: "Download and ship",
    desc: "Get a clean ZIP. Run npm install, fill in your .env, and you're already writing features — not boilerplate.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <header className="border-b border-zinc-800/50 h-14 flex items-center px-6 gap-6">
        <div className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" asChild>
            <Link href="/guide">Guide</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700" asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <Zap className="w-3.5 h-3.5" />
          {FREE_CREDITS} free projects on signup — no card required
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          Your AI developer
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            starting point
          </span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Answer 8 questions about your stack. Origo generates a complete, production-ready
          starter project — every file, every config, every API route.
          Download the ZIP and start building.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 gap-2 text-base h-12 px-8" asChild>
            <Link href="/new">
              Build my starter
              <ChevronRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 h-12 px-8" asChild>
            <Link href="/auth/signup">Sign up free</Link>
          </Button>
        </div>
      </section>

      {/* Stack examples ticker */}
      <section className="border-y border-zinc-800/50 py-4 overflow-hidden">
        <div className="flex gap-6 animate-none">
          <div className="flex gap-6 flex-wrap justify-center px-6">
            {STACK_EXAMPLES.map((ex) => (
              <div key={ex.label} className="flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">
                  {ex.type}
                </span>
                <span className="text-zinc-400">{ex.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">From idea to codebase in minutes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Step {i + 1}</div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Every project includes</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "package.json with all dependencies",
              "tsconfig.json + next.config.ts",
              "Tailwind / CSS config",
              "Complete page & component files",
              "API routes wired to your services",
              "Database schema (SQL or Prisma)",
              "Auth setup (login, signup, callbacks)",
              "Stripe / payment boilerplate",
              ".env.example with every variable",
              "README with setup instructions",
              ".gitignore + ESLint config",
              "Third-party API helper files",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm">
                <FileCode className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Skip the boilerplate forever</h2>
        <p className="text-zinc-400 mb-8">
          {FREE_CREDITS} free projects included. No credit card. Takes 3 minutes to set up.
        </p>
        <Button size="lg" className="bg-violet-600 hover:bg-violet-700 gap-2 text-base h-12 px-10" asChild>
          <Link href="/auth/signup">
            Get started free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-600 text-sm">
        <p>© 2026 Origo. Built with Claude.</p>
      </footer>
    </div>
  );
}
