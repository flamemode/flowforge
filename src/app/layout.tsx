import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Origo — AI Developer Starting Point",
  description:
    "Answer 8 questions, get a complete production-ready starter project. Every file, every config, every API route. Download and ship.",
  keywords: [
    "developer starter",
    "project scaffolding",
    "AI code generation",
    "Next.js starter",
    "boilerplate generator",
  ],
  openGraph: {
    title: "Origo — AI Developer Starting Point",
    description:
      "Answer 8 questions, get a complete starter project. Download ZIP and start building.",
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
