'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/login' || pathname === '/signup' || pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {!hideSidebar && <Sidebar />}
        <main className={`flex-1 transition-all duration-300 ${hideSidebar ? '' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
