"use client";

import "./globals.css";
import { RegistryProvider } from "@effect-atom/atom-react";
import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandOpen, setCommandOpen] = useState(false);

  const handleSearchClick = useCallback(() => {
    setCommandOpen(true);
  }, []);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ATS - Applicant Tracking System</title>
        <meta name="description" content="Modern applicant tracking system" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RegistryProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar onSearchClick={handleSearchClick} />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
            <Toaster />
          </RegistryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
