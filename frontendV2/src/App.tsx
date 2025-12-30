import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectProvider } from './contexts/ProjectContext';
import { UserProvider } from './contexts/UserContext';
import { queryClient } from './lib/query';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OnboardingPage from './pages/Onboarding';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectsPage from './pages/Projects';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Authenticated Routes with Layout */}
              <Route element={<AppLayout />}>
                {/* Projects */}
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                
                {/* Project-Specific Routes */}
                <Route path="/projects/:id/dashboard" element={<ProjectDashboard />} />
                <Route path="/projects/:id/rules" element={<div className="p-6 text-white">Rules & Guidelines (Coming Soon)</div>} />
                <Route path="/projects/:id/analyze" element={<div className="p-6 text-white">Content Analysis (Coming Soon)</div>} />
                <Route path="/projects/:id/results" element={<div className="p-6 text-white">Analysis Results (Coming Soon)</div>} />
                <Route path="/projects/:id/settings" element={<div className="p-6 text-white">Project Settings (Coming Soon)</div>} />
                
                {/* Global Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analysis" element={<div className="p-6 text-white">Global Analysis (Coming Soon)</div>} />
                <Route path="/submissions" element={<div className="p-6 text-white">All Submissions (Coming Soon)</div>} />
                <Route path="/agent" element={<div className="p-6 text-white">Agent (Coming Soon)</div>} />
                <Route path="/settings" element={<div className="p-6 text-white">Settings (Coming Soon)</div>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
