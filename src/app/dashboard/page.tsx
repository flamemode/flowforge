import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { SIMULATION_LIMITS } from "@/lib/constants";
import { Plus, Zap } from "lucide-react";
import type { Project, UserProfile } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("projects")
      .select("*, simulations(id, status, success_probability, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const typedProfile = profile as UserProfile | null;
  const typedProjects = (projects || []) as Project[];

  const monthlyLimit = typedProfile
    ? SIMULATION_LIMITS[typedProfile.subscription_tier]
    : 3;

  const simUsed = typedProfile?.simulations_used_this_month ?? 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        userEmail={user.email}
        tier={typedProfile?.subscription_tier ?? "free"}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {typedProfile?.agency_name
                ? `${typedProfile.agency_name} Dashboard`
                : "Dashboard"}
            </h1>
            <p className="text-zinc-500 mt-0.5">
              {typedProjects.length} project
              {typedProjects.length !== 1 ? "s" : ""}
              {monthlyLimit !== null && (
                <span className="ml-2 text-zinc-400">
                  · {simUsed} / {monthlyLimit} simulations used this month
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href="/simulation/new">
              <Plus className="w-4 h-4" />
              New project
            </Link>
          </Button>
        </div>

        {/* Usage warning for free tier */}
        {typedProfile?.subscription_tier === "free" && monthlyLimit !== null && simUsed >= monthlyLimit && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800 font-medium">
                You&apos;ve used all {monthlyLimit} free simulations this month.
              </span>
            </div>
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}

        {/* Projects grid */}
        {typedProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              No projects yet
            </h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Create your first project to run a simulation. It only takes 2
              minutes to set up.
            </p>
            <Button asChild size="lg">
              <Link href="/simulation/new">
                <Plus className="w-4 h-4" />
                Create your first project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
