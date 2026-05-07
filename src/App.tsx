import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Suspense, lazy, useEffect } from "react";
import Home from "./pages/Home";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

const ToolPage = lazy(() => import("./pages/tools/ToolPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const queryClient = new QueryClient();

function AppContent() {
  const { showHelp, setShowHelp } = useGlobalShortcuts();
  const location = useLocation();

  useEffect(() => {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'G-P8LJ76FVM4', { page_path: location.pathname });
    }
  }, [location.pathname]);

  return (
    <>
      <Toaster />
      <Sonner />
      <KeyboardShortcutsModal open={showHelp} onOpenChange={setShowHelp} />
      <AppShell>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/:id" element={<ToolPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
