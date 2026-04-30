'use client';

import EmployeeSidebar from './components/EmployeeSidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex min-h-screen bg-gray-50/50">
      <EmployeeSidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
