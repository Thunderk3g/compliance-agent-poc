import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Submissions } from './pages/Submissions';
import { Results } from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import Onboarding from './pages/Onboarding';

import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<ProjectList />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="global-stats" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
