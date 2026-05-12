"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import type { GeneratedProject } from "@/types";

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

export function ProjectCard({ project }: { project: GeneratedProject }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const q = project.questionnaire as unknown as Record<string, string>;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
      {/* Confirmation overlay */}
      {confirming && (
        <div className="absolute inset-0 bg-zinc-900/95 rounded-xl flex flex-col items-center justify-center p-5 z-10">
          <Trash2 className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-white font-semibold text-sm mb-1 text-center">Delete &quot;{project.name}&quot;?</p>
          <p className="text-zinc-400 text-xs text-center mb-5">This will permanently delete the project and all generated files. This cannot be undone.</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      )}

      <Link href={`/project/${project.id}`} className="block">
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

      {/* Delete button — shown on hover */}
      <button
        onClick={(e) => { e.preventDefault(); setConfirming(true); }}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete project"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
