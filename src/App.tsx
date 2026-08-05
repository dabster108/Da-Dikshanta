import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Shell from "@/components/Shell";
import EntryView from "@/views/EntryView";
import IdentityView from "@/views/IdentityView";
import LabView from "@/views/LabView";
import RoboticsView from "@/views/RoboticsView";
import CryptographyView from "@/views/CryptographyView";
import ProjectsView from "@/views/ProjectsView";
import ProjectCaseStudyView from "@/views/ProjectCaseStudyView";
import JourneyView from "@/views/JourneyView";
import ContactView from "@/views/ContactView";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<EntryView />} />
                <Route path="identity" element={<IdentityView />} />
                <Route path="lab" element={<LabView />} />
                <Route path="robotics" element={<RoboticsView />} />
                <Route path="crypto" element={<CryptographyView />} />
                <Route path="projects" element={<ProjectsView />} />
                <Route path="projects/:id" element={<ProjectCaseStudyView />} />
                <Route path="journey" element={<JourneyView />} />
                <Route path="contact" element={<ContactView />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
