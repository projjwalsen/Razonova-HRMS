'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Check,
  AlertTriangle,
  Building,
  Briefcase,
  User,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  RegularizationPolicy,
  RegularizationApproverType,
  AttendanceRegularizationRequest,
  fetchRegularizationPolicies,
  upsertRegularizationPolicy,
  fetchPendingRegularizationApprovals,
  approveRegularizationRequest,
  rejectRegularizationRequest,
} from '@/store/actions/attendanceActions';
import { fetchDepartments } from '@/store/actions/departmentActions';
import { fetchDesignations } from '@/store/actions/designationActions';

// ── Status helpers ─────────────────────────────────────────────────────────
function getRegStatusColor(status: string) {
  switch ((status || '').toUpperCase()) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-700';
    case 'APPROVED': return 'bg-green-100 text-green-700';
    case 'REJECTED': return 'bg-red-100 text-red-700';
    case 'CANCELLED': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-700';
  }
}
function formatRegStatus(s: string) {
  return (s || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}
function getApproverLabel(type: RegularizationApproverType) {
  const map: Record<string, string> = {
    REPORTING_MANAGER: 'Reporting Manager',
    DEPARTMENT_MANAGER: 'Department Manager',
    COMPANY_ADMIN: 'Company Admin',
    SPECIFIC_USER: 'Specific User',
  };
  return map[type] || type;
}

// ── Approver type dropdown options ─────────────────────────────────────────
const APPROVER_TYPE_OPTIONS: { value: RegularizationApproverType; label: string }[] = [
  { value: 'REPORTING_MANAGER', label: 'Reporting Manager' },
  { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'SPECIFIC_USER', label: 'Specific User' },
];

// ── Policy form ───────────────────────────────────────────────────────────
interface PolicyForm {
  id?: string;
  name: string;
  departmentId: string;
  designationId: string;
  approverType: RegularizationApproverType;
  userId: string;
  isActive: boolean;
}
function PolicyModal({
  policy,
  departments,
  designations,
  saving,
  onSave,
  onClose,
}: {
  policy?: RegularizationPolicy;
  departments: { id: string; name: string }[];
  designations: { id: string; name: string }[];
  saving: boolean;
  onSave: (form: PolicyForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PolicyForm>({
    id: policy?.id || '',
    name: policy?.name || '',
    departmentId: policy?.departmentId || '',
    designationId: policy?.designationId || '',
    approverType: policy?.approverType || 'COMPANY_ADMIN',
    userId: policy?.userId || '',
    isActive: policy?.isActive ?? true,
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Policy name is required'); return; }
    if (form.approverType === 'SPECIFIC_USER' && !form.userId) {
      setFormError('User is required when approver type is Specific User'); return;
    }
    onSave({
      ...form,
      departmentId: form.departmentId || '',
      designationId: form.designationId || '',
      userId: form.userId || '',
    });
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {policy ? 'Edit Policy' : 'Create Policy'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Policy Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Default Regularization Approval"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Department <span className="text-xs text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value, designationId: '' })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments (Global Fallback)</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Designation <span className="text-xs text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.designationId}
              onChange={(e) => setForm({ ...form, designationId: e.target.value })}
              disabled={!form.departmentId}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">All Designations</option>
              {designations.filter((d) => !form.departmentId || (d as any).departmentId === form.departmentId)
                .map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Approver Type <span className="text-red-500">*</span></label>
            <select
              value={form.approverType}
              onChange={(e) => setForm({ ...form, approverType: e.target.value as RegularizationApproverType, userId: '' })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {APPROVER_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {form.approverType === 'SPECIFIC_USER' && (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">User ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter approver user ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Enter the UUID of the user who can approve requests</p>
            </div>
          )}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-800">Active</p>
              <p className="text-xs text-gray-500">Inactive policies are ignored</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
            <strong>Priority:</strong> Department + Designation → Department only → Global Fallback
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Approval/Reject modal ──────────────────────────────────────────────────
function ApproveModal({ request, loading, onApprove, onClose }: { request: AttendanceRegularizationRequest; loading: boolean; onApprove: (id: string, remarks: string) => void; onClose: () => void }) {
  const [remarks, setRemarks] = useState('');
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Approve Request</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Approve regularization request from <strong>{request.user?.name || 'Employee'}</strong> for <strong>{request.date ? new Date(request.date).toLocaleDateString() : '—'}</strong>?</p>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Remarks <span className="text-xs text-gray-400">(optional)</span></label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Add a note..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => onApprove(request.id, remarks)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Approving...' : 'Confirm Approve'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ request, loading, onReject, onClose }: { request: AttendanceRegularizationRequest; loading: boolean; onReject: (id: string, remarks: string) => void; onClose: () => void }) {
  const [remarks, setRemarks] = useState('');
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-600" /> Reject Request</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Reject regularization request from <strong>{request.user?.name || 'Employee'}</strong> for <strong>{request.date ? new Date(request.date).toLocaleDateString() : '—'}</strong>?</p>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Reason <span className="text-xs text-gray-400">(recommended)</span></label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Reason for rejection..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => onReject(request.id, remarks)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
              {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
              {loading ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function RegularizationTabs() {
  const dispatch = useAppDispatch();
  const { policies, pendingApprovals, policyLoading, listLoading, approvalLoading, saving, error } = useAppSelector((s) => s.attendance);
  const { departments } = useAppSelector((s) => s.departments);
  const { designations } = useAppSelector((s) => s.designations);

  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'approvals'>('policies');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RegularizationPolicy | null>(null);
  const [approveRequest, setApproveRequest] = useState<AttendanceRegularizationRequest | null>(null);
  const [rejectRequest, setRejectRequest] = useState<AttendanceRegularizationRequest | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchRegularizationPolicies());
    dispatch(fetchPendingRegularizationApprovals());
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setToast({ msg: error, type: 'error' });
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSavePolicy = async (form: PolicyForm) => {
    const result = await dispatch(upsertRegularizationPolicy({
      id: form.id || undefined,
      name: form.name,
      departmentId: form.departmentId || null,
      designationId: form.designationId || null,
      approverType: form.approverType,
      userId: form.userId || null,
      isActive: form.isActive,
    }));
    if (upsertRegularizationPolicy.fulfilled.match(result)) {
      setToast({ msg: 'Policy saved successfully', type: 'success' });
      setShowPolicyModal(false);
      setEditingPolicy(null);
    } else if (result.payload) {
      setToast({ msg: result.payload as string, type: 'error' });
    }
  };

  const handleApprove = async (id: string, remarks: string) => {
    const result = await dispatch(approveRegularizationRequest({ requestId: id, remarks }));
    if (approveRegularizationRequest.fulfilled.match(result)) {
      setToast({ msg: 'Request approved', type: 'success' });
      setApproveRequest(null);
    } else if (result.payload) {
      setToast({ msg: result.payload as string, type: 'error' });
    }
  };

  const handleReject = async (id: string, remarks: string) => {
    const result = await dispatch(rejectRegularizationRequest({ requestId: id, remarks }));
    if (rejectRegularizationRequest.fulfilled.match(result)) {
      setToast({ msg: 'Request rejected', type: 'success' });
      setRejectRequest(null);
    } else if (result.payload) {
      setToast({ msg: result.payload as string, type: 'error' });
    }
  };

  const openEditPolicy = (policy: RegularizationPolicy) => {
    setEditingPolicy(policy);
    setShowPolicyModal(true);
  };

  const filteredApprovals = pendingApprovals.filter((r) =>
    !searchTerm ||
    (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.date || '').includes(searchTerm)
  );

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-5 py-2.5 font-semibold text-sm transition-all ${
              activeSubTab === 'policies' ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-1.5" />
            Policies
          </button>
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-5 py-2.5 font-semibold text-sm transition-all ${
              activeSubTab === 'approvals' ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-1.5" />
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">{pendingApprovals.length}</span>
            )}
          </button>
        </div>
        <div className="flex gap-2">
          {activeSubTab === 'policies' && (
            <button
              onClick={() => { setEditingPolicy(null); setShowPolicyModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-[#033591] transition-all"
            >
              <Plus className="w-4 h-4" /> New Policy
            </button>
          )}
          <button
            onClick={() => {
              if (activeSubTab === 'policies') dispatch(fetchRegularizationPolicies());
              else dispatch(fetchPendingRegularizationApprovals());
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-[#0445AD] hover:bg-blue-50 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${listLoading || policyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Policies ── */}
      {activeSubTab === 'policies' && (
        <div>
          {policyLoading ? (
            <div className="flex items-center justify-center h-48"><div className="h-8 w-8 border-3 border-[#0445AD] border-t-transparent rounded-full animate-spin" /></div>
          ) : policies.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border-2 border-gray-100 text-center">
              <Shield className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No policies configured</p>
              <p className="text-xs text-gray-400 mt-1">Create a policy to define who can approve regularization requests</p>
              <button onClick={() => setShowPolicyModal(true)} className="mt-4 px-5 py-2.5 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-[#033591]">
                <Plus className="w-4 h-4 inline mr-1" /> Create First Policy
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Policy Name', 'Department', 'Designation', 'Approver Type', 'Specific User', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">{policy.name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            {policy.department?.name || <span className="text-gray-400 italic">All</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            {policy.designation?.name || <span className="text-gray-400 italic">All</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-nowrap px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {getApproverLabel(policy.approverType)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {policy.approverType === 'SPECIFIC_USER' && policy.user ? (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {policy.user.name}
                            </span>
                          ) : <span className="text-gray-400 text-sm italic">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => openEditPolicy(policy)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
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

      {/* ── Pending Approvals ── */}
      {activeSubTab === 'approvals' && (
        <div>
          {listLoading ? (
            <div className="flex items-center justify-center h-48"><div className="h-8 w-8 border-3 border-[#0445AD] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Approval based on configured policies. Backend validates approver match.
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by employee name or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {filteredApprovals.length === 0 ? (
                <div className="p-10 bg-white rounded-xl border-2 border-gray-100 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No pending approvals</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['Employee', 'Department', 'Date', 'Requested Check-In', 'Requested Check-Out', 'Reason', 'Approver Type', 'Actions'].map((h) => (
                            <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredApprovals.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {(req.user?.name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{req.user?.name || '—'}</p>
                                  <p className="text-xs text-gray-400">{req.user?.email || ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">{req.user?.department?.name || '—'}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {req.date ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {req.requestedCheckInAt ? new Date(req.requestedCheckInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {req.requestedCheckOutAt ? new Date(req.requestedCheckOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[180px] truncate" title={req.reason}>{req.reason}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                {getApproverLabel(req.approverType || 'COMPANY_ADMIN')}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setApproveRequest(req)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => setRejectRequest(req)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
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
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showPolicyModal && (
        <PolicyModal
          policy={editingPolicy || undefined}
          departments={departments}
          designations={designations}
          saving={saving}
          onSave={handleSavePolicy}
          onClose={() => { setShowPolicyModal(false); setEditingPolicy(null); }}
        />
      )}
      {approveRequest && (
        <ApproveModal
          request={approveRequest}
          loading={approvalLoading}
          onApprove={handleApprove}
          onClose={() => setApproveRequest(null)}
        />
      )}
      {rejectRequest && (
        <RejectModal
          request={rejectRequest}
          loading={approvalLoading}
          onReject={handleReject}
          onClose={() => setRejectRequest(null)}
        />
      )}
    </div>
  );
}