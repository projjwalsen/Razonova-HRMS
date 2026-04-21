'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppDispatch } from '@/store/hooks';
import { fetchMyAccess } from '@/store/actions/authActions';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Load persisted sidebar state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsed');
      if (stored !== null) setCollapsed(stored === 'true');
    } catch {}
  }, []);

  // Fetch RBAC access token on app load
  useEffect(() => {
    dispatch(fetchMyAccess());
  }, [dispatch]);

  const hideSidebar = pathname === '/login' || pathname === '/signup' || pathname === '/admin/login';

  const sidebarWidth = collapsed ? 'ml-18' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - always visible on authed pages */}
      {!hideSidebar && <Header />}

      <div className="flex">
        {!hideSidebar && (
          <Sidebar
            collapsed={collapsed}
            onToggle={(c) => {
              setCollapsed(c);
              if (typeof window !== 'undefined') {
                localStorage.setItem('sidebarCollapsed', String(c));
              }
            }}
          />
        )}
        <main
          className={`flex-1 transition-all duration-300 ${
            hideSidebar ? '' : sidebarWidth
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
