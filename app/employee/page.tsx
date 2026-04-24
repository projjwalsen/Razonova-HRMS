'use client';

import { useEffect, useState } from 'react';
import { Clock, CalendarCheck, HandCoins, FileText } from 'lucide-react';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {user.name || 'Employee'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Your employee dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Leave', icon: CalendarCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Payroll', icon: HandCoins, color: 'text-purple-600 bg-purple-50' },
          { label: 'Documents', icon: FileText, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
