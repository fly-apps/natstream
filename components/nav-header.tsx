"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Github } from "lucide-react";

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
            <div className="w-8 h-8 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub repository</span>
            </a>
            <ModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  const isDark = resolvedTheme === "dark";
  const logoSrc = isDark ? "/fly-logo-dark.svg" : "/fly-logo-light.svg";

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={logoSrc} 
            alt="Fly.io" 
            className="w-8 h-8"
          />
        </div>
        <div className="flex items-center gap-4">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-foreground/80 transition-colors">
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub repository</span>
          </a>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
} 