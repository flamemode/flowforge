"use client";

import { useState } from "react";
import type { GeneratedFile } from "@/types";
import { ChevronRight, ChevronDown, FileCode, FileText, FolderOpen, Folder } from "lucide-react";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNode[];
  file?: GeneratedFile;
}

function buildTree(files: GeneratedFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const existing = current.find((n) => n.name === part);

      if (isLast) {
        if (!existing) {
          current.push({ name: part, path: file.path, type: "file", file });
        }
      } else {
        if (existing && existing.type === "dir") {
          current = existing.children!;
        } else {
          const dir: TreeNode = {
            name: part,
            path: parts.slice(0, i + 1).join("/"),
            type: "dir",
            children: [],
          };
          current.push(dir);
          current = dir.children!;
        }
      }
    }
  }

  // Sort: dirs first, then files, both alphabetically
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sort(node.children);
    }
  };
  sort(root);

  return root;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["ts", "tsx", "js", "jsx"].includes(ext ?? "")) return <FileCode className="w-4 h-4 text-blue-400 flex-shrink-0" />;
  if (ext === "sql") return <FileCode className="w-4 h-4 text-orange-400 flex-shrink-0" />;
  if (ext === "json") return <FileCode className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  if (ext === "css" || ext === "scss") return <FileCode className="w-4 h-4 text-pink-400 flex-shrink-0" />;
  if (ext === "md") return <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />;
  return <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
}

interface NodeProps {
  node: TreeNode;
  depth: number;
  selected: string | null;
  onSelect: (path: string) => void;
}

function TreeNodeItem({ node, depth, selected, onSelect }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 text-sm"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {open ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />}
          {open ? <FolderOpen className="w-4 h-4 text-violet-400 flex-shrink-0" /> : <Folder className="w-4 h-4 text-violet-400 flex-shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children?.map((child) => (
          <TreeNodeItem key={child.path} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-sm transition-colors ${
        selected === node.path
          ? "bg-violet-600/20 text-violet-300"
          : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <span className="w-3.5 h-3.5 flex-shrink-0" />
      {fileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface FileTreeProps {
  files: GeneratedFile[];
  selected: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ files, selected, onSelect }: FileTreeProps) {
  const tree = buildTree(files);

  return (
    <div className="py-2">
      {tree.map((node) => (
        <TreeNodeItem key={node.path} node={node} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}
