import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Resume from "./pages/Resume";
import EyesOverlay from './components/EyesOverlay';
import { useTheme } from './hooks/useTheme';
import { useRef, useState, useEffect } from 'react';
import Header from './components/Header';

const queryClient = new QueryClient();

const EYES_OVERLAY_DURATION = 800;

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const [showEyes, setShowEyes] = useState(false);
  const [eyesPosition, setEyesPosition] = useState({ top: 100, left: 100 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevThemeRef = useRef(theme);

  // Function to trigger overlay (to be passed to Header/ThemeToggle)
  const triggerEyesOverlay = () => {
    // Randomize position
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const imgWidth = 300;
    const imgHeight = 200;
    const left = Math.random() * (vw - imgWidth);
    const top = Math.random() * (vh - imgHeight);
    setEyesPosition({ top, left });
    setShowEyes(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowEyes(false);
      timerRef.current = null;
    }, EYES_OVERLAY_DURATION);
  };

  // Watch for theme changes
  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      // If switching to light, show overlay
      if (theme === 'light') {
        triggerEyesOverlay();
      } else {
        // If switching to dark, hide overlay immediately
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setShowEyes(false);
      }
      prevThemeRef.current = theme;
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EyesOverlay show={showEyes} position={eyesPosition} />
          <div className="min-h-screen flex flex-col">
            <Header onLightMode={triggerEyesOverlay} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/resume" element={<Resume />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
