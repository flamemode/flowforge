"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userEmail?: string;
  tier?: string;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar({ userEmail, tier }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-900">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        FlowForge
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-50 text-indigo-700"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {tier && tier !== "free" && (
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full capitalize">
            {tier}
          </span>
        )}
        {tier === "free" && (
          <Button size="sm" asChild>
            <Link href="/pricing">Upgrade</Link>
          </Button>
        )}
        <span className="text-sm text-zinc-500 hidden md:block">{userEmail}</span>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
