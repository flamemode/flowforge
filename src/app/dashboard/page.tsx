import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Zap, FileCode, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { GeneratedProject, UserProfile } from "@/types";

function statusIcon(status: string) {
  if (status === "complete") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === "generating") return <Clock className="w-4 h-4 text-violet-400 animate-pulse" />;
  if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-400" />;
  return <Clock className="w-4 h-4 text-zinc-500" />;
}

function statusLabel(status: string) {
  if (status === "complete") return "Ready";
  if (status === "generating") return "Generating...";
  if (status === "failed") return "Failed";
  return "Pending";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("generated_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const typedProfile = profile as UserProfile | null;
  const typedProjects = (projects ?? []) as GeneratedProject[];
  const credits = typedProfile?.credits ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 h-14 flex items-center px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-zinc-300"><span className="font-bold text-white">{credits}</span> credit{credits !== 1 ? "s" : ""}</span>
            {credits === 0 && (
              <Link href="/pricing" className="ml-2 text-xs text-violet-400 hover:text-violet-300 underline">Buy more</Link>
            )}
          </div>
          <span className="text-zinc-600 text-sm">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-zinc-500 hover:text-zinc-300">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your projects</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{typedProjects.length} project{typedProjects.length !== 1 ? "s" : ""} generated</p>
          </div>
          <Button asChild className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Link href="/new">
              <Plus className="w-4 h-4" />
              New project
            </Link>
          </Button>
        </div>

        {credits === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-300 font-medium">You&apos;re out of credits.</span>
            </div>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/pricing">Buy credits</Link>
            </Button>
          </div>
        )}

        {typedProjects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileCode className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm">
              Answer 8 quick questions and Origo generates your complete starter project in minutes.
            </p>
            <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 gap-2">
              <Link href="/new">
                <Plus className="w-4 h-4" />
                Generate your first project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typedProjects.map((project) => {
              const q = project.questionnaire as unknown as Record<string, string>;
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 hover:bg-zinc-900/80 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate pr-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {statusIcon(project.status)}
                      <span className="text-xs text-zinc-500">{statusLabel(project.status)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[q.framework, q.language, q.database].filter(v => v && v !== "none").map((tag) => (
                      <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.file_count > 0 && (
                    <p className="text-xs text-zinc-600">{project.file_count} files generated</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
