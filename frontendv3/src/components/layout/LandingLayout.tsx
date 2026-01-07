import { Outlet } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
