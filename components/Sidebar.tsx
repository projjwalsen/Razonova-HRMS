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
  const isSuperAdmin = pathname?.startsWith('/super-admin');

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/departments', label: 'Departments', icon: Building },
    { href: '/admin/payroll', label: 'Payroll', icon: DollarSign },
    { href: '/admin/recruitment', label: 'Recruitment', icon: Briefcase },
    { href: '/admin/performance', label: 'Performance', icon: TrendingUp },
    { href: '/admin/training', label: 'Training', icon: GraduationCap },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/attendance', label: 'Attendance', icon: Clock },
    { href: '/leave', label: 'Leave', icon: CalendarCheck },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const superAdminNavItems = [
    { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin/companies', label: 'Companies', icon: Building },
    { href: '/super-admin/users', label: 'All Users', icon: Users },
    { href: '/super-admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/super-admin/settings', label: 'System Settings', icon: Shield },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

  // Don't show sidebar on login, signup, and public pages
  const hideSidebarOn = ['/login', '/signup', '/about', '/services', '/contact', '/blog', '/team', '/case-studies', '/industries'];
  // Check exact match for '/' or if path starts with any public path
  if (pathname === '/' || hideSidebarOn.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <aside className="w-64 bg-black text-white min-h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link href={isSuperAdmin ? "/super-admin" : "/admin"} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xl font-['Montserrat']">H</span>
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
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
