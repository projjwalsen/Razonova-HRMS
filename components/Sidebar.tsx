'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  Users,
  HandCoins,
  Briefcase,
  TrendingUp,
  GraduationCap,
  BarChart3,
  Settings,
  Building,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const COMPANY_NAV: NavItem[] = [
  { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/company/employees', label: 'Employees', icon: Users },
  { href: '/company/departments', label: 'Departments', icon: Building },
  { href: '/company/payroll', label: 'Payroll', icon: HandCoins },
  { href: '/company/recruitment', label: 'Recruitment', icon: Briefcase },
  { href: '/company/performance', label: 'Performance', icon: TrendingUp },
  { href: '/company/training', label: 'Training', icon: GraduationCap },
  { href: '/organization', label: 'Settings', icon: Settings },
  { href: '/company/attendance', label: 'Attendance', icon: Clock },
  { href: '/company/leave', label: 'Leave', icon: CalendarCheck },
  { href: '/company/reports', label: 'Reports', icon: BarChart3 },
];

const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/companies', label: 'Companies', icon: Building },
  { href: '/admin/users', label: 'All Users', icon: Users },
  // { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  // { href: '/admin/settings', label: 'System Settings', icon: Shield },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: TrendingUp },
];

const PUBLIC_PATHS = ['/login', '/signup', '/about', '/services', '/contact', '/blog', '/team', '/case-studies', '/industries'];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; roles?: string[] }>({});

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}
  }, []);

  const isSuperAdmin = pathname?.startsWith('/admin');
  const navItems = isSuperAdmin ? SUPER_ADMIN_NAV : COMPANY_NAV;

  const isPublicPage = pathname === '/' || PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
  if (isPublicPage) return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  const handleToggle = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(!collapsed));
    }
    onToggle?.(!collapsed);
  };

  return (
    <aside
      className={`bg-white text-black min-h-[calc(100vh)] fixed left-0 top-15 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-18' : 'w-64'}`}
    >
     

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-5 mt-7 ">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-4 rounded-xs  mb-0.5 transition-all duration-200 group relative ${
                active
                  ? 'bg-[#0445AD] text-white'
                  : 'text-black/70 hover:bg-white/10 hover:text-black'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-black/70 group-hover:text-black'}`} />
              {!collapsed && (
                <span className={`text-sm uppercase font-medium whitespace-nowrap ${active ? 'text-white' : 'text-black/80 group-hover:text-black'}`}>
                  {item.label}
                </span>
              )}
              {active && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
              )}
              {collapsed && (
                <div className="absolute uppercase left-full ml-2 px-2 py-1 bg-gray-900 text-black text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Info + Toggle */}
      <div className="border-t border-white/10">
        {!collapsed ? (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">
                  {currentUser.name || 'User'}
                </p>
                <p className="text-xs text-black/60 truncate">
                  {currentUser.email || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-black transition">
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notifications</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-xs font-medium text-red-200 transition"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <button
              onClick={handleLogout}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-red-200" />
            </button>
          </div>
        )}

        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-black/60 hover:text-black hover:bg-white/5 transition border-t border-white/10 text-xs"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
