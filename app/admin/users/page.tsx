'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Building2,
  Activity,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Edit,
  XCircle,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlatformUsers } from '@/store/actions/adminActions';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const contentRef = useRef<HTMLDivElement>(null);

  const { orgUsers, usersLoading } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'employees' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  useEffect(() => {
    dispatch(fetchPlatformUsers({ type: 'all', search: searchTerm }));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    const type = activeTab === 'admins' ? 'admins' : activeTab === 'employees' ? 'employees' : 'all';
    dispatch(fetchPlatformUsers({ type, search: searchTerm }));
  }, [dispatch, activeTab, searchTerm]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.user-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, viewMode]);

  // Flatten all users for easier filtering
  const allUsers = orgUsers.flatMap(org => org.users.map(user => ({
    ...user,
    tenantName: org.company.tenantName,
    tenantId: org.company.id,
    companyStatus: org.company.status,
  })));

  // Stats calculations
  const totalUsers = allUsers.length;
  const companyAdmins = allUsers.filter(u => u.roles.some(r => r.name === 'COMPANY_ADMIN')).length;
  const uniqueCompanies = orgUsers.length;
  const activeUsers = allUsers.filter(u => u.isActive).length;

  const getRoleLabel = (roles: { name: string }[]) => {
    if (roles.some(r => r.name === 'COMPANY_ADMIN')) return 'Company Admin';
    if (roles.some(r => r.name === 'EMPLOYEE')) return 'Employee';
    return 'User';
  };

  const getRoleColor = (roles: { name: string }[]) => {
    if (roles.some(r => r.name === 'COMPANY_ADMIN')) return 'bg-blue-100 text-blue-700';
    if (roles.some(r => r.name === 'EMPLOYEE')) return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = allUsers.filter(user => {
    const roleLabel = getRoleLabel(user.roles);
    if (activeTab === 'admins' && roleLabel !== 'Company Admin') return false;
    if (activeTab === 'employees' && roleLabel !== 'Employee') return false;
    if (activeTab === 'suspended' && user.isActive) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.phone || '').toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 user-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users across companies</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 user-item">
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

        {/* Search */}
        <div className="mb-6 user-item">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#0445AD] text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-[#0445AD] text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                Grouped by Company
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 user-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              All Users ({totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'admins'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Company Admins ({companyAdmins})
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'employees'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Employees ({totalUsers - companyAdmins})
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'suspended'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Suspended ({totalUsers - activeUsers})
            </button>
          </div>
        </div>

        {/* Users Content */}
        <div className="user-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : viewMode === 'table' ? (
              // Table View
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        <div className="flex items-center gap-2">
                          User
                          <ChevronDown className="w-4 h-4 cursor-pointer" />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${
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
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.roles)}`}>
                            {getRoleLabel(user.roles)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{user.tenantName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{user.department?.name || '—'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{user.phone || '—'}</span>
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
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Tooltip content="View Details">
                              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit User">
                              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Suspend">
                              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grouped by Company View
              <div className="space-y-6">
                {orgUsers.map((org) => {
                  const filteredCompanyUsers = org.users.filter(user => {
                    const roleLabel = getRoleLabel(user.roles);
                    if (activeTab === 'admins' && roleLabel !== 'Company Admin') return false;
                    if (activeTab === 'employees' && roleLabel !== 'Employee') return false;
                    if (activeTab === 'suspended' && user.isActive) return false;
                    if (searchTerm) {
                      const search = searchTerm.toLowerCase();
                      return (
                        user.name.toLowerCase().includes(search) ||
                        user.email.toLowerCase().includes(search) ||
                        (user.phone || '').toLowerCase().includes(search)
                      );
                    }
                    return true;
                  });

                  if (filteredCompanyUsers.length === 0) return null;

                  return (
                    <div key={org.company.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {(org.company.tenantName || 'CO').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{org.company.tenantName || 'Unknown Company'}</p>
                            <p className="text-xs text-gray-500">
                              {org.company.totalUsers} users • {org.company.status}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {filteredCompanyUsers.map((user) => (
                          <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
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
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.roles)}`}>
                                {getRoleLabel(user.roles)}
                              </span>
                              <span className="text-xs text-gray-500">{user.department?.name || '—'}</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  user.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                              <div className="flex gap-1">
                                <Tooltip content="View">
                                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Edit">
                                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
