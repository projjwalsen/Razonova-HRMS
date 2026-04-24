'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Users,
  Calendar,
  HandCoins,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.company-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showAddForm]);

  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Acme Corporation',
      adminName: 'John Smith',
      adminEmail: 'john@acme.com',
      users: 245,
      plan: 'Enterprise',
      status: 'Active',
      joinedDate: '2024-01-15',
      renewalDate: '2025-01-15',
      revenue: 12500,
      storageUsed: '75%',
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'TechStart Inc',
      adminName: 'Sarah Johnson',
      adminEmail: 'sarah@techstart.com',
      users: 89,
      plan: 'Professional',
      status: 'Active',
      joinedDate: '2024-02-20',
      renewalDate: '2025-02-20',
      revenue: 5400,
      storageUsed: '45%',
      lastActive: '1 day ago',
    },
    {
      id: 3,
      name: 'Global Solutions',
      adminName: 'Mike Davis',
      adminEmail: 'mike@global.com',
      users: 456,
      plan: 'Enterprise',
      status: 'Active',
      joinedDate: '2023-11-10',
      renewalDate: '2024-11-10',
      revenue: 15000,
      storageUsed: '82%',
      lastActive: '5 hours ago',
    },
    {
      id: 4,
      name: 'Startup Labs',
      adminName: 'Emily Chen',
      adminEmail: 'emily@startuplabs.com',
      users: 34,
      plan: 'Basic',
      status: 'Trial',
      joinedDate: '2024-03-01',
      renewalDate: '2024-03-15',
      revenue: 0,
      storageUsed: '23%',
      lastActive: '30 minutes ago',
    },
    {
      id: 5,
      name: 'Digital Dynamics',
      adminName: 'Robert Wilson',
      adminEmail: 'robert@digital.com',
      users: 178,
      plan: 'Professional',
      status: 'Active',
      joinedDate: '2023-12-05',
      renewalDate: '2024-12-05',
      revenue: 8900,
      storageUsed: '61%',
      lastActive: '3 hours ago',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Trial':
        return 'bg-blue-100 text-blue-700';
      case 'Suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Trial':
        return <Clock className="w-4 h-4" />;
      case 'Suspended':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'Professional':
        return 'bg-blue-100 text-blue-700';
      case 'Basic':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 company-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Company Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered companies</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 company-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-12 h-12 text-[#0445AD]" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{companies.length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{companies.filter(c => c.status === 'Active').length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12 text-blue-600" />
              <span className="text-sm text-gray-600">Trial</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{companies.filter(c => c.status === 'Trial').length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 text-[#0445AD]" />
              <span className="text-sm text-gray-600">Total Users</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">
              {companies.reduce((sum, c) => sum + c.users, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Across all companies</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 company-item">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company name, admin, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-black transition-all duration-300 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 company-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              All Companies
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'active'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('trial')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'trial'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Trial
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'suspended'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>

        {/* Companies Table */}
        <div className="company-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Admin</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Storage</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{company.name}</p>
                            <p className="text-xs text-gray-500">Joined {company.joinedDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{company.adminName}</p>
                          <p className="text-xs text-gray-500">{company.adminEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{company.users}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(company.plan)}`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(company.status)}`}>
                          {getStatusIcon(company.status)}
                          {company.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <HandCoins className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">${company.revenue.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{company.storageUsed}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#0445AD] h-2 rounded-full"
                              style={{ width: company.storageUsed }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Tooltip content="View Details">
                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit Company">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Suspend">
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <XCircle className="w-4 h-4" />
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
