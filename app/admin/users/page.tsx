'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  Calendar,
  Activity,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'employees' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.user-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const [allUsers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@acme.com',
      role: 'Company Admin',
      company: 'Acme Corporation',
      status: 'Active',
      lastLogin: '2 hours ago',
      joinedDate: '2024-01-15',
      sessions: 45,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      role: 'Company Admin',
      company: 'TechStart Inc',
      status: 'Active',
      lastLogin: '1 day ago',
      joinedDate: '2024-02-20',
      sessions: 32,
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@global.com',
      role: 'Company Admin',
      company: 'Global Solutions',
      status: 'Active',
      lastLogin: '5 hours ago',
      joinedDate: '2023-11-10',
      sessions: 128,
    },
    {
      id: 4,
      name: 'Emily Chen',
      email: 'emily@startuplabs.com',
      role: 'Company Admin',
      company: 'Startup Labs',
      status: 'Active',
      lastLogin: '30 minutes ago',
      joinedDate: '2024-03-01',
      sessions: 12,
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'robert@digital.com',
      role: 'Employee',
      company: 'Digital Dynamics',
      status: 'Active',
      lastLogin: '3 hours ago',
      joinedDate: '2023-12-05',
      sessions: 67,
    },
    {
      id: 6,
      name: 'Super Admin',
      email: 'admin@hrms.com',
      role: 'Super Admin',
      company: 'System',
      status: 'Active',
      lastLogin: 'Online',
      joinedDate: '2023-01-01',
      sessions: 1245,
    },
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-700';
      case 'Company Admin':
        return 'bg-blue-100 text-blue-700';
      case 'Employee':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 user-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users across companies</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-black transition-all duration-300 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 user-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 text-black" />
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{allUsers.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-12 h-12 text-purple-600" />
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{allUsers.filter(u => u.role === 'Company Admin').length}</div>
            <div className="text-sm text-gray-600">Company Admins</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{new Set(allUsers.map(u => u.company)).size}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-12 h-12 text-green-600" />
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">
              {allUsers.filter(u => u.lastLogin === 'Online').length}
            </div>
            <div className="text-sm text-gray-600">Currently Online</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 user-item">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 user-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'admins'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Company Admins
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'employees'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'suspended'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="user-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
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
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Last Login</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Sessions</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            user.role === 'Super Admin' ? 'bg-purple-600' :
                            user.role === 'Company Admin' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }`}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{user.company}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.lastLogin === 'Online' ? 'bg-green-500' :
                            'bg-gray-300'
                          }`} />
                          <span className="text-sm">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{user.lastLogin}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{user.sessions}</span>
                        </div>
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
                              <Shield className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="More Options">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </Tooltip>
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
    </div>
  );
}
