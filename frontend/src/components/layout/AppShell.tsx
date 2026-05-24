import React, { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Flame, LayoutDashboard, Target, DollarSign, Users,
  BarChart2, Settings, LogOut, Bell, Search, Menu,
  ChevronRight, X, Layers, Globe, Heart, Flag, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Avatar } from '../../components/ui';
import toast from 'react-hot-toast';

// ── Nav config ────────────────────────────────
interface NavItem { to: string; label: string; icon: React.ElementType; roles?: string[] }

const adminNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/campaigns', label: 'Campaigns', icon: Target },
  { to: '/dashboard/donations', label: 'Donations', icon: DollarSign },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/reports', label: 'Reports', icon: Flag },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const creatorNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/campaigns', label: 'My Campaigns', icon: Target },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const donorNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/donations', label: 'My Donations', icon: Heart },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// ── Sidebar ───────────────────────────────────
function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = user?.roles.includes('ADMIN')
    ? adminNav
    : user?.roles.includes('CREATOR')
      ? creatorNav
      : donorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1117]">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/40">
          <Flame size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-[15px] tracking-tight">FundForge</span>
            <div className="text-[10px] -mt-0.5 uppercase tracking-widest">Platform</div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto hover:text-white lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role pill */}
      {!collapsed && user && (
        <div className="px-4 pt-4 pb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            <Layers size={9} />
            {user.roles.includes('ADMIN') ? 'Admin' : user.roles.includes('CREATOR') ? 'Creator' : 'Donor'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => [
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5',
            ].join(' ')}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Explore campaigns link */}
        <div className={`pt-3 ${collapsed ? '' : 'px-1'}`}>
          {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5">Explore</p>}
          <Link
            to="/campaigns"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Globe size={16} className="flex-shrink-0" />
            {!collapsed && 'Browse Campaigns'}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className={`px-3 py-4 border-t border-white/5 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} size="sm" />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors" title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[220px]'} relative`}>
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md transition-colors z-10"
        >
          <ChevronRight size={11} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[220px] h-full">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm pl-9 pr-4 py-2 w-52"
                placeholder="Search campaigns…"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            
            <button className="relative p-2.5 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <Link to="/dashboard/settings">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} size="sm" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Public layout (campaigns browse, landing) ─
export function PublicLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Flame size={15} className="text-white" />
            </div>
            <span className="font-bold text-[15px]">FundForge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/campaigns" className="text-sm hover:text-slate-900 transition-colors font-medium">Explore</Link>
            <Link to="/how-it-works" className="text-sm hover:text-slate-900 transition-colors font-medium">How it works</Link>
          </nav>
          <div className="flex items-center gap-3">
            
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-slate-900 font-medium transition-colors">Sign in</Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-5 text-center text-sm">
          © {new Date().getFullYear()} FundForge. Built with ❤️ for changemakers.
        </div>
      </footer>
    </div>
  );
}

// ── Protected route ───────────────────────────
export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (roles && !roles.some(r => user?.roles.includes(r))) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, roles]);

  if (!isAuthenticated) return null;
  return <Outlet />;
}

// ── Theme Toggle ──────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      className="p-2.5 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
