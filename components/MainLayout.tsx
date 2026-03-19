'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Don't show sidebar on login/signup pages
  const hideSidebar = pathname === '/login' || pathname === '/signup' || pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {!hideSidebar && <Sidebar />}
        <main className={`flex-1 ${hideSidebar ? 'ml-0' : 'ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
