import { AGENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SimulationMessage } from "@/types";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  message: SimulationMessage;
  isNew?: boolean;
}

const messageTypeBadge = {
  statement: { label: "Statement", variant: "secondary" as const },
  question: { label: "Question", variant: "default" as const },
  concern: { label: "⚠️ Concern", variant: "warning" as const },
  decision: { label: "✅ Decision", variant: "success" as const },
  conflict: { label: "🔥 Conflict", variant: "danger" as const },
};

export function MessageBubble({ message, isNew }: MessageBubbleProps) {
  const agent = AGENTS[message.agent_role];
  const badge = messageTypeBadge[message.message_type];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl transition-all duration-500",
        isNew && "animate-fade-in",
        message.message_type === "conflict" && "bg-red-50 border border-red-200",
        message.message_type === "concern" && "bg-amber-50 border border-amber-200",
        message.message_type === "decision" && "bg-emerald-50 border border-emerald-200",
        !["conflict", "concern", "decision"].includes(message.message_type) &&
          "bg-zinc-50 border border-zinc-200"
      )}
    >
      <AgentAvatar role={message.agent_role} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-zinc-900">
            {agent?.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: (agent?.color ?? "#6366f1") + "20",
              color: agent?.color ?? "#6366f1",
            }}
          >
            {agent?.role.replace(/_/g, " ")}
          </span>
          <Badge variant={badge.variant} className="ml-auto">
            {badge.label}
          </Badge>
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
