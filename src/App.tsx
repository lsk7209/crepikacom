import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Home from "./pages/Home";
import ToolPage from "./pages/tools/ToolPage";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

const queryClient = new QueryClient();

function AppContent() {
  const { showHelp, setShowHelp } = useGlobalShortcuts();

  return (
    <>
      <Toaster />
      <Sonner />
      <KeyboardShortcutsModal open={showHelp} onOpenChange={setShowHelp} />
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/:id" element={<ToolPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
