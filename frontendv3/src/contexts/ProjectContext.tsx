import { createContext, ReactNode, useContext, useState } from 'react';

interface Project {
  id: string;
  name: string;
  tier: 'hobby' | 'pro' | 'enterprise';
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>({
    id: '1',
    name: "abhishekg's projects",
    tier: 'hobby',
  });
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: "abhishekg's projects", tier: 'hobby' },
  ]);

  return (
    <ProjectContext.Provider value={{ currentProject, projects, setCurrentProject, setProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
