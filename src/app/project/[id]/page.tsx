"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileTree } from "@/components/project/FileTree";
import { FileViewer } from "@/components/project/FileViewer";
import type { GeneratedProject, GeneratedFile } from "@/types";
import { Download, Zap, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface GenerationEvent {
  type: "progress" | "file" | "complete" | "error";
  data: {
    label?: string;
    file?: GeneratedFile;
    message?: string;
  };
}

const STEPS = [
  "Generating package.json...",
  "Generating config files...",
  "Generating .env.example...",
  "Generating database schema...",
  "Generating app layout and pages...",
  "Generating lib utilities...",
  "Generating feature pages...",
  "Generating UI components...",
  "Generating layout components...",
  "Generating feature components...",
  "Generating API routes...",
  "Generating CMS files...",
  "Generating public assets...",
  "Generating README...",
];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const streamRef = useRef(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(({ project, files: f }) => {
        setProject(project);
        if (f?.length > 0) {
          setFiles(f);
          selectFile(f[0]);
        }
        const needsGeneration =
          project?.status === "pending" ||
          project?.status === "generating" ||
          project?.status === "failed" ||
          (project?.status === "complete" && (!f || f.length === 0));

        if (needsGeneration) startGeneration();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selectFile = async (file: GeneratedFile) => {
    setSelectedPath(file.path);
    // If content is already loaded, use it
    if (file.content) {
      setSelectedFile(file);
      return;
    }
    // Fetch content from API
    if (!file.id) return;
    setLoadingFile(true);
    try {
      const res = await fetch(`/api/projects/${id}/files/${file.id}`);
      if (res.ok) {
        const { file: fullFile } = await res.json();
        setSelectedFile(fullFile);
        // Cache the content in the files list
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, content: fullFile.content } : f));
      }
    } finally {
      setLoadingFile(false);
    }
  };

  const retryGeneration = () => {
    streamRef.current = false;
    setFiles([]);
    setSelectedPath(null);
    setCompletedSteps([]);
    setCurrentLabel("");
    setProject((p) => p ? { ...p, status: "generating" } : p);
    startGeneration();
  };

  const startGeneration = async () => {
    if (streamRef.current) return;
    streamRef.current = true;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${id}/generate`, { method: "POST" });
      if (!response.ok) {
        const text = await response.text();
        setError(text);
        setIsGenerating(false);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: GenerationEvent = JSON.parse(line.slice(6));

            if (event.type === "progress" && event.data.label) {
              setCurrentLabel(event.data.label);
              setCompletedSteps((prev) => {
                const done = STEPS.filter((s) => s !== event.data.label && !prev.includes(s) &&
                  STEPS.indexOf(s) < STEPS.indexOf(event.data.label!));
                return [...prev, ...done];
              });
            }

            if (event.type === "file" && event.data.file) {
              const file = event.data.file as GeneratedFile;
              setFiles((prev) => {
                const exists = prev.find((f) => f.path === file.path);
                return exists ? prev : [...prev, file];
              });
              // Auto-select first file with content for live preview
              setSelectedPath((p) => {
                if (!p) { setSelectedFile(file); return file.path; }
                return p;
              });
            }

            if (event.type === "complete") {
              setIsGenerating(false);
              setCurrentLabel("");
              setCompletedSteps(STEPS);
              setProject((p) => p ? { ...p, status: "complete" } : p);
            }

            if (event.type === "error") {
              setError(event.data.message ?? "Generation failed");
              setIsGenerating(false);
            }
          } catch { /* malformed chunk */ }
        }
      }
    } catch (err) {
      setError(String(err));
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/projects/${id}/download`);
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Download failed" }));
        alert(error ?? "Download failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name?.toLowerCase().replace(/\s+/g, "-") ?? "project"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const isComplete = project?.status === "complete";

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 h-14 flex items-center px-6 gap-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300 font-medium truncate">{project?.name ?? "Loading..."}</span>
        <div className="ml-auto flex items-center gap-3">
          {isComplete && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{files.length} files generated</span>
            </div>
          )}
          {isGenerating && (
            <div className="flex items-center gap-1.5 text-violet-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{files.length} files so far...</span>
            </div>
          )}
          <Button
            onClick={handleDownload}
            disabled={!isComplete || downloading}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Preparing ZIP..." : "Download ZIP"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: generation progress or file tree */}
        <div className="w-72 border-r border-zinc-800 flex flex-col flex-shrink-0 overflow-hidden">
          {isGenerating && files.length === 0 ? (
            // Generation progress (no files yet)
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Generating</p>
              {STEPS.map((step) => {
                const done = completedSteps.includes(step);
                const active = currentLabel === step;
                return (
                  <div key={step} className={`flex items-center gap-2.5 text-sm ${done ? "text-emerald-400" : active ? "text-violet-300" : "text-zinc-600"}`}>
                    {done ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> :
                      active ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" /> :
                      <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />}
                    <span className="truncate">{step.replace("...", "")}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Files</span>
                {isGenerating && (
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                <FileTree
                  files={files}
                  selected={selectedPath}
                  onSelect={(path) => {
                    const file = files.find((f) => f.path === path);
                    if (file) selectFile(file);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Right panel: file viewer */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <p className="text-zinc-300 font-semibold mb-2">Generation failed</p>
                <p className="text-zinc-500 text-sm mb-6">{error}</p>
                <Button
                  onClick={retryGeneration}
                  className="bg-violet-600 hover:bg-violet-700 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry generation
                </Button>
                <p className="text-zinc-600 text-xs mt-3">No credit will be charged for retries</p>
              </div>
            </div>
          ) : loadingFile ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : (
            <FileViewer file={selectedFile} />
          )}
        </div>
      </div>
    </div>
  );
}
