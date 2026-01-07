import { ChevronDown, ChevronRight, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { useProjects } from '../../services/projects';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface AppNavbarProps {
  showProjectSelector?: boolean;
}

export function AppNavbar({ showProjectSelector = true }: AppNavbarProps) {
  const { user } = useUser();
  const { currentProject } = useProject();
  const { theme, toggleTheme } = useTheme();
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch all projects for the dropdown
  const { data: projects = [] } = useProjects();

  // Get the actual project name from the projects list
  const currentProjectData = projects.find((p: any) => p.id === projectId);
  const projectName = currentProjectData?.name || currentProject?.name || 'Project';
  const teamName = user?.name || user?.email || 'User';

  const handleProjectSwitch = (newProjectId: string) => {
    navigate(`/projects/${newProjectId}/dashboard`);
    setShowProjectDropdown(false);
  };

  return (
    <div className="border-b border-border bg-background">
      {/* Top bar - Logo, Team Name, Breadcrumbs, Theme Toggle */}
      <div className="h-14 px-6 flex items-center justify-between">
        {/* Left side - Logo + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link to="/projects" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">CB</span>
            </div>
            <span className="font-semibold text-sm">Compliance Bot</span>
          </Link>

          <Separator orientation="vertical" className="h-5" />

          {/* Team/User Name */}
          <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors">
            <span className="text-sm font-medium">{teamName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Breadcrumb - Projects */}
          {showProjectSelector && projectId && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />

              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
              >
                Projects
              </button>

              <ChevronRight className="w-4 h-4 text-muted-foreground" />

              {/* Current Project Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-medium">{projectName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Project Dropdown */}
                {showProjectDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProjectDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded shadow-lg z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-muted-foreground font-medium uppercase">
                          Switch Project
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {projects?.map((project: any) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectSwitch(project.id)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                project.id === projectId
                                  ? 'bg-accent text-accent-foreground'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <div className="font-medium">{project.name}</div>
                              {project.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {project.description}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <Separator className="my-2" />
                        <button
                          onClick={() => {
                            navigate('/onboarding');
                            setShowProjectDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded text-sm text-primary hover:bg-accent transition-colors"
                        >
                          + Create New Project
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right side - Theme Toggle + Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Profile Avatar */}
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium hover:opacity-80 transition-opacity"
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </div>
  );
}
