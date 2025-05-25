"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Github, Logs } from "lucide-react";

export function NavHeader() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logs className="w-8 h-8 text-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-foreground hover:text-purple-800 transition-colors">
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub repository</span>
            </a>
            <ModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logs className="w-8 h-8 text-foreground" />
        </div>
        <div className="flex items-center gap-4">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-purple-800 transition-colors">
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub repository</span>
          </a>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
} 