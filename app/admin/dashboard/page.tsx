'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Users,
  Activity,
  HandCoins,
  AlertCircle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardKPIs,
  fetchOrganizations,
  fetchPendingOrganizations,
  fetchPlatformUsers,
  approveOrganization,
  rejectOrganization,
} from '@/store/actions/adminActions';
import { logout } from '@/store/slices/authSlice';

export default function SuperAdminDashboard() {
  const dispatch = useAppDispatch();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { dashboardKPIs, organizations, pendingOrganizations, orgUsers, usersLoading, orgLoading, pendingLoading, actionLoading } =
    useAppSelector((state) => state.admin);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'analytics'>('overview');

  useEffect(() => {
    // Fetch all required data on mount
    dispatch(fetchDashboardKPIs());
    dispatch(fetchOrganizations());
    dispatch(fetchPendingOrganizations());
    dispatch(fetchPlatformUsers({ type: 'all' }));

    // CSS animations - no blur
    const items = dashboardRef.current?.querySelectorAll('.dashboard-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [dispatch]);

  const handleApprove = async (tenantId: string) => {
    await dispatch(approveOrganization(tenantId));
    dispatch(fetchDashboardKPIs());
    dispatch(fetchPendingOrganizations());
  };

  const handleReject = async (tenantId: string) => {
    await dispatch(rejectOrganization(tenantId));
    dispatch(fetchDashboardKPIs());
    dispatch(fetchPendingOrganizations());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const stats = [
    {
      title: 'Total Companies',
      value: dashboardKPIs?.totalCompanies?.toString() || '—',
      change: 'All time',
      trend: 'neutral',
      icon: Building2,
    },
    {
      title: 'Total Users',
      value: dashboardKPIs?.totalUsers?.toString() || '—',
      change: 'All registered',
      trend: 'neutral',
      icon: Users,
    },
    {
      title: 'Active Users',
      value: dashboardKPIs?.activeUsers?.toString() || '—',
      change: 'Currently active',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'System Revenue',
      value: '$284,700',
      change: '+15.3%',
      trend: 'up',
      icon: HandCoins,
    },
    {
      title: 'Pending Approvals',
      value: dashboardKPIs?.pendingCompanies?.toString() || '—',
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

  return (
    <div className="w-full p-8">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
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
                  <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
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
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'companies'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'users'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
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
                  <button className="text-sm text-[#0445AD] hover:underline">View All</button>
                </div>
                {orgLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizations.slice(0, 3).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {(company.companyName || company.tenantName || 'CO').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{company.companyName || company.tenantName || 'Unnamed'}</p>
                            <p className="text-xs text-gray-500">{company.companyAdmin?.name || company.companyAdmin?.email || 'No admin'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{company.usersCount || 0} users</p>
                          <p className="text-xs text-gray-500">{company.status || 'Basic'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="dashboard-item">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Pending Approvals
                  </h3>
                  <button className="text-sm text-[#0445AD] hover:underline">View All</button>
                </div>
                {pendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                  </div>
                ) : pendingOrganizations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending approvals
                  </div>
                ) : (
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
                        {pendingOrganizations.map((approval) => (
                          <tr key={approval.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium">{approval.companyName || approval.tenantName || 'Unnamed'}</td>
                            <td className="py-3 px-4">{approval.companySize || 'Registration'}</td>
                            <td className="py-3 px-4">{approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : '—'}</td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                {approval.status || 'PENDING'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(approval.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(approval.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ─── COMMENTED OUT: Company Subscriptions Widget ─────────────────── */}
            {/*
            <div className="dashboard-item">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Subscriptions
                  </h3>
                  <Link
                    href="/admin/subscription-setup"
                    className="text-sm text-[#0445AD] hover:underline flex items-center gap-1"
                  >
                    Configure Plans
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {companySubscriptionData.map((company) => {
                    const employeePercentage = (company.employees.used / company.employees.limit) * 100;
                    const storagePercentage = (company.storage.used / company.storage.limit) * 100;

                    return (
                      <div
                        key={company.id}
                        className="p-4 bg-gray-50 rounded-lg border-2 border-gray-100 hover:border-black transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {company.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm">{company.company}</p>
                                {company.status === 'over-limit' && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">Over Limit</span>
                                )}
                                {company.status === 'trial' && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Trial</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{company.plan} • Renews {company.renewalDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{company.revenue}/mo</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Employees</span>
                              <span className={`text-xs font-bold ${employeePercentage > 100 ? 'text-red-600' : ''}`}>
                                {company.employees.used} / {company.employees.limit}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  employeePercentage > 100 ? 'bg-red-500' : 'bg-[#0445AD]'
                                }`}
                                style={{ width: `${Math.min(employeePercentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Storage</span>
                              <span className="text-xs font-bold">
                                {company.storage.used} / {company.storage.limit} {company.storage.unit}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${storagePercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-center">
                  <Link href="/admin/companies" className="text-sm text-gray-600 hover:text-[#0445AD] hover:underline">
                    View All Companies →
                  </Link>
                </div>
              </div>
            </div>
            */}

            {/* ─── COMMENTED OUT: System Logs ───────────────────────────────── */}
            {/*
            <div className="dashboard-item">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Logs
                  </h3>
                  <button className="text-sm text-[#0445AD] hover:underline">View All</button>
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
            */}
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {orgLoading ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : organizations.length === 0 ? (
              <div className="col-span-2 p-6 bg-white rounded-xl border-2 border-gray-100 text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No companies found</p>
              </div>
            ) : (
              organizations.map((company) => (
                <div key={company.id} className="dashboard-item p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {(company.companyName || company.tenantName || 'CO').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{company.companyName || company.tenantName || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{company.city || 'N/A'}, {company.state || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      company.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      company.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      company.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {company.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold">{company.usersCount || 0}</p>
                      <p className="text-xs text-gray-500">Users</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold">{company.departmentsCount || 0}</p>
                      <p className="text-xs text-gray-500">Departments</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold">{company.companySize || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Size</p>
                    </div>
                  </div>
                  {company.companyAdmin && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 mb-1">Company Admin</p>
                      <p className="text-sm font-semibold">{company.companyAdmin.name}</p>
                      <p className="text-xs text-gray-500">{company.companyAdmin.email}</p>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-gray-400">
                    Joined: {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : orgUsers.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100 text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                {/* Flatten users for stats */}
                {(() => {
                  const allUsers = orgUsers.flatMap(org => org.users.map(user => ({
                    ...user,
                    tenantName: org.company.tenantName,
                    tenantId: org.company.id,
                  })));
                  const totalUsers = allUsers.length;
                  const companyAdmins = allUsers.filter(u => u.roles.some(r => r.name === 'COMPANY_ADMIN')).length;
                  const uniqueCompanies = orgUsers.length;
                  const activeUsers = allUsers.filter(u => u.isActive).length;

                  return (
                    <>
                      {/* Users Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <Users className="w-12 h-12 text-[#0445AD]" />
                          </div>
                          <div className="text-3xl font-bold font-['Montserrat']">{totalUsers}</div>
                          <div className="text-sm text-gray-600">Total Users</div>
                        </div>
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <Shield className="w-12 h-12 text-purple-600" />
                          </div>
                          <div className="text-3xl font-bold font-['Montserrat']">{companyAdmins}</div>
                          <div className="text-sm text-gray-600">Company Admins</div>
                        </div>
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <Building2 className="w-12 h-12 text-blue-600" />
                          </div>
                          <div className="text-3xl font-bold font-['Montserrat']">{uniqueCompanies}</div>
                          <div className="text-sm text-gray-600">Companies</div>
                        </div>
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <Activity className="w-12 h-12 text-green-600" />
                          </div>
                          <div className="text-3xl font-bold font-['Montserrat']">{activeUsers}</div>
                          <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                      </div>

                      {/* Users Table */}
                      <div className="dashboard-item p-6 bg-white rounded-xl border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold font-['Montserrat']">All Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-sm">User</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allUsers.slice(0, 10).map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                        user.roles.some(r => r.name === 'COMPANY_ADMIN') ? 'bg-blue-600' : 'bg-gray-600'
                                      }`}>
                                        {(user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-semibold">{user.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{user.email || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      user.roles.some(r => r.name === 'COMPANY_ADMIN') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {user.roles.some(r => r.name === 'COMPANY_ADMIN') ? 'Company Admin' : 'Employee'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="font-medium">{user.tenantName || 'N/A'}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                                      }`} />
                                      <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-sm text-gray-500">
                                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {allUsers.length > 10 && (
                          <div className="mt-4 text-center">
                            <button className="text-sm text-[#0445AD] hover:underline">
                              View All Users ({allUsers.length}) →
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="dashboard-item p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Analytics coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
