"use client";

import { useState } from "react";
import type { GeneratedFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface FileViewerProps {
  file: GeneratedFile | null;
}

export function FileViewer({ file }: FileViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
        Select a file to view its contents
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <span className="text-sm font-mono text-zinc-300">{file.path}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-zinc-400 hover:text-white h-7 px-2"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <div className="overflow-auto flex-1">
        <pre className="text-sm font-mono text-zinc-300 p-4 leading-relaxed whitespace-pre">
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}
