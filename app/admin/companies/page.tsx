'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Search,
  Edit,
  Eye,
  MoreHorizontal,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizations } from '@/store/actions/adminActions';

export default function CompaniesPage() {
  const dispatch = useAppDispatch();
  const contentRef = useRef<HTMLDivElement>(null);

  const { organizations, orgLoading } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.company-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'REJECTED':
      case 'SUSPENDED':
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

  const filteredCompanies = organizations.filter(company => {
    const matchesSearch =
      (company.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.companyAdmin?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.companyAdmin?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && company.status === 'APPROVED') ||
      (activeTab === 'pending' && company.status === 'PENDING') ||
      (activeTab === 'suspended' && company.status === 'SUSPENDED');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 company-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Company Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered companies</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 company-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-12 h-12 text-[#0445AD]" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{organizations.length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{organizations.filter(c => c.status === 'APPROVED').length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12 text-yellow-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">{organizations.filter(c => c.status === 'PENDING').length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 text-[#0445AD]" />
              <span className="text-sm text-gray-600">Total Users</span>
            </div>
            <div className="text-3xl font-bold font-['Montserrat']">
              {organizations.reduce((sum, c) => sum + (c.usersCount || 0), 0).toLocaleString()}
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
              All Companies ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'active'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Active ({organizations.filter(c => c.status === 'APPROVED').length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'pending'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Pending ({organizations.filter(c => c.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'suspended'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Suspended ({organizations.filter(c => c.status === 'SUSPENDED').length})
            </button>
          </div>
        </div>

        {/* Companies Table */}
        <div className="company-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            {orgLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No companies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Admin</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Users</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Departments</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Size</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {(company.companyName || company.tenantName || 'CO').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{company.companyName || company.tenantName}</p>
                              <p className="text-xs text-gray-500">
                                {company.city || 'N/A'}, {company.state || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{company.companyAdmin?.name || '—'}</p>
                            <p className="text-xs text-gray-500">{company.companyAdmin?.email || '—'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{company.usersCount || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{company.departmentsCount || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{company.companySize || '—'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(company.status)}`}>
                            {getStatusIcon(company.status)}
                            {company.status}
                          </span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
