'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  DollarSign,
  FileText,
  LayoutDashboard,
  X,
  LogOut,
  Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarUser {
  name?: string;
  email?: string;
  roles?: string[];
}

const navItems = [
  { href: '/employee', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/employee/leave', label: 'My Leave', icon: CalendarCheck },
  { href: '/employee/attendance', label: 'My Attendance', icon: Clock },
  { href: '/employee/payroll', label: 'Payroll', icon: DollarSign },
  { href: '#', label: 'Documents', icon: FileText, disabled: true },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SidebarUser>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (href === '#') return false;
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:text-gray-900"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:!translate-x-0
      `}>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-base font-bold text-gray-900">HRMS</h1>
            <p className="text-xs text-gray-400">Employee Portal</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Employee'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</p>
          {navItems.map(({ href, label, icon: Icon, exact, disabled }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={label}
                href={disabled ? '#' : href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-[#0445AD] text-white shadow-sm'
                    : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClickCapture={disabled ? (e) => e.preventDefault() : undefined}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : ''}`} />
                {label}
                {disabled && <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
