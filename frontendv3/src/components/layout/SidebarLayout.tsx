import { Outlet } from "react-router-dom";
import { AppNavbar } from "./AppNavbar";
import { Tab, TabsNav } from "./TabsNav";

interface SidebarLayoutProps {
  tabs: Tab[];
  showProjectSelector?: boolean;
  sidebarContent?: React.ReactNode;
}

export function SidebarLayout({
  tabs,
  showProjectSelector,
  sidebarContent,
}: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar showProjectSelector={showProjectSelector} />
      <TabsNav tabs={tabs} />

      <div className="flex flex-1">
        {/* Left Sidebar - Sticky below navbar */}
        <aside className="w-64 border-r border-border bg-background sticky top-[104px] self-start h-[calc(100vh-104px)] overflow-y-auto">
          <div className="p-6">
            {sidebarContent || (
              <div className="text-center text-muted-foreground text-sm">
                <p className="font-medium mb-2">Coming Soon</p>
                <p className="text-xs">
                  Page-specific content will appear here
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content - No padding, pages handle their own spacing */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
