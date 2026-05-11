"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userEmail?: string;
  credits?: number;
}

export function Navbar({ userEmail, credits }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 gap-6 text-white">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
        <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        Origo
      </Link>

      <div className="ml-auto flex items-center gap-4">
        {credits !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-zinc-300">
              <span className="font-bold text-white">{credits}</span> credit{credits !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <span className="text-sm text-zinc-500 hidden md:block">{userEmail}</span>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="text-zinc-400 hover:text-white">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
