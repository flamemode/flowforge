"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PROJECT_TYPE_OPTIONS,
  FRAMEWORK_OPTIONS,
  LANGUAGE_OPTIONS,
  STYLING_OPTIONS,
  DATABASE_OPTIONS,
  CMS_OPTIONS,
  AUTH_OPTIONS,
  PAYMENT_OPTIONS,
  EXTRA_API_OPTIONS,
  DESIGN_STYLE_OPTIONS,
  COLOR_SCHEME_OPTIONS,
  ANIMATION_OPTIONS,
  FEATURE_OPTIONS,
  MOBILE_APP_TYPE_OPTIONS,
  MOBILE_FRAMEWORK_OPTIONS,
  MOBILE_BACKEND_OPTIONS,
  MOBILE_FEATURE_OPTIONS,
  DEV_OS_OPTIONS,
  NODE_VERSION_OPTIONS,
} from "@/lib/constants";
import type { ProjectQuestionnaire } from "@/types";
import { ChevronRight, ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";

// Web steps (indices 1–10 in the combined flow)
const WEB_STEPS = [
  "Project type",
  "Framework",
  "Language & Styling",
  "Database",
  "CMS",
  "Auth & Payments",
  "Extra APIs",
  "Design & Feel",
  "Features",
  "Describe it",
];

// Mobile steps (indices 1–7 in the combined flow)
const MOBILE_STEPS = [
  "App Type",
  "Framework",
  "Backend",
  "Auth & Payments",
  "Features",
  "Design & Feel",
  "Describe it",
];

const empty: ProjectQuestionnaire = {
  platform: "web",
  project_type: "saas",
  framework: "nextjs",
  language: "typescript",
  styling: "tailwind",
  database: "supabase",
  cms: "none",
  auth: "supabase_auth",
  payments: "none",
  extra_apis: [],
  design_style: "minimalist",
  color_scheme: "dark",
  animations: "subtle",
  features: [],
  mobile_features: [],
  description: "",
  project_name: "",
};

export default function NewProjectPage() {
  const router = useRouter();
  // step 0 = platform selector; step 1+ = platform-specific steps
  const [step, setStep] = useState(0);
  const [q, setQ] = useState<ProjectQuestionnaire>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobile = q.platform === "mobile";
  const platformSteps = isMobile ? MOBILE_STEPS : WEB_STEPS;
  // Total steps: 0 (platform) + platformSteps
  const totalSteps = 1 + platformSteps.length;
  const currentLabel = step === 0 ? "Platform" : platformSteps[step - 1];

  const set = <K extends keyof ProjectQuestionnaire>(key: K, val: ProjectQuestionnaire[K]) =>
    setQ((prev) => ({ ...prev, [key]: val }));

  const toggleApi = (val: string) =>
    setQ((prev) => ({
      ...prev,
      extra_apis: (prev.extra_apis ?? []).includes(val as never)
        ? (prev.extra_apis ?? []).filter((a) => a !== val)
        : [...(prev.extra_apis ?? []), val as never],
    }));

  const toggleFeature = (val: string) =>
    setQ((prev) => ({
      ...prev,
      features: (prev.features ?? []).includes(val as never)
        ? (prev.features ?? []).filter((f) => f !== val)
        : [...(prev.features ?? []), val as never],
    }));

  const toggleMobileFeature = (val: string) =>
    setQ((prev) => ({
      ...prev,
      mobile_features: (prev.mobile_features ?? []).includes(val as never)
        ? (prev.mobile_features ?? []).filter((f) => f !== val)
        : [...(prev.mobile_features ?? []), val as never],
    }));

  const isLastStep = step === totalSteps - 1;

  const canNext = () => {
    if (isLastStep) return q.description.trim().length > 10 && q.project_name.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: q.project_name, questionnaire: q }),
      });
      if (res.status === 402) { router.push("/pricing"); return; }
      if (res.status === 401) { router.push("/auth/signup?redirect=/new"); return; }
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Something went wrong");
        return;
      }
      const { project } = await res.json();
      router.push(`/project/${project.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step label helper ──────────────────────────────────────────────────────

  const allStepLabels = ["Platform", ...platformSteps];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-10">
          {allStepLabels.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i < step ? "bg-violet-600 text-white" :
                i === step ? "bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-zinc-950" :
                "bg-zinc-800 text-zinc-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < allStepLabels.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < step ? "bg-violet-600" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2">{currentLabel}</h2>
        <p className="text-zinc-400 mb-8 text-sm">Step {step + 1} of {totalSteps}</p>

        {/* Step content */}
        <div className="space-y-3">

          {/* ── Step 0 — Platform ────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  set("platform", "web");
                  setStep(1);
                }}
                className={`flex flex-col items-center gap-4 p-8 rounded-2xl border text-left transition-all ${
                  q.platform === "web"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <span className="text-5xl">🌐</span>
                <div>
                  <div className="font-bold text-white text-lg text-center">Web App</div>
                  <div className="text-xs text-zinc-400 mt-1 text-center">Next.js, Remix, Astro, Vue…</div>
                </div>
              </button>
              <button
                onClick={() => {
                  set("platform", "mobile");
                  setStep(1);
                }}
                className={`flex flex-col items-center gap-4 p-8 rounded-2xl border text-left transition-all ${
                  q.platform === "mobile"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <span className="text-5xl">📱</span>
                <div>
                  <div className="font-bold text-white text-lg text-center">Mobile App</div>
                  <div className="text-xs text-zinc-400 mt-1 text-center">Expo, Flutter, Swift, Kotlin…</div>
                </div>
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              WEB STEPS (step 1–10)
          ════════════════════════════════════════════════════════════════════ */}

          {/* Web Step 1 — Project type */}
          {!isMobile && step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("project_type", opt.value as ProjectQuestionnaire["project_type"])}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    q.project_type === opt.value
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Web Step 2 — Framework */}
          {!isMobile && step === 2 && (
            <div className="space-y-3">
              {FRAMEWORK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("framework", opt.value as ProjectQuestionnaire["framework"])}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    q.framework === opt.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium text-white">{opt.label}</span>
                  <span className="text-sm text-zinc-400">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Web Step 3 — Language & Styling */}
          {!isMobile && step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Language</p>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("language", opt.value as ProjectQuestionnaire["language"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.language === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Styling</p>
                <div className="grid grid-cols-2 gap-3">
                  {STYLING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("styling", opt.value as ProjectQuestionnaire["styling"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.styling === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Web Step 4 — Database */}
          {!isMobile && step === 4 && (
            <div className="space-y-3">
              {DATABASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("database", opt.value as ProjectQuestionnaire["database"])}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    q.database === opt.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium text-white">{opt.label}</span>
                  <span className="text-sm text-zinc-400">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Web Step 5 — CMS */}
          {!isMobile && step === 5 && (
            <div className="space-y-3">
              {CMS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("cms", opt.value as ProjectQuestionnaire["cms"])}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    q.cms === opt.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium text-white">{opt.label}</span>
                  <span className="text-sm text-zinc-400">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Web Step 6 — Auth & Payments */}
          {!isMobile && step === 6 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Authentication</p>
                <div className="space-y-2">
                  {AUTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("auth", opt.value as ProjectQuestionnaire["auth"])}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        q.auth === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <span className="font-medium text-white">{opt.label}</span>
                      <span className="text-sm text-zinc-400">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Payments</p>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("payments", opt.value as ProjectQuestionnaire["payments"])}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        q.payments === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <span className="font-medium text-white">{opt.label}</span>
                      <span className="text-sm text-zinc-400">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Web Step 7 — Extra APIs */}
          {!isMobile && step === 7 && (
            <div>
              <p className="text-sm text-zinc-400 mb-4">Select all that apply — or skip if none needed.</p>
              <div className="grid grid-cols-2 gap-3">
                {EXTRA_API_OPTIONS.map((opt) => {
                  const selected = (q.extra_apis ?? []).includes(opt.value as never);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleApi(opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Web Step 8 — Design & Feel */}
          {!isMobile && step === 8 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Design style</p>
                <div className="grid grid-cols-2 gap-3">
                  {DESIGN_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("design_style", opt.value as ProjectQuestionnaire["design_style"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.design_style === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Color scheme</p>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_SCHEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("color_scheme", opt.value as ProjectQuestionnaire["color_scheme"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.color_scheme === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Animations</p>
                <div className="grid grid-cols-2 gap-3">
                  {ANIMATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("animations", opt.value as ProjectQuestionnaire["animations"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.animations === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Web Step 9 — Features */}
          {!isMobile && step === 9 && (
            <div>
              <p className="text-sm text-zinc-400 mb-4">Select features to include — or skip to keep it lean.</p>
              <div className="grid grid-cols-2 gap-3">
                {FEATURE_OPTIONS.map((opt) => {
                  const selected = (q.features ?? []).includes(opt.value as never);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleFeature(opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              MOBILE STEPS (step 1–7)
          ════════════════════════════════════════════════════════════════════ */}

          {/* Mobile Step 1 — App Type */}
          {isMobile && step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {MOBILE_APP_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("mobile_app_type", opt.value as ProjectQuestionnaire["mobile_app_type"])}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    q.mobile_app_type === opt.value
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Step 2 — Framework */}
          {isMobile && step === 2 && (
            <div className="space-y-3">
              {MOBILE_FRAMEWORK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("mobile_framework", opt.value as ProjectQuestionnaire["mobile_framework"])}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    q.mobile_framework === opt.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium text-white">{opt.label}</span>
                  <span className="text-sm text-zinc-400">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Step 3 — Backend */}
          {isMobile && step === 3 && (
            <div className="space-y-3">
              {MOBILE_BACKEND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("mobile_backend", opt.value as ProjectQuestionnaire["mobile_backend"])}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    q.mobile_backend === opt.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium text-white">{opt.label}</span>
                  <span className="text-sm text-zinc-400">{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Step 4 — Auth & Payments */}
          {isMobile && step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Authentication</p>
                <div className="space-y-2">
                  {AUTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("auth", opt.value as ProjectQuestionnaire["auth"])}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        q.auth === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <span className="font-medium text-white">{opt.label}</span>
                      <span className="text-sm text-zinc-400">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Payments</p>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("payments", opt.value as ProjectQuestionnaire["payments"])}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        q.payments === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <span className="font-medium text-white">{opt.label}</span>
                      <span className="text-sm text-zinc-400">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Step 5 — Features */}
          {isMobile && step === 5 && (
            <div>
              <p className="text-sm text-zinc-400 mb-4">Select mobile features to include — or skip to keep it lean.</p>
              <div className="grid grid-cols-2 gap-3">
                {MOBILE_FEATURE_OPTIONS.map((opt) => {
                  const selected = (q.mobile_features ?? []).includes(opt.value as never);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleMobileFeature(opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile Step 6 — Design & Feel */}
          {isMobile && step === 6 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Design style</p>
                <div className="grid grid-cols-2 gap-3">
                  {DESIGN_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("design_style", opt.value as ProjectQuestionnaire["design_style"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.design_style === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Color scheme</p>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_SCHEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("color_scheme", opt.value as ProjectQuestionnaire["color_scheme"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.color_scheme === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Animations</p>
                <div className="grid grid-cols-2 gap-3">
                  {ANIMATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("animations", opt.value as ProjectQuestionnaire["animations"])}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        q.animations === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Last step — Describe (shared web step 9 / mobile step 7) ──── */}
          {isLastStep && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Project name</label>
                <input
                  type="text"
                  value={q.project_name}
                  onChange={(e) => set("project_name", e.target.value)}
                  placeholder="e.g. AcmeShop, MyPortfolio"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Describe your project</label>
                <textarea
                  value={q.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder={
                    isMobile
                      ? "e.g. A fitness app where users log workouts, track progress with charts, and connect with friends."
                      : "e.g. A SaaS app for freelance photographers to share galleries with clients, collect feedback, and receive payments via Stripe."
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                />
                <p className="text-xs text-zinc-500 mt-1">{q.description.length} chars — aim for 20–300</p>
              </div>

              {/* Dev environment */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Your operating system</label>
                <div className="grid grid-cols-2 gap-2">
                  {DEV_OS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("dev_os", opt.value as ProjectQuestionnaire["dev_os"])}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                        q.dev_os === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{opt.label}</div>
                        <div className="text-xs text-zinc-500">{opt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Node.js version <span className="text-zinc-600 font-normal">(run <code className="bg-zinc-800 px-1 rounded text-xs">node --version</code> to check)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {NODE_VERSION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("node_version", opt.value as ProjectQuestionnaire["node_version"])}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        q.node_version === opt.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{opt.label}</div>
                      <div className="text-xs text-zinc-500">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-4 text-sm space-y-1">
                <p className="font-semibold text-zinc-300 mb-2">Your stack</p>
                {isMobile ? (
                  <>
                    {[
                      ["Platform", "Mobile App"],
                      q.mobile_app_type ? ["App type", MOBILE_APP_TYPE_OPTIONS.find(o => o.value === q.mobile_app_type)?.label] : null,
                      q.mobile_framework ? ["Framework", MOBILE_FRAMEWORK_OPTIONS.find(o => o.value === q.mobile_framework)?.label] : null,
                      q.mobile_backend ? ["Backend", MOBILE_BACKEND_OPTIONS.find(o => o.value === q.mobile_backend)?.label] : null,
                      q.auth && q.auth !== "none" ? ["Auth", AUTH_OPTIONS.find(o => o.value === q.auth)?.label] : null,
                      q.payments && q.payments !== "none" ? ["Payments", PAYMENT_OPTIONS.find(o => o.value === q.payments)?.label] : null,
                      q.mobile_features && q.mobile_features.length > 0 ? ["Features", q.mobile_features.join(", ")] : null,
                      q.design_style ? ["Design", DESIGN_STYLE_OPTIONS.find(o => o.value === q.design_style)?.label] : null,
                      q.color_scheme ? ["Colors", COLOR_SCHEME_OPTIONS.find(o => o.value === q.color_scheme)?.label] : null,
                    ].filter(Boolean).map((row) => {
                      const [k, v] = row as [string, string];
                      return (
                        <div key={k} className="flex gap-2">
                          <span className="text-zinc-500 w-20 flex-shrink-0">{k}</span>
                          <span className="text-zinc-200">{v}</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[
                      ["Platform", "Web App"],
                      ["Type", PROJECT_TYPE_OPTIONS.find(o => o.value === q.project_type)?.label],
                      ["Framework", FRAMEWORK_OPTIONS.find(o => o.value === q.framework)?.label],
                      ["Language", q.language === "typescript" ? "TypeScript" : "JavaScript"],
                      ["Styling", STYLING_OPTIONS.find(o => o.value === q.styling)?.label],
                      ["Database", DATABASE_OPTIONS.find(o => o.value === q.database)?.label],
                      q.cms !== "none" ? ["CMS", CMS_OPTIONS.find(o => o.value === q.cms)?.label] : null,
                      q.auth !== "none" ? ["Auth", AUTH_OPTIONS.find(o => o.value === q.auth)?.label] : null,
                      q.payments !== "none" ? ["Payments", PAYMENT_OPTIONS.find(o => o.value === q.payments)?.label] : null,
                      q.extra_apis && q.extra_apis.length > 0 ? ["APIs", q.extra_apis.join(", ")] : null,
                      ["Design", DESIGN_STYLE_OPTIONS.find(o => o.value === q.design_style)?.label],
                      ["Colors", COLOR_SCHEME_OPTIONS.find(o => o.value === q.color_scheme)?.label],
                      ["Motion", ANIMATION_OPTIONS.find(o => o.value === q.animations)?.label],
                      q.features && q.features.length > 0 ? ["Features", q.features.join(", ")] : null,
                    ].filter(Boolean).map((row) => {
                      const [k, v] = row as [string, string];
                      return (
                        <div key={k} className="flex gap-2">
                          <span className="text-zinc-500 w-20 flex-shrink-0">{k}</span>
                          <span className="text-zinc-200">{v}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950 border border-red-800 px-4 py-2 rounded-lg">{error}</p>
              )}
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {!isLastStep ? (
            // On step 0 (platform), clicking the platform card auto-advances,
            // but keep Continue button for cases where user came back
            step === 0 ? (
              <Button onClick={() => setStep(1)} className="bg-violet-600 hover:bg-violet-700">
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} className="bg-violet-600 hover:bg-violet-700">
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {loading ? "Creating project..." : "Generate project"}
              {!loading && <Zap className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
