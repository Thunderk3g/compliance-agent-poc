import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { TabsNav } from './TabsNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TabsNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
