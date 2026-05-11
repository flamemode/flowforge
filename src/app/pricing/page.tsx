"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Zap } from "lucide-react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const handleCheckout = async (
    tier: string,
    billingCycle: "monthly" | "annual"
  ) => {
    if (tier === "free") {
      window.location.href = "/auth/signup";
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, billing: billingCycle }),
    });

    if (res.status === 401) {
      window.location.href = `/auth/signup?redirect=/pricing`;
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-zinc-200 h-14 flex items-center px-6 gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          FlowForge
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Start free</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-zinc-500 mb-8">
            Less than one billable hour. Pays for itself the first time it
            catches a scope creep.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center rounded-xl border border-zinc-200 p-1 bg-zinc-50">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-white shadow text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-white shadow text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Annual
              <Badge variant="success" className="text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => {
            const price =
              billing === "annual" ? tier.price_annual : tier.price_monthly;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-8 border flex flex-col ${
                  tier.highlighted
                    ? "border-indigo-500 bg-indigo-600 shadow-2xl shadow-indigo-100 scale-[1.02]"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {tier.highlighted ? (
                  <Badge className="mb-4 w-fit bg-white text-indigo-600">
                    Most Popular
                  </Badge>
                ) : (
                  <div className="mb-4 h-6" />
                )}

                <h2
                  className={`text-xl font-bold mb-1 ${
                    tier.highlighted ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {tier.name}
                </h2>

                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold ${
                      tier.highlighted ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {price === 0 ? "Free" : formatCurrency(price)}
                  </span>
                  {price > 0 && (
                    <span
                      className={`text-sm ml-1 ${
                        tier.highlighted ? "text-indigo-200" : "text-zinc-400"
                      }`}
                    >
                      /month
                    </span>
                  )}
                  {billing === "annual" && price > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        tier.highlighted ? "text-indigo-200" : "text-zinc-400"
                      }`}
                    >
                      billed {formatCurrency(price * 12)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          tier.highlighted
                            ? "text-indigo-200"
                            : "text-emerald-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          tier.highlighted ? "text-indigo-100" : "text-zinc-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(tier.id, billing)}
                  variant={tier.highlighted ? "secondary" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {tier.id === "free"
                    ? "Start free"
                    : `Get ${tier.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
            Common questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What counts as a simulation?",
                a: "Each time you run the 7-agent simulation on a project, it counts as one simulation. You can create unlimited projects on any plan — simulations are what are counted.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your account settings and you'll keep access until the end of your billing period. No questions asked.",
              },
              {
                q: "What's the annual discount?",
                a: "Annual billing saves 20% vs monthly — that's 2 months free. You're charged upfront for the year.",
              },
              {
                q: "Is my project data private?",
                a: "Yes. Your project details and simulation results are private to your account and never shared. We use Supabase with row-level security.",
              },
              {
                q: "What's a 'Project Rescue' credit?",
                a: "When you're on the free plan and hit your limit mid-project, you can buy a pack of 5 one-time simulation credits for $19 to get through a crunch without upgrading.",
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
