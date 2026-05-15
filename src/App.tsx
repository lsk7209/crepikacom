import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Suspense, lazy, useEffect } from "react";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

const Home = lazy(() => import("./pages/Home"));
const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);
const KeyboardShortcutsModal = lazy(() =>
  import("@/components/KeyboardShortcutsModal").then((m) => ({
    default: m.KeyboardShortcutsModal,
  })),
);

const ToolPage = lazy(() => import("./pages/tools/ToolPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

function AppContent() {
  const { showHelp, setShowHelp } = useGlobalShortcuts();
  const location = useLocation();

  useEffect(() => {
    if (typeof (window as any).gtag !== "undefined") {
      (window as any).gtag("config", "G-P8LJ76FVM4", {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);

  return (
    <>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <Suspense fallback={null}>
        <Sonner />
      </Suspense>
      <Suspense fallback={null}>
        <KeyboardShortcutsModal open={showHelp} onOpenChange={setShowHelp} />
      </Suspense>
      <AppShell>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          }
        >
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
  <TooltipProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
