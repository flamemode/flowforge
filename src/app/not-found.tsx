import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-zinc-500">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
