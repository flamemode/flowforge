import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowForge — Agency Project Flight Simulator",
  description:
    "Simulate entire client projects with AI agents before you start real work. Predict bottlenecks, conflicts, and scope creep in minutes.",
  keywords: [
    "agency project management",
    "AI simulation",
    "project risk analysis",
    "creative agency tools",
    "scope creep prevention",
  ],
  openGraph: {
    title: "FlowForge — Agency Project Flight Simulator",
    description:
      "Simulate projects with AI agents. Predict risks before they happen.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
