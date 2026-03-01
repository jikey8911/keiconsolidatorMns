import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ConfigurationPage from "./pages/ConfigurationPage";
import AnalysisPage from "./pages/AnalysisPage";
import ConsolidationPage from "./pages/ConsolidationPage";
import StatusPage from "./pages/StatusPage";
import NotificationCenter from "./components/NotificationCenter";

function Router() {
  const { isConfigured, currentPage } = useAppContext();

  // If not configured, always show configuration page
  if (!isConfigured) {
    return <ConfigurationPage />;
  }

  // Route based on currentPage state
  switch (currentPage) {
    case "config":
      return <ConfigurationPage />;
    case "analysis":
      return <AnalysisPage />;
    case "consolidation":
      return <ConsolidationPage />;
    case "status":
      return <StatusPage />;
    default:
      return <AnalysisPage />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <NotificationCenter />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
