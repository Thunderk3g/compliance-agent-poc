import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface Tab {
  name: string;
  path: string;
}

interface TabsNavProps {
  tabs: Tab[];
}

export function TabsNav({ tabs }: TabsNavProps) {
  return (
    <nav className="h-12 border-b border-border bg-background">
      <div className="px-6 h-full flex items-center gap-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'text-sm py-3 border-b-2 transition-colors',
                isActive
                  ? 'text-foreground border-foreground font-medium'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
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
