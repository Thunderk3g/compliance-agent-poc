
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import { LandingPage } from './components/LandingPage';
import { ToolsLayout } from './components/layout/ToolsLayout';
import SettingsPage from './components/tools/SettingsPage';
import SubmissionsPage from './components/tools/SubmissionsPage';
import UploadPage from './components/tools/UploadPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Tools (Dashboard) Routes */}
        <Route path="/tools" element={<ToolsLayout />}>
           <Route index element={<DashboardPage />} />
           <Route path="upload" element={<UploadPage />} />
           <Route path="submissions" element={<SubmissionsPage />} />
           <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
