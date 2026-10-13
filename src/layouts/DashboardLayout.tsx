import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { 
  LayoutDashboard, MapPin, Database, Lightbulb, ShoppingCart, 
  RefreshCw, Truck, BarChart3, Factory, FileText, Bot, Settings, 
  LogOut, Crosshair, Radar, Activity, ShieldCheck, MessageSquare, 
  Search, Bell, ChevronRight, Menu, X, Plus, Building2, Sun, Moon, 
  ExternalLink, Layers, CheckCircle2, ChevronDown
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeBlue?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Core Platform',
    items: [
      { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Sustainability Intelligence', path: '/dashboard/analytics', icon: BarChart3, badge: 'ISO 14044', badgeBlue: true },
    ],
  },
  {
    title: 'Material Flows & Marketplace',
    items: [
      { name: 'Resource Marketplace', path: '/dashboard/marketplace', icon: ShoppingCart },
      { name: 'Material Inventory', path: '/dashboard/resources', icon: Database },
      { name: 'Industrial GIS Network', path: '/dashboard/map', icon: MapPin, badge: 'GIS' },
      { name: 'Closed-Loop Discovery', path: '/dashboard/loop-hunter', icon: Crosshair },
      { name: 'Knowledge Graph', path: '/dashboard/graph-discovery', icon: Layers },
      { name: 'AI Material Matching', path: '/dashboard/opportunities', icon: Lightbulb, badge: 'AI', badgeBlue: true },
    ],
  },
  {
    title: 'Logistics & Dispatch',
    items: [
      { name: 'Consignment Exchanges', path: '/dashboard/exchanges', icon: RefreshCw },
      { name: 'Fleet Telematics Radar', path: '/dashboard/live-logistics', icon: Activity },
      { name: 'Driver Terminal', path: '/dashboard/logistics', icon: Truck },
      { name: 'Twilio SMS & Comms', path: '/dashboard/twilio', icon: MessageSquare },
    ],
  },
  {
    title: 'Governance & Auditing',
    items: [
      { name: 'Digital Material Passports', path: '/dashboard/material-passport', icon: FileText, badge: 'CPCB', badgeBlue: true },
      { name: 'Stagnation & Risk Monitor', path: '/dashboard/stagnation', icon: Radar },
      { name: 'AI Engineering Advisor', path: '/dashboard/ai-advisor', icon: Bot },
      { name: 'Industrial Facilities Master', path: '/dashboard/industrial', icon: Factory },
      { name: 'Data Ingestion Admin', path: '/dashboard/admin-data', icon: ShieldCheck },
      { name: 'Settings & Telematics', path: '/dashboard/settings', icon: Settings },
    ],
  },
];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Logout:', e);
    }
    navigate('/');
  };

  const currentNav = navGroups.flatMap(g => g.items).find(i => i.path === location.pathname);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-[#09090B] dark:text-[#FFFFFF] font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#121215] border-r border-[#E4E4E7] dark:border-[#27272A] flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-[#09090B] dark:text-white">
                  SYMBIO
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#EFF6FF] dark:bg-[#1E3A8A]/50 text-[#2563EB] dark:text-[#60A5FA] rounded border border-[#DBEAFE] dark:border-[#1E40AF]">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-medium leading-none">Resource Intelligence</p>
            </div>
          </Link>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-[#71717A] hover:text-[#09090B] dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Facility Selector */}
        <div className="p-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 font-bold text-xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#09090B] dark:text-white truncate">Apex Metallurgy</p>
                <p className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  Node Connected
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <h3 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] dark:text-[#71717A] mb-1">
                {group.title}
              </h3>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE]/60 dark:border-[#1E40AF]/60'
                            : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#2563EB] dark:text-[#60A5FA]' : 'text-[#71717A] group-hover:text-[#09090B] dark:group-hover:text-white'
                          }`} />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            item.badgeBlue 
                              ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#93C5FD]' 
                              : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA]'
                          }`}>
                            {item.badge}
                          </span>
                        )}

                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2563EB] rounded-r"></span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#09090B] dark:bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {(currentUser?.email || 'User')[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#09090B] dark:text-white truncate">
                  {currentUser?.email?.split('@')[0] || 'Operations Lead'}
                </p>
                <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] truncate">
                  {currentUser?.email || 'esg@symbio.eco'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#71717A] hover:text-[#DC2626] hover:bg-white dark:hover:bg-[#18181B] rounded-md transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#71717A] hover:text-[#09090B] rounded-md bg-[#F4F4F5] dark:bg-[#27272A]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                <span>Platform</span>
                <span>/</span>
                <span className="text-[#09090B] dark:text-white font-bold">{currentNav?.name || 'Dashboard'}</span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Telematics Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#1D4ED8] dark:text-[#93C5FD] border border-[#DBEAFE] dark:border-[#1E40AF] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span>Telematics Live</span>
              <span className="text-[10px] opacity-70">· 100% SLA</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-[#71717A] hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white rounded-lg border border-[#E4E4E7] dark:border-[#27272A] hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] transition-colors"
              title={currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <Link
              to="/dashboard/twilio"
              title="SMS Comms & Alerts"
              className="p-1.5 text-[#71717A] hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white rounded-lg border border-[#E4E4E7] dark:border-[#27272A] hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            </Link>

            {/* Primary Action Button (Blue / Black) */}
            <Link
              to="/dashboard/marketplace"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Resource</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#09090B]">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
