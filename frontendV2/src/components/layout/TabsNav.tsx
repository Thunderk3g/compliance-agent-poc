import { cn } from '@/lib/utils';
import { NavLink, useLocation, useParams } from 'react-router-dom';

export function TabsNav() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Check if we're in a project context
  const isProjectContext = location.pathname.includes('/projects/') && id;

  // Project-specific tabs
  const projectTabs = [
    { name: 'Overview', path: `/projects/${id}/dashboard` },
    { name: 'Analyze', path: `/projects/${id}/analyze` },
    { name: 'Results', path: `/projects/${id}/results` },
    { name: 'Rules', path: `/projects/${id}/rules` },
    { name: 'Settings', path: `/projects/${id}/settings` },
  ];

  // Global tabs (outside project context)
  const globalTabs = [
    { name: 'Projects', path: '/projects' },
    { name: 'Results', path: '/results' },
    { name: 'Settings', path: '/settings' },
  ];

  const tabs = isProjectContext ? projectTabs : globalTabs;

  return (
    <nav className="h-[48px] bg-black border-b border-zinc-800 flex items-center px-6">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'text-sm py-3 border-b-2 transition-colors',
                isActive
                  ? 'text-white border-white'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              )
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
