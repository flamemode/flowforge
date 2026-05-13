"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-lg text-zinc-500">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} className="mt-8">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
