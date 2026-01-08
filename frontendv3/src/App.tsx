import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingLayout } from "./components/layout/LandingLayout";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { queryClient } from "./lib/query";
import ComponentsDemo from "./pages/ComponentsDemo";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import OnboardingChoice from "./pages/OnboardingChoice";
import Projects from "./pages/Projects";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <ProjectProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes with Landing Layout */}
                <Route element={<LandingLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* Onboarding Routes (no layout) */}
                <Route path="/onboarding" element={<OnboardingChoice />} />
                <Route path="/onboarding/flow" element={<Onboarding />} />

                {/* Demo Route (no layout) */}
                <Route path="/demo" element={<ComponentsDemo />} />

                {/* Authenticated Routes with App Layout */}
                <Route element={<AppLayout />}>
                  {/* Global Routes */}
                  <Route path="/projects" element={<Projects />} />
                  <Route
                    path="/results"
                    element={<div className="p-8">Results</div>}
                  />
                  <Route
                    path="/settings"
                    element={<div className="p-8">Settings</div>}
                  />

                  {/* Project-Specific Routes */}
                  <Route
                    path="/projects/:id/dashboard"
                    element={<Dashboard />}
                  />
                  <Route
                    path="/projects/:id/analyze"
                    element={<div className="p-8">Analyze</div>}
                  />
                  <Route
                    path="/projects/:id/results"
                    element={<div className="p-8">Project Results</div>}
                  />
                  <Route
                    path="/projects/:id/rules"
                    element={<div className="p-8">Rules</div>}
                  />
                  <Route
                    path="/projects/:id/settings"
                    element={<div className="p-8">Project Settings</div>}
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </ProjectProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
