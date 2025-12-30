import { useProject } from '@/contexts/ProjectContext';
import { useUser } from '@/contexts/UserContext';
import { useProjects } from '@/services/projects';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Dropdown } from '../ui/Dropdown';

export function Navbar() {
  const { user } = useUser();
  const { currentProject } = useProject();
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch all projects for the dropdown
  const { data: projects = [] } = useProjects();
  
  // Check if we're inside a project (has project ID in URL)
  const isInProject = !!projectId;
  
  // Get the actual project name from the projects list
  const currentProjectData = projects.find((p: any) => p.id === projectId);
  const projectName = currentProjectData?.name || currentProject?.name || 'Project';

  // Determine current route name for breadcrumb (only when NOT in a project)
  const getCurrentRouteName = () => {
    const path = location.pathname;
    if (path.includes('/projects') && !projectId) return 'Projects';
    if (path.includes('/dashboard') && !projectId) return 'Dashboard';
    if (path.includes('/analysis')) return 'Analysis';
    if (path.includes('/submissions')) return 'Submissions';
    if (path.includes('/agent')) return 'Agent';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/onboarding')) return 'Onboarding';
    return 'Projects';
  };

  const currentRouteName = getCurrentRouteName();

  const handleProjectSwitch = (newProjectId: string) => {
    navigate(`/projects/${newProjectId}/dashboard`);
    setShowProjectDropdown(false);
  };

  return (
    <nav className="h-[60px] bg-black border-b border-zinc-800 flex items-center justify-between px-6">
      {/* Left side - Logo + Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
        </Link>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          {/* User/Account Selector */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                <span className="text-white font-medium">{user?.email || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            }
            items={[
              { label: 'Profile', onClick: () => navigate('/settings') },
              { label: 'Settings', onClick: () => navigate('/settings') },
              { label: 'Sign Out', onClick: () => navigate('/login') },
            ]}
          />

          {/* Separator */}
          <ChevronRight className="w-4 h-4 text-zinc-600" />

          {/* Current Route - Shows current page when NOT in a project */}
          {!isInProject && (
            <span className="text-zinc-300 font-medium px-3 py-1.5">
              {currentRouteName}
            </span>
          )}

          {/* Projects + Current Project - Only visible when inside a project */}
          {isInProject && (
            <>
              {/* Projects Link */}
              <button
                onClick={() => navigate('/projects')}
                className="px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
              >
                <span className="text-zinc-300 font-medium">Projects</span>
              </button>

              <ChevronRight className="w-4 h-4 text-zinc-600" />

              {/* Current Project Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-white font-medium">{projectName}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Project Dropdown */}
                {showProjectDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProjectDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-zinc-500 font-medium uppercase">
                          Switch Project
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {projects?.map((project: any) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectSwitch(project.id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                project.id === projectId
                                  ? 'bg-zinc-800 text-white'
                                  : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <div className="font-medium">{project.name}</div>
                              {project.description && (
                                <div className="text-xs text-zinc-500 truncate">{project.description}</div>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-zinc-800 mt-2 pt-2">
                          <button
                            onClick={() => {
                              navigate('/onboarding');
                              setShowProjectDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-indigo-400 hover:bg-zinc-800 transition-colors"
                          >
                            + Create New Project
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Search, Feedback, Docs, Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 transition-colors">
          <Search className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-500 text-sm">Find...</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">⌘K</kbd>
        </button>

        {/* Feedback */}
        <button className="text-zinc-400 hover:text-white text-sm transition-colors">
          Feedback
        </button>

        {/* Docs */}
        <button className="text-zinc-400 hover:text-white text-sm transition-colors">
          Docs
        </button>

        {/* Profile Avatar */}
        <Dropdown
          trigger={
            <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium hover:opacity-80 transition-opacity">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </button>
          }
          items={[
            { label: 'Profile', onClick: () => navigate('/settings') },
            { label: 'Settings', onClick: () => navigate('/settings') },
            { label: 'Sign Out', onClick: () => navigate('/login') },
          ]}
        />
      </div>
    </nav>
  );
}
