"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, FREE_CREDITS, FREE_ITERATIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Zap, RefreshCw } from "lucide-react";

export default function PricingPage() {
  const handlePurchase = async (packId: string) => {
    const res = await fetch("/api/credits/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack_id: packId }),
    });

    if (res.status === 401) {
      window.location.href = "/auth/signup?redirect=/pricing";
      return;
    }
    if (res.status === 503) {
      alert("Payments not yet configured. Contact support.");
      return;
    }
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200 h-14 flex items-center px-6 gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          FlowForge
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link href="/auth/login">Sign in</Link></Button>
          <Button size="sm" asChild><Link href="/auth/signup">Try free</Link></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Pay per project. No subscriptions.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Buy credits, use them whenever. Each credit = one full project run —
            simulation, logo, website, and full marketing pack.
          </p>
        </div>

        {/* Free credits badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              New accounts get <strong>{FREE_CREDITS} free credits</strong> — no card required
            </span>
          </div>
        </div>

        {/* Credit packs */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl p-8 border flex flex-col ${
                pack.highlighted
                  ? "border-indigo-500 bg-indigo-600 shadow-2xl shadow-indigo-100 scale-[1.02]"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {pack.tag && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4 ${
                  pack.highlighted ? "bg-white text-indigo-600" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {pack.tag}
                </span>
              )}

              <h2 className={`text-xl font-bold mb-1 ${pack.highlighted ? "text-white" : "text-zinc-900"}`}>
                {pack.name}
              </h2>

              <div className="my-4">
                <div className="flex items-end gap-2">
                  <span className={`text-5xl font-bold ${pack.highlighted ? "text-white" : "text-zinc-900"}`}>
                    {formatCurrency(pack.price)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${pack.highlighted ? "text-indigo-200" : "text-zinc-400"}`}>
                  {pack.credits} credit{pack.credits > 1 ? "s" : ""} · {formatCurrency(pack.price_per_run)}/run
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  `${pack.credits} full project run${pack.credits > 1 ? "s" : ""}`,
                  "AI simulation + risk report",
                  "Custom SVG logo",
                  "Complete website (HTML/CSS/JS)",
                  "Full marketing strategy",
                  "30-day content calendar",
                  "Google + Meta ad copy",
                  `${FREE_ITERATIONS} free iterations per deliverable`,
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      pack.highlighted ? "text-indigo-200" : "text-emerald-500"
                    }`} />
                    <span className={`text-sm ${pack.highlighted ? "text-indigo-100" : "text-zinc-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePurchase(pack.id)}
                variant={pack.highlighted ? "secondary" : "outline"}
                size="lg"
                className="w-full"
              >
                Buy {pack.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Iterations section */}
        <div className="bg-zinc-50 rounded-2xl p-8 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Iterate until it&apos;s perfect
              </h3>
              <p className="text-zinc-500 mb-4">
                Not happy with the logo or website? Each deliverable includes{" "}
                <strong>{FREE_ITERATIONS} free regenerations</strong>. After that,
                additional iterations are <strong>$5 each</strong> — Claude
                rewrites it from scratch with updated direction from you.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {["Logo", "Website", "Marketing Pack"].map((item) => (
                  <div key={item} className="bg-white rounded-xl p-3 border border-zinc-200">
                    <div className="text-sm font-semibold text-zinc-900">{item}</div>
                    <div className="text-xs text-emerald-600 mt-1">{FREE_ITERATIONS} free iterations</div>
                    <div className="text-xs text-zinc-400">then $5 each</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Do credits expire?",
                a: "No. Credits never expire — buy a pack now, use them whenever you need them.",
              },
              {
                q: "What exactly do I get per credit?",
                a: `One credit = one full project run: a 7-round AI simulation with risk report, a custom SVG logo, a complete responsive website, and a full marketing strategy with 30-day content calendar, social posts, and ad copy.`,
              },
              {
                q: `What are the ${FREE_ITERATIONS} free iterations?`,
                a: `After each deliverable is generated, you can give feedback and regenerate it ${FREE_ITERATIONS} times at no cost. If you need more regenerations, each additional one is $5.`,
              },
              {
                q: "Can I use the deliverables commercially?",
                a: "Yes — everything generated is yours to use commercially with no restrictions. The logo, website code, and marketing copy are all yours.",
              },
              {
                q: "What if I'm not happy with the results?",
                a: "Use your free iterations first — in most cases that gets you where you need to be. If you're genuinely unhappy after all iterations, contact us and we'll sort it out.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-zinc-200 pb-6">
                <h3 className="font-semibold text-zinc-900 mb-2">{faq.q}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
