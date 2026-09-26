import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, Map, Database, Lightbulb, ShoppingCart, 
  RefreshCw, Truck, BarChart3, Factory, FileText, Bot, Settings, LogOut, Crosshair
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Industrial Map', path: '/dashboard/map', icon: Map },
  { name: 'Resources', path: '/dashboard/resources', icon: Database },
  { name: 'Opportunities', path: '/dashboard/opportunities', icon: Lightbulb },
  { name: 'Marketplace', path: '/dashboard/marketplace', icon: ShoppingCart },
  { name: 'Exchanges', path: '/dashboard/exchanges', icon: RefreshCw },
  { name: 'Logistics', path: '/dashboard/logistics', icon: Truck },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Industrial Dashboard', path: '/dashboard/industrial', icon: Factory },
  { name: 'Material Passport', path: '/dashboard/material-passport', icon: FileText },
  { name: 'AI Advisor', path: '/dashboard/ai-advisor', icon: Bot },
  { name: 'W2R Knowledge Graph', path: '/dashboard/graph-discovery', icon: Database },
  { name: 'Loop Hunter', path: '/dashboard/loop-hunter', icon: Crosshair },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-brand-dark text-brand-light font-sans">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
            SYMBIO
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center px-8">
          <h2 className="text-xl font-semibold">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
