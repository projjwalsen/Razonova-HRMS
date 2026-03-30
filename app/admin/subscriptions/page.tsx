'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Check,
  X,
  DollarSign,
  Users,
  HardDrive,
  Calendar,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: { monthly: number; annual: number };
  currency: string;
  employeeLimit: number;
  storageLimit: number;
  modules: string[];
  isActive: boolean;
}

const availableModules: Module[] = [
  { id: 'attendance', name: 'Attendance Management', icon: Calendar, description: 'Track employee attendance' },
  { id: 'leave', name: 'Leave Management', icon: Clock, description: 'Leave requests & approvals' },
  { id: 'payroll', name: 'Payroll Management', icon: DollarSign, description: 'Salary processing & payslips' },
  { id: 'recruitment', name: 'Recruitment', icon: Users, description: 'Job postings & candidates' },
  { id: 'training', name: 'Training', icon: TrendingUp, description: 'Employee training programs' },
  { id: 'performance', name: 'Performance', icon: Shield, description: 'Performance reviews' },
  { id: 'analytics', name: 'Analytics', icon: FileText, description: 'Reports & insights' },
  { id: 'time_tracking', name: 'Time Tracking', icon: Clock, description: 'Project time tracking' },
  { id: 'benefits', name: 'Benefits', icon: Users, description: 'Employee benefits' },
  { id: 'documents', name: 'Documents', icon: FileText, description: 'Document management' },
];

export default function SubscriptionSetupPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 0, annual: 0 },
      currency: 'USD',
      employeeLimit: 10,
      storageLimit: 1,
      modules: ['attendance', 'leave'],
      isActive: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 49, annual: 470 },
      currency: 'USD',
      employeeLimit: 50,
      storageLimit: 10,
      modules: ['attendance', 'leave', 'payroll', 'training', 'performance'],
      isActive: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 149, annual: 1420 },
      currency: 'USD',
      employeeLimit: 200,
      storageLimit: 50,
      modules: ['attendance', 'leave', 'payroll', 'recruitment', 'training', 'performance', 'analytics'],
      isActive: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 399, annual: 3830 },
      currency: 'USD',
      employeeLimit: -1,
      storageLimit: -1,
      modules: ['attendance', 'leave', 'payroll', 'recruitment', 'training', 'performance', 'analytics', 'time_tracking', 'benefits', 'documents'],
      isActive: true,
    },
  ]);

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const items = document.querySelectorAll('.subscription-item');
    items.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [billingCycle, expandedPlanId]);

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const handleSavePlan = (planData: Partial<Plan>) => {
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p));
    } else {
      const newPlan: Plan = {
        id: planData.id || `plan-${Date.now()}`,
        name: planData.name || 'New Plan',
        price: planData.price || { monthly: 0, annual: 0 },
        currency: planData.currency || 'USD',
        employeeLimit: planData.employeeLimit || 10,
        storageLimit: planData.storageLimit || 1,
        modules: planData.modules || [],
        isActive: planData.isActive !== undefined ? planData.isActive : true,
      };
      setPlans([...plans, newPlan]);
    }
    setShowAddForm(false);
    setEditingPlan(null);
  };

  const toggleModule = (planId: string, moduleId: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const hasModule = plan.modules.includes(moduleId);
        return {
          ...plan,
          modules: hasModule
            ? plan.modules.filter(m => m !== moduleId)
            : [...plan.modules, moduleId],
        };
      }
      return plan;
    }));
  };

  const togglePlanStatus = (planId: string) => {
    setPlans(plans.map(plan =>
      plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
    ));
  };

  const getPrice = (plan: Plan) => {
    return billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 subscription-item">
        <div>
          <h1 className="text-3xl font-bold font-['Montserrat']">Subscription Setup</h1>
          <p className="text-gray-600 mt-1">Configure subscription plans and modules</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowAddForm(true);
          }}
          className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="mb-8 subscription-item">
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
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <div key={plan.id} className="subscription-item">
            <div className={`bg-white border-2 border-gray-100 rounded-xl overflow-hidden transition-all duration-300 ${
              !plan.isActive ? 'opacity-50' : ''
            }`}>
              {/* Plan Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat']">{plan.name}</h3>
                  <button
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      plan.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-['Montserrat']">${getPrice(plan)}</span>
                    <span className="text-gray-500 text-sm">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-semibold">{plan.employeeLimit === -1 ? 'Unlimited' : plan.employeeLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage:</span>
                    <span className="font-semibold">{plan.storageLimit === -1 ? 'Unlimited' : `${plan.storageLimit} GB`}</span>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Included Modules ({plan.modules.length})</h4>
                  <button
                    onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                    className="text-gray-400 hover:text-[#0445AD] transition-colors"
                  >
                    {expandedPlanId === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedPlanId === plan.id ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableModules.map((module) => {
                      const Icon = module.icon;
                      const isIncluded = plan.modules.includes(module.id);

                      return (
                        <button
                          key={module.id}
                          onClick={() => toggleModule(plan.id, module.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            isIncluded
                              ? 'bg-[#0445AD] text-white border-black'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left text-sm font-medium">
                            {module.name}
                          </span>
                          {isIncluded && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {plan.modules.slice(0, 4).map((moduleId) => {
                      const module = availableModules.find(m => m.id === moduleId);
                      if (!module) return null;
                      const Icon = module.icon;
                      return (
                        <div key={moduleId} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-700">{module.name}</span>
                        </div>
                      );
                    })}
                    {plan.modules.length > 4 && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-xs text-gray-700">+{plan.modules.length - 4} more</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 px-4 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Module Overview */}
      <div className="mb-12 subscription-item">
        <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Available Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableModules.map((module) => {
            const Icon = module.icon;
            const plansWithModule = plans.filter(p => p.modules.includes(module.id)).length;

            return (
              <div key={module.id} className="p-5 bg-white border-2 border-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold mb-1">{module.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{module.description}</p>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-[#0445AD]">{plansWithModule}</span> / {plans.length} plans
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="subscription-item">
        <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Plan Comparison</h2>
        <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-sm">Module</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-6 font-semibold text-sm">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availableModules.map((module, index) => {
                  const Icon = module.icon;
                  return (
                    <tr key={module.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{module.name}</div>
                            <div className="text-xs text-gray-500">{module.description}</div>
                          </div>
                        </div>
                      </td>
                      {plans.map((plan) => {
                        const isIncluded = plan.modules.includes(module.id);
                        return (
                          <td key={plan.id} className="text-center py-4 px-6">
                            {isIncluded ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                <Check className="w-3 h-3" />
                                Included
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#0445AD]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-['Montserrat']">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPlan(null);
                  }}
                  className="text-gray-400 hover:text-[#0445AD] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <PlanForm
                plan={editingPlan}
                availableModules={availableModules}
                onSave={handleSavePlan}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingPlan(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanForm({
  plan,
  availableModules,
  onSave,
  onCancel,
}: {
  plan: Plan | null;
  availableModules: Module[];
  onSave: (plan: Partial<Plan>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    id: plan?.id || '',
    name: plan?.name || '',
    price: plan?.price || { monthly: 0, annual: 0 },
    currency: plan?.currency || 'USD',
    employeeLimit: plan?.employeeLimit || 10,
    storageLimit: plan?.storageLimit || 1,
    modules: plan?.modules || [],
    isActive: plan?.isActive !== undefined ? plan.isActive : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.includes(moduleId)
        ? formData.modules.filter(m => m !== moduleId)
        : [...formData.modules, moduleId],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Plan Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Monthly Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price.monthly}
            onChange={(e) => setFormData({
              ...formData,
              price: { ...formData.price, monthly: Number(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Annual Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price.annual}
            onChange={(e) => setFormData({
              ...formData,
              price: { ...formData.price, annual: Number(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Employee Limit</label>
          <input
            type="number"
            value={formData.employeeLimit}
            onChange={(e) => setFormData({ ...formData, employeeLimit: Number(e.target.value) })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter -1 for unlimited</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Storage Limit (GB)</label>
          <input
            type="number"
            value={formData.storageLimit}
            onChange={(e) => setFormData({ ...formData, storageLimit: Number(e.target.value) })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter -1 for unlimited</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-4">Included Modules</label>
        <div className="grid grid-cols-2 gap-3">
          {availableModules.map((module) => {
            const Icon = module.icon;
            const isSelected = formData.modules.includes(module.id);

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => toggleModule(module.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-[#0445AD] text-white border-black'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium">{module.name}</span>
                {isSelected && <Check className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-semibold">Plan Status</p>
          <p className="text-sm text-gray-500">Enable or disable this plan</p>
        </div>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            formData.isActive
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {formData.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {plan ? 'Update Plan' : 'Create Plan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
