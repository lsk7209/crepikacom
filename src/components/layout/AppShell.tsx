import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CrePic
            </span>
          </Link>
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/60 hover:text-foreground px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            >
              Tools
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-8 mt-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">CrePic</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              No Login. 3-Second Tools for Creators.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 CrePic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
