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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/company', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/company/employees', label: 'Employees', icon: Users },
  { href: '/company/departments', label: 'Departments', icon: Building },
  { href: '/company/attendance', label: 'Attendance', icon: Clock },
  { href: '/company/leave', label: 'Leave', icon: CalendarCheck },
  { href: '/company/payroll', label: 'Payroll', icon: HandCoins },
  { href: '/company/recruitment', label: 'Recruitment', icon: Briefcase },
  { href: '/company/performance', label: 'Performance', icon: TrendingUp },
  { href: '/company/training', label: 'Training', icon: GraduationCap },
  { href: '/company/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface CompanySidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export default function CompanySidebar({ collapsed = false, onToggle }: CompanySidebarProps) {
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

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside
      className={`bg-[#0445AD] text-white min-h-[calc(100vh)] fixed left-0 top-15 z-50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 mt-20">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-200 group relative ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
              {!collapsed && (
                <span className={`text-sm font-medium whitespace-nowrap ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
              {/* Active indicator */}
              {active && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Toggle */}
      <div className="border-t border-white/10">
        {/* User Info */}
        {!collapsed ? (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser.name || 'User'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {currentUser.email || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition">
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

        {/* Collapse Toggle */}
        <button
          onClick={() => onToggle?.(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 transition border-t border-white/10 text-xs"
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
