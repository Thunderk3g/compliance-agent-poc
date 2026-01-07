import { useLocation, useParams } from "react-router-dom";
import { SidebarLayout } from "./SidebarLayout";
import { Tab } from "./TabsNav";

export function AppLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Check if we're in a project context
  const isProjectContext = !!(location.pathname.includes("/projects/") && id);

  // Project-specific tabs
  const projectTabs: Tab[] = [
    { name: "Overview", path: `/projects/${id}/dashboard` },
    { name: "Analyze", path: `/projects/${id}/analyze` },
    { name: "Results", path: `/projects/${id}/results` },
    { name: "Rules", path: `/projects/${id}/rules` },
    { name: "Settings", path: `/projects/${id}/settings` },
  ];

  // Global tabs (outside project context)
  const globalTabs: Tab[] = [
    { name: "Projects", path: "/projects" },
    { name: "Results", path: "/results" },
    { name: "Settings", path: "/settings" },
  ];

  const tabs = isProjectContext ? projectTabs : globalTabs;

  return <SidebarLayout tabs={tabs} showProjectSelector={isProjectContext} />;
}
