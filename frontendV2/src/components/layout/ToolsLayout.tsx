
import { LucideFileText, LucideLayoutDashboard, LucideLogOut, LucideMenu, LucideSettings, LucideUpload, LucideX } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function ToolsLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LucideLayoutDashboard, label: 'Overview', path: '/tools' },
    { icon: LucideUpload, label: 'Upload', path: '/tools/upload' },
    { icon: LucideFileText, label: 'Submissions', path: '/tools/submissions' },
    { icon: LucideSettings, label: 'Settings', path: '/tools/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/tools' && location.pathname === '/tools') return true;
    if (path !== '/tools' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-surface-200 dark:border-white/5 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">V</div>
          <span className="font-bold text-xl tracking-tight hidden md:block">Vantage</span>
        </div>

        {/* Center Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-surface-100/50 dark:bg-white/5 border border-surface-200 dark:border-white/5">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

            <button 
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            >
                <LucideLogOut className="w-4 h-4" />
                Exit
            </button>
            
            {/* Mobile Menu Toggle */}
             <button 
                className="md:hidden p-2 text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <LucideX /> : <LucideMenu />}
            </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-20 px-4 animate-fade-in-up">
             <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-surface-100 dark:hover:bg-slate-900 hover:text-foreground'
              }`}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </button>
          ))}
             <button 
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            >
                <LucideLogOut className="w-6 h-6" />
                Exit Tools
            </button>
        </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
