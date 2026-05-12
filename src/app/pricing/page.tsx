"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Zap } from "lucide-react";

export default function PricingPage() {
  const handlePurchase = async (packId: string) => {
    const res = await fetch("/api/credits/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack_id: packId }),
    });
    if (res.status === 401) { window.location.assign("/auth/signup?redirect=/pricing"); return; }
    if (res.status === 503) { alert("Payments not yet configured. Contact support."); return; }
    const { url } = await res.json();
    if (url) window.location.assign(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 h-14 flex items-center px-6 gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700" asChild>
            <Link href="/auth/signup">Start free</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-4">Pay per project. No subscriptions.</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Buy credits, use them whenever. Each credit = one complete starter project — every file, every config, ready to go.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-5 py-2.5">
            <CheckCircle className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-zinc-300">
              Credits never expire — buy now, use whenever
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl p-8 border flex flex-col ${
                pack.highlighted
                  ? "border-violet-500 bg-violet-600/10 shadow-2xl shadow-violet-900/30 scale-[1.02]"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              {pack.tag && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4 ${
                  pack.highlighted ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {pack.tag}
                </span>
              )}

              <h2 className="text-xl font-bold mb-1 text-white">{pack.name}</h2>

              <div className="my-4">
                <span className="text-5xl font-bold text-white">{formatCurrency(pack.price)}</span>
                <p className="text-sm mt-1 text-zinc-500">
                  {pack.credits} credit{pack.credits > 1 ? "s" : ""} · {formatCurrency(pack.price_per_run)}/project
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  `${pack.credits} full starter project${pack.credits > 1 ? "s" : ""}`,
                  "Complete file structure",
                  "package.json + all config",
                  "Pages, components, API routes",
                  "Database schema / Prisma",
                  "Auth + payments wired up",
                  ".env.example + README",
                  "ZIP download",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      pack.highlighted ? "text-violet-400" : "text-emerald-500"
                    }`} />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePurchase(pack.id)}
                className={`w-full ${pack.highlighted ? "bg-violet-600 hover:bg-violet-700" : "bg-zinc-800 hover:bg-zinc-700 text-white"}`}
                size="lg"
              >
                Buy {pack.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common questions</h2>
          <div className="space-y-6">
            {[
              { q: "Do credits expire?", a: "No. Credits never expire — buy now, use whenever." },
              { q: "What exactly is generated per credit?", a: "One credit = one complete starter project. Every file: package.json, config files, all pages and components, API routes, database schema, auth setup, payment boilerplate, .env.example, and a README with setup instructions. Download as ZIP and run npm install." },
              { q: "Can I customise the output?", a: "Yes — the generated code is a starting point, not a locked template. Edit any file, add features, change styling. It's just code." },
              { q: "What frameworks are supported?", a: "Next.js, Remix, Astro, Vue/Nuxt, and plain HTML." },
              { q: "Can I use the code commercially?", a: "Yes — everything generated is yours with no restrictions." },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-zinc-800 pb-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
