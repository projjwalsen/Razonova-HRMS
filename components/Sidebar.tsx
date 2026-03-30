'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  GraduationCap,
  BarChart3,
  Settings,
  Building,
  Shield,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // Check if we're in super-admin
  const isSuperAdmin = pathname?.startsWith('/admin');

  const adminNavItems = [
    { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/company/employees', label: 'Employees', icon: Users },
    { href: '/company/departments', label: 'Departments', icon: Building },
    { href: '/company/payroll', label: 'Payroll', icon: DollarSign },
    { href: '/company/recruitment', label: 'Recruitment', icon: Briefcase },
    { href: '/company/performance', label: 'Performance', icon: TrendingUp },
    { href: '/company/training', label: 'Training', icon: GraduationCap },
    { href: '/organization', label: 'Settings', icon: Settings },
    { href: '/company/attendance', label: 'Attendance', icon: Clock },
    { href: '/company/leave', label: 'Leave', icon: CalendarCheck },
    { href: '/company/reports', label: 'Reports', icon: BarChart3 },
  ];

  const superAdminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/companies', label: 'Companies', icon: Building },
    { href: '/admin/users', label: 'All Users', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'System Settings', icon: Shield },
    { href:'/admin/subscriptions', label: 'Subscriptions', icon: TrendingUp }
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

  // Don't show sidebar on login, signup, and public pages
  const hideSidebarOn = ['/login', '/signup', '/about', '/services', '/contact', '/blog', '/team', '/case-studies', '/industries'];
  // Check exact match for '/' or if path starts with any public path
  if (pathname === '/' || hideSidebarOn.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <aside className="w-64 bg-white text-black min-h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link href={isSuperAdmin ? "/admin" : "/company"} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl font-['Montserrat']">H</span>
          </div>
          <span className="text-xl font-bold font-['Montserrat']">
            {isSuperAdmin ? 'Super Admin' : 'HRMS'}
          </span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0445AD] text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white': 'text-black'}`} />

                <span className={`${isActive
                    ? 'text-white': 'text-black'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
