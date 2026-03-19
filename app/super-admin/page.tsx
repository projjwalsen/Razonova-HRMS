'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Users,
  Settings,
  Activity,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'analytics'>('overview');
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = dashboardRef.current?.querySelectorAll('.dashboard-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const stats = [
    {
      title: 'Total Companies',
      value: '156',
      change: '+12 this month',
      trend: 'up',
      icon: Building2,
    },
    {
      title: 'Total Users',
      value: '12,847',
      change: '+843 this month',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Sessions',
      value: '2,654',
      change: 'Currently online',
      trend: 'neutral',
      icon: Activity,
    },
    {
      title: 'System Revenue',
      value: '$284,700',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Pending Issues',
      value: '23',
      change: 'Action needed',
      trend: 'down',
      icon: AlertCircle,
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'All systems operational',
      trend: 'up',
      icon: CheckCircle,
    },
  ];

  const recentCompanies = [
    {
      id: 1,
      name: 'Acme Corporation',
      admin: 'John Smith',
      users: 245,
      plan: 'Enterprise',
      status: 'Active',
      joined: '2024-01-15',
      revenue: '$12,500',
    },
    {
      id: 2,
      name: 'TechStart Inc',
      admin: 'Sarah Johnson',
      users: 89,
      plan: 'Professional',
      status: 'Active',
      joined: '2024-02-20',
      revenue: '$5,400',
    },
    {
      id: 3,
      name: 'Global Solutions',
      admin: 'Mike Davis',
      users: 456,
      plan: 'Enterprise',
      status: 'Active',
      joined: '2023-11-10',
      revenue: '$15,000',
    },
    {
      id: 4,
      name: 'Startup Labs',
      admin: 'Emily Chen',
      users: 34,
      plan: 'Basic',
      status: 'Trial',
      joined: '2024-03-01',
      revenue: '$0',
    },
    {
      id: 5,
      name: 'Digital Dynamics',
      admin: 'Robert Wilson',
      users: 178,
      plan: 'Professional',
      status: 'Active',
      joined: '2023-12-05',
      revenue: '$8,900',
    },
  ];

  const systemLogs = [
    { id: 1, action: 'New company registered', company: 'Startup Labs', time: '2 minutes ago', type: 'info' },
    { id: 2, action: 'Payment received', company: 'Acme Corporation', time: '15 minutes ago', type: 'success' },
    { id: 3, action: 'Plan upgraded', company: 'TechStart Inc', time: '1 hour ago', type: 'success' },
    { id: 4, action: 'Storage limit warning', company: 'Global Solutions', time: '2 hours ago', type: 'warning' },
    { id: 5, action: 'Support ticket created', company: 'Digital Dynamics', time: '3 hours ago', type: 'info' },
    { id: 6, action: 'System backup completed', company: 'System', time: '5 hours ago', type: 'success' },
  ];

  const pendingApprovals = [
    { id: 1, company: 'Innovate Tech', type: 'Enterprise Plan', requested: '2024-03-18', status: 'pending' },
    { id: 2, company: 'DataFlow Systems', type: 'API Access', requested: '2024-03-17', status: 'pending' },
    { id: 3, company: 'CloudBase Inc', type: 'Custom Integration', requested: '2024-03-16', status: 'pending' },
  ];

  return (
    <div className="p-8">
      <div ref={dashboardRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 dashboard-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage all companies and system-wide settings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">System Operational</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 dashboard-item">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1 font-['Montserrat']">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6 dashboard-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'companies'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'users'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Companies */}
            <div className="dashboard-item">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Recent Companies
                  </h3>
                  <button className="text-sm text-black hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {recentCompanies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.admin}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{company.users} users</p>
                        <p className="text-xs text-gray-500">{company.plan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Logs */}
            <div className="dashboard-item">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Logs
                  </h3>
                  <button className="text-sm text-black hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.company} • {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="dashboard-item lg:col-span-2">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Pending Approvals
                  </h3>
                  <button className="text-sm text-black hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Request Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Requested</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((approval) => (
                        <tr key={approval.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{approval.company}</td>
                          <td className="py-3 px-4">{approval.type}</td>
                          <td className="py-3 px-4">{approval.requested}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              {approval.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600">
                                Approve
                              </button>
                              <button className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
