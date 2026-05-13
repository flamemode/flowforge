/**
 * Structured logging utility. Outputs JSON for easy parsing by log aggregators.
 *
 * To add Sentry:
 *   1. npm install @sentry/nextjs
 *   2. Run `npx @sentry/wizard@latest -i nextjs`
 *   3. Uncomment the Sentry.captureException calls below
 */

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  projectId?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error ?? "");
    const errorStack = error instanceof Error ? error.stack : undefined;
    log("error", message, {
      ...context,
      error: errorMessage,
      stack: errorStack,
    });

    // Uncomment when Sentry is configured:
    // import * as Sentry from "@sentry/nextjs";
    // if (error instanceof Error) Sentry.captureException(error, { extra: context });
  },
};
