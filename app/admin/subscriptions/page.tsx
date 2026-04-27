'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Check,
  X,
  HandCoins,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Building2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSubscriptionModules,
  upsertSubscriptionModule,
  fetchOrganizations,
  fetchSubscribedTenants,
  fetchActiveSubscription,
  assignModulesToTenant,
  updateTenantModules,
  cancelSubscription,
  clearActiveSubscription,
  SubscriptionModule,
} from '@/store/actions/adminActions';

const moduleIcons: Record<string, any> = {
  ATTENDANCE: Calendar,
  LEAVE: Clock,
  PAYROLL: HandCoins,
  RECRUITMENT: Users,
  TRAINING: TrendingUp,
  PERFORMANCE: Shield,
  ANALYTICS: FileText,
  TIME_TRACKING: Clock,
  BENEFITS: Users,
  DOCUMENTS: FileText,
};

export default function SubscriptionSetupPage() {
  const dispatch = useAppDispatch();

  const { subscriptionModules, organizations, subscribedTenants, activeSubscription, modulesLoading, subscriptionLoading, orgLoading, actionLoading, actionSuccess, actionError } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<'modules' | 'organizations' | 'subscriptions'>('modules');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<SubscriptionModule | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [assignBillingCycle, setAssignBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedModules, setSelectedModules] = useState<{ key: string; isEnabled: boolean }[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTenantId, setViewingTenantId] = useState<string>('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingTenantId, setUpdatingTenantId] = useState<string>('');
  const [updateModules, setUpdateModules] = useState<{ key: string; isEnabled: boolean }[]>([]);

  useEffect(() => {
    dispatch(fetchSubscriptionModules());
    dispatch(fetchOrganizations());
    dispatch(fetchSubscribedTenants());
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess) {
      setShowModuleForm(false);
      setShowAssignModal(false);
      setShowUpdateModal(false);
      setTimeout(() => {
        dispatch(fetchSubscriptionModules());
        dispatch(fetchSubscribedTenants());
      }, 500);
    }
  }, [actionSuccess, dispatch]);

  const getPrice = (module: SubscriptionModule) => {
    return billingCycle === 'monthly' ? module.monthlyPrice : module.yearlyPrice;
  };

  const handleEditModule = (module: SubscriptionModule) => {
    setEditingModule(module);
    setShowModuleForm(true);
  };

  const handleSaveModule = (moduleData: Partial<SubscriptionModule>) => {
    dispatch(upsertSubscriptionModule({
      key: moduleData.key || '',
      name: moduleData.name || '',
      description: moduleData.description,
      isActive: moduleData.isActive ?? true,
      monthlyPrice: moduleData.monthlyPrice ?? 0,
      yearlyPrice: moduleData.yearlyPrice ?? 0,
    }));
    setEditingModule(null);
  };

  const handleViewSubscription = (tenantId: string) => {
    setViewingTenantId(tenantId);
    dispatch(clearActiveSubscription());
    setShowViewModal(true);
  };

  const handleAssignModules = async () => {
    if (!selectedTenant || selectedModules.length === 0) return;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);

    // Transform modules to use moduleKey instead of key
    const transformedModules = selectedModules.map(m => ({
      moduleKey: m.key,
      isEnabled: m.isEnabled,
    }));

    await dispatch(assignModulesToTenant({
      tenantId: selectedTenant,
      billingCycle: assignBillingCycle,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      modules: transformedModules,
    }));

    setSelectedTenant('');
    setSelectedModules([]);
  };

  const handleUpdateModules = async () => {
    if (!updatingTenantId || updateModules.length === 0) return;
    const transformedModules = updateModules.map(m => ({
      moduleKey: m.key,
      isEnabled: m.isEnabled,
    }));
    await dispatch(updateTenantModules({
      tenantId: updatingTenantId,
      modules: transformedModules,
    }));
  };

  const handleCancelSubscription = async (tenantId: string, subscriptionId: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      await dispatch(cancelSubscription({ tenantId, subscriptionId }));
    }
  };

  const handleOpenAssignModal = (tenantId?: string) => {
    setSelectedTenant(tenantId || '');
    setSelectedModules([]);
    setAssignBillingCycle('MONTHLY');
    setShowAssignModal(true);
  };

  const handleOpenUpdateModal = async (tenantId: string, currentModules: { key: string; name: string; isEnabled: boolean }[]) => {
    setUpdatingTenantId(tenantId);
    setUpdateModules(currentModules.map(m => ({ key: m.key, isEnabled: m.isEnabled })));
    setShowUpdateModal(true);
  };

  const toggleModuleSelection = (key: string, isEnabled: boolean) => {
    setSelectedModules(prev => {
      const existing = prev.find(m => m.key === key);
      if (existing) {
        return prev.map(m => m.key === key ? { ...m, isEnabled } : m);
      }
      return [...prev, { key, isEnabled }];
    });
  };

  const toggleUpdateModule = (key: string, isEnabled: boolean) => {
    setUpdateModules(prev => {
      const existing = prev.find(m => m.key === key);
      if (existing) {
        return prev.map(m => m.key === key ? { ...m, isEnabled } : m);
      }
      return [...prev, { key, isEnabled }];
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Montserrat']">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage subscription modules and tenant assignments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === 'modules'
                ? 'text-[#0445AD] border-b-2 border-black'
                : 'text-gray-500 hover:text-[#0445AD]'
            }`}
          >
            Modules ({subscriptionModules.length})
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === 'organizations'
                ? 'text-[#0445AD] border-b-2 border-black'
                : 'text-gray-500 hover:text-[#0445AD]'
            }`}
          >
            Organizations ({organizations.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === 'subscriptions'
                ? 'text-[#0445AD] border-b-2 border-black'
                : 'text-gray-500 hover:text-[#0445AD]'
            }`}
          >
            Subscriptions ({subscribedTenants.length})
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {actionSuccess}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div>
          {/* Billing Cycle Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#0445AD] shadow-sm'
                    : 'text-gray-600 hover:text-[#0445AD]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 relative ${
                  billingCycle === 'annual'
                    ? 'bg-white text-[#0445AD] shadow-sm'
                    : 'text-gray-600 hover:text-[#0445AD]'
                }`}
              >
                Annual
                <span className="absolute -top-1 -right-1 bg-[#0445AD] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Save 20%
                </span>
              </button>
            </div>
            <button
              onClick={() => {
                setEditingModule(null);
                setShowModuleForm(true);
              }}
              className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Module
            </button>
          </div>

          {/* Modules Grid */}
          {modulesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
            </div>
          ) : subscriptionModules.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No subscription modules found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subscriptionModules.map((module) => {
                const Icon = moduleIcons[module.key] || Shield;
                const isExpanded = expandedModuleId === module.key;

                return (
                  <div key={module.key} className={`bg-white border-2 border-gray-100 rounded-xl overflow-hidden transition-all duration-300 ${
                    !module.isActive ? 'opacity-50' : ''
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`w-3 h-3 rounded-full ${module.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      <h3 className="text-lg font-bold font-['Montserrat'] mb-2">{module.name}</h3>
                      <p className="text-xs text-gray-500 mb-4">{module.description || module.key}</p>
                      <div className="mb-4">
                        <span className="text-3xl font-bold font-['Montserrat']">${getPrice(module)}</span>
                        <span className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setExpandedModuleId(isExpanded ? null : module.key)}
                          className="text-sm text-[#0445AD] hover:underline flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monthly Price:</span>
                            <span className="font-semibold">${module.monthlyPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Yearly Price:</span>
                            <span className="font-semibold">${module.yearlyPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${module.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              {module.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditModule(module)}
                          className="flex-1 px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => handleOpenAssignModal()}
              className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Assign Modules
            </button>
          </div>

          {orgLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-sm">Organization</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Users</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {(org.companyName || org.tenantName || 'CO').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{org.companyName || org.tenantName}</p>
                              <p className="text-xs text-gray-500">{org.city}, {org.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            org.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            org.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {org.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold">{org.usersCount || 0}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewSubscription(org.id)}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleOpenAssignModal(org.id)}
                              className="px-3 py-1.5 bg-[#0445AD] text-white rounded text-xs font-semibold hover:bg-gray-800 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div>
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
            </div>
          ) : subscribedTenants.length === 0 ? (
            <div className="text-center py-12">
              <HandCoins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active subscriptions</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-sm">Organization</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Billing Cycle</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Start Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">End Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Modules</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribedTenants.map((sub) => (
                      <tr key={sub.subscriptionId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0445AD] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {(sub.tenantName || 'CO').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{sub.tenantName}</p>
                              <p className="text-xs text-gray-500">{sub.companyName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold">{sub.billingCycle}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm">{sub.enabledModules} / {sub.totalModules} enabled</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sub.isActive ? 'Active' : 'Cancelled'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewSubscription(sub.tenantId)}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {sub.isActive && (
                              <button
                                onClick={() => handleOpenUpdateModal(sub.tenantId, [])}
                                className="px-3 py-1.5 bg-[#0445AD] text-white rounded text-xs font-semibold hover:bg-gray-800 flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Update
                              </button>
                            )}
                            {sub.isActive && (
                              <button
                                onClick={() => handleCancelSubscription(sub.tenantId, sub.subscriptionId)}
                                className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <ModuleFormModal
          module={editingModule}
          onSave={handleSaveModule}
          onClose={() => {
            setShowModuleForm(false);
            setEditingModule(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Assign Modules Modal */}
      {showAssignModal && (
        <AssignModulesModal
          organizations={organizations}
          modules={subscriptionModules}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          billingCycle={assignBillingCycle}
          setBillingCycle={setAssignBillingCycle}
          selectedModules={selectedModules}
          toggleModule={toggleModuleSelection}
          onSave={handleAssignModules}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTenant('');
            setSelectedModules([]);
          }}
          loading={actionLoading}
        />
      )}

      {/* View Subscription Modal */}
      {showViewModal && (
        <ViewSubscriptionModal
          tenantId={viewingTenantId}
          onClose={() => {
            setShowViewModal(false);
            dispatch(clearActiveSubscription());
          }}
        />
      )}

      {/* Update Modules Modal */}
      {showUpdateModal && (
        <UpdateModulesModal
          modules={subscriptionModules}
          tenantId={updatingTenantId}
          updateModules={updateModules}
          setUpdateModules={setUpdateModules}
          toggleModule={toggleUpdateModule}
          onSave={handleUpdateModules}
          onClose={() => {
            setShowUpdateModal(false);
            setUpdatingTenantId('');
            setUpdateModules([]);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Module Form Modal Component
function ModuleFormModal({
  module,
  onSave,
  onClose,
  loading,
}: {
  module: SubscriptionModule | null;
  onSave: (data: Partial<SubscriptionModule>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    key: module?.key || '',
    name: module?.name || '',
    description: module?.description || '',
    isActive: module?.isActive ?? true,
    monthlyPrice: module?.monthlyPrice ?? 0,
    yearlyPrice: module?.yearlyPrice ?? 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-['Montserrat']">
              {module ? 'Edit Module' : 'Add New Module'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0445AD]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          <div>
            <label className="block text-sm font-semibold mb-2">Module Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              disabled={!!module}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Module Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Monthly Price ($)</label>
              <input
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Yearly Price ($)</label>
              <input
                type="number"
                value={formData.yearlyPrice}
                onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Module Status</p>
              <p className="text-sm text-gray-500">Enable or disable this module</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                formData.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              {formData.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Module'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Assign Modules Modal Component
function AssignModulesModal({
  organizations,
  modules,
  selectedTenant,
  setSelectedTenant,
  billingCycle,
  setBillingCycle,
  selectedModules,
  toggleModule,
  onSave,
  onClose,
  loading,
}: {
  organizations: any[];
  modules: SubscriptionModule[];
  selectedTenant: string;
  setSelectedTenant: (v: string) => void;
  billingCycle: 'MONTHLY' | 'YEARLY';
  setBillingCycle: (v: 'MONTHLY' | 'YEARLY') => void;
  selectedModules: { key: string; isEnabled: boolean }[];
  toggleModule: (key: string, isEnabled: boolean) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const selectedOrg = organizations.find(o => o.id === selectedTenant);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-['Montserrat']">Assign Modules</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0445AD]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          <div>
            <label className="block text-sm font-semibold mb-2">Select Organization</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="">Select an organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.companyName || org.tenantName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Billing Cycle</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  billingCycle === 'MONTHLY' ? 'bg-[#0445AD] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('YEARLY')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  billingCycle === 'YEARLY' ? 'bg-[#0445AD] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Select Modules</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {modules.map((mod) => (
                <label
                  key={mod.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedModules.some(m => m.key === mod.key && m.isEnabled)}
                    onChange={(e) => toggleModule(mod.key, e.target.checked)}
                    className="w-5 h-5 accent-[#0445AD]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{mod.name}</p>
                    <p className="text-xs text-gray-500">${billingCycle === 'MONTHLY' ? mod.monthlyPrice : mod.yearlyPrice}/{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onSave}
              disabled={loading || !selectedTenant || selectedModules.length === 0}
              className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Assigning...' : 'Assign Modules'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// View Subscription Modal Component
function ViewSubscriptionModal({
  tenantId,
  onClose,
}: {
  tenantId: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform/subscription/active-subscription/${tenantId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
          },
        });
        const response = await res.json();
        if (response.status) {
          setSubscriptionData(response.data);
        } else {
          setError(response.message || 'Failed to fetch subscription');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0445AD] mb-4"></div>
            <p className="text-gray-500">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscriptionData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-12">
          <div className="flex flex-col items-center justify-center">
            <Shield className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">{error || 'No subscription details found'}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subscription = subscriptionData;
  const hasModules = subscription.hasSubscriptions && subscription.modules?.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-['Montserrat']">
              {subscription.hasSubscriptions ? 'Active Subscription' : 'No Subscription'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0445AD]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          {!subscription.hasSubscriptions ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">This organization has no active subscription</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                  <p className="font-semibold">{subscription.subscription?.billingCycle || '—'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold">
                    {subscription.subscription?.startDate
                      ? new Date(subscription.subscription.startDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">End Date</p>
                  <p className="font-semibold">
                    {subscription.subscription?.endDate
                      ? new Date(subscription.subscription.endDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">Subscribed Modules ({subscription.modules?.length || 0})</p>
                <div className="space-y-2">
                  {subscription.modules?.map((modItem: any) => (
                    <div key={modItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{modItem.module?.name || modItem.module?.key}</span>
                        <p className="text-xs text-gray-500">{modItem.module?.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          modItem.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {modItem.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {modItem.isEnabled && modItem.monthlyPrice > 0 && (
                          <p className="text-xs text-gray-500 mt-1">${modItem.monthlyPrice}/mo</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Update Modules Modal Component
function UpdateModulesModal({
  modules,
  tenantId,
  updateModules,
  setUpdateModules,
  toggleModule,
  onSave,
  onClose,
  loading,
}: {
  modules: SubscriptionModule[];
  tenantId: string;
  updateModules: { key: string; isEnabled: boolean }[];
  setUpdateModules: React.Dispatch<React.SetStateAction<{ key: string; isEnabled: boolean }[]>>;
  toggleModule: (key: string, isEnabled: boolean) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-['Montserrat']">Update Modules</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0445AD]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          <div>
            <label className="block text-sm font-semibold mb-2">Select Modules to Enable/Disable</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {modules.map((mod) => (
                <label
                  key={mod.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={updateModules.some(m => m.key === mod.key && m.isEnabled)}
                    onChange={(e) => toggleModule(mod.key, e.target.checked)}
                    className="w-5 h-5 accent-[#0445AD]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{mod.name}</p>
                    <p className="text-xs text-gray-500">{mod.key}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Updating...' : 'Update Modules'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
