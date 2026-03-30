'use client';

import { ReactNode } from 'react';
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
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/company', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/company/attendance', label: 'Attendance', icon: Clock },
    { href: '/company/leave', label: 'Leave', icon: CalendarCheck },
    { href: '/employees', label: 'Employees', icon: Users },
    { href: '/payroll', label: 'Payroll', icon: DollarSign },
    { href: '/recruitment', label: 'Recruitment', icon: Briefcase },
    { href: '/performance', label: 'Performance', icon: TrendingUp },
    { href: '/training', label: 'Training', icon: GraduationCap },
    { href: '/company/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0445AD] text-white min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <Link href="/company" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#0445AD] font-bold text-xl font-['Montserrat']">H</span>
              </div>
              <span className="text-xl font-bold font-['Montserrat']">HRMS</span>
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
