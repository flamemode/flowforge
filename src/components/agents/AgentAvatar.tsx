import { AGENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AgentRole } from "@/types";

interface AgentAvatarProps {
  role: AgentRole;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
};

export function AgentAvatar({
  role,
  size = "md",
  showName = false,
  className,
}: AgentAvatarProps) {
  const agent = AGENTS[role];
  if (!agent) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-medium",
          sizeClasses[size]
        )}
        style={{ backgroundColor: agent.color + "20", border: `2px solid ${agent.color}40` }}
        title={agent.name}
      >
        <span>{agent.emoji}</span>
      </div>
      {showName && (
        <div>
          <p className="text-sm font-medium text-zinc-900">{agent.name}</p>
          <p className="text-xs text-zinc-500">
            {agent.role.replace(/_/g, " ")}
          </p>
        </div>
      )}
    </div>
  );
}
