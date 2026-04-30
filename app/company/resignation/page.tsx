'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchResignationPolicies,
  upsertResignationPolicy,
  fetchPendingResignationApprovals,
  approveResignation,
  rejectResignation,
  completeResignation,
  clearResignationError,
  ResignationApprovalPolicy,
  ResignationRequest,
  ResignationApproverType,
} from '@/store/actions/resignationActions';
import { fetchDepartments } from '@/store/actions/departmentActions';
import { fetchDesignations } from '@/store/actions/designationActions';
import { useAccess } from '@/lib/access';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

const APPROVER_TYPE_LABELS: Record<string, string> = {
  REPORTING_MANAGER: 'Reporting Manager',
  DEPARTMENT_MANAGER: 'Department Manager',
  COMPANY_ADMIN: 'Company Admin',
  SPECIFIC_USER: 'Specific User',
};

export default function CompanyResignationPage() {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAccess();
  const {
    policies, pendingApprovals,
    policyLoading, listLoading, approvalLoading,
    submitting, error,
  } = useAppSelector((s) => s.resignation);
  const { departments } = useAppSelector((s) => s.departments);
  const { designations } = useAppSelector((s) => s.designations);

  const [activeTab, setActiveTab] = useState<'policies' | 'approvals'>('policies');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ResignationApprovalPolicy | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRequest, setViewRequest] = useState<ResignationRequest | null>(null);

  const [policyForm, setPolicyForm] = useState<{
    name: string;
    departmentId: string;
    designationId: string;
    approverType: ResignationApproverType;
    userId: string;
    isActive: boolean;
  }>({
    name: '',
    departmentId: '',
    designationId: '',
    approverType: 'COMPANY_ADMIN',
    userId: '',
    isActive: true,
  });

  const [approveForm, setApproveForm] = useState({
    approvedLastWorkingDate: '',
    adminRemarks: '',
  });

  const [rejectForm, setRejectForm] = useState({ remarks: '' });

  useEffect(() => {
    dispatch(fetchResignationPolicies());
    dispatch(fetchPendingResignationApprovals());
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  const handlePolicySave = async () => {
    if (!policyForm.name.trim()) {
      alert('Policy name is required');
      return;
    }
    if (policyForm.approverType === 'SPECIFIC_USER' && !policyForm.userId) {
      alert('Please select a specific user as approver');
      return;
    }
    const result = await dispatch(upsertResignationPolicy({
      ...(editingPolicy?.id ? { id: editingPolicy.id } : {}),
      name: policyForm.name,
      departmentId: null,
      designationId: null,
      approverType: policyForm.approverType,
      userId: policyForm.approverType === 'SPECIFIC_USER' ? (policyForm.userId || null) : null,
      isActive: policyForm.isActive,
    }));
    if (upsertResignationPolicy.fulfilled.match(result)) {
      alert(editingPolicy ? 'Policy updated' : 'Policy created');
      setShowPolicyModal(false);
      setEditingPolicy(null);
      setPolicyForm({ name: '', departmentId: '', designationId: '', approverType: 'COMPANY_ADMIN', userId: '', isActive: true });
    } else {
      alert('Failed to save policy');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !approveForm.approvedLastWorkingDate) {
      alert('Approved last working date is required');
      return;
    }
    const result = await dispatch(approveResignation({
      requestId: selectedRequest.id,
      approvedLastWorkingDate: approveForm.approvedLastWorkingDate,
      adminRemarks: approveForm.adminRemarks || undefined,
    }));
    if (approveResignation.fulfilled.match(result)) {
      alert('Resignation approved');
      setShowApproveModal(false);
      setSelectedRequest(null);
      setApproveForm({ approvedLastWorkingDate: '', adminRemarks: '' });
      dispatch(fetchPendingResignationApprovals());
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    const result = await dispatch(rejectResignation({
      requestId: selectedRequest.id,
      remarks: rejectForm.remarks || undefined,
    }));
    if (rejectResignation.rejected.match(result)) {
      alert(result.payload as string || 'Failed to reject');
    } else {
      alert('Resignation rejected');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectForm({ remarks: '' });
      dispatch(fetchPendingResignationApprovals());
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;
    const result = await dispatch(completeResignation(selectedRequest.id));
    if (completeResignation.fulfilled.match(result)) {
      alert('Resignation marked as completed');
      setShowCompleteModal(false);
      setSelectedRequest(null);
      dispatch(fetchPendingResignationApprovals());
    } else {
      alert('Failed to complete resignation');
    }
  };

  const openEditPolicy = (policy: ResignationApprovalPolicy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      name: policy.name,
      departmentId: policy.departmentId || '',
      designationId: policy.designationId || '',
      approverType: policy.approverType,
      userId: policy.userId || '',
      isActive: policy.isActive,
    });
    setShowPolicyModal(true);
  };

  const openApprove = (req: ResignationRequest) => {
    setSelectedRequest(req);
    setApproveForm({
      approvedLastWorkingDate: req.preferredLastWorkingDate?.split('T')[0] || '',
      adminRemarks: '',
    });
    setShowApproveModal(true);
  };

  const openReject = (req: ResignationRequest) => {
    setSelectedRequest(req);
    setShowRejectModal(true);
  };

  const openComplete = (req: ResignationRequest) => {
    setSelectedRequest(req);
    setShowCompleteModal(true);
  };

  const openView = (req: ResignationRequest) => {
    setViewRequest(req);
    setShowViewModal(true);
  };

  const getApproverName = (policy: ResignationApprovalPolicy) => {
    if (policy.approverType === 'SPECIFIC_USER' && policy.user) return policy.user.name;
    if (policy.approverType === 'DEPARTMENT_MANAGER' && policy.department) return policy.department.managerId ? 'Dept Manager' : 'Not Set';
    return APPROVER_TYPE_LABELS[policy.approverType] || policy.approverType;
  };

  const canManage = hasPermission('RESIGNATION:MANAGE');
  const canView = hasPermission('RESIGNATION:VIEW');

  if (!canView) {
    return (
      <div className="w-full p-8">
        <div className="p-8 bg-white rounded-2xl border-2 border-gray-100 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You do not have permission to access Resignation Management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resignation Management</h1>
          <p className="text-gray-600 mt-1">Manage resignation policies and approvals</p>
        </div>
        {hasPermission('RESIGNATION:MANAGE') && (
          <button
            onClick={() => { setEditingPolicy(null); setPolicyForm({ name: '', departmentId: '', designationId: '', approverType: 'COMPANY_ADMIN', userId: '', isActive: true }); setShowPolicyModal(true); }}
            className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Policy
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearResignationError())}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'policies' ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'}`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Policies
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'approvals' ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'}`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingApprovals.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Policies Tab ── */}
      {activeTab === 'policies' && (
        <div>
          {policyLoading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]" /></div>
          ) : policies.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No resignation policies found</p>
              <p className="text-xs text-gray-400 mt-1">Create a policy to define approval workflows</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Policy Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Scope</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Approver</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{policy.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {policy.department ? policy.department.name : <span className="text-gray-400">All Departments</span>}
                        {policy.designation && ` / ${policy.designation.name}`}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="font-medium">{getApproverName(policy)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {hasPermission('RESIGNATION:MANAGE') && (
                          <button
                            onClick={() => openEditPolicy(policy)}
                            className="px-3 py-1.5 text-sm bg-[#0445AD] text-white rounded-lg hover:bg-[#033591] transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Approvals Tab ── */}
      {activeTab === 'approvals' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Approvals ({pendingApprovals.length})</h2>
            <button
              onClick={() => dispatch(fetchPendingResignationApprovals())}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          {listLoading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]" /></div>
          ) : pendingApprovals.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <UserCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border-2 border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{req.user?.name || 'Unknown'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{req.user?.email}</p>
                      {req.user?.department && (
                        <p className="text-xs text-gray-400 mb-1">Dept: {req.user.department.name}</p>
                      )}
                      {req.user?.designation && (
                        <p className="text-xs text-gray-400 mb-1">Role: {req.user.designation.name}</p>
                      )}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-semibold text-gray-700 mb-1">Reason:</p>
                        <p className="text-gray-600">{req.reason}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                        {req.preferredLastWorkingDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Preferred LWD: <strong>{new Date(req.preferredLastWorkingDate).toLocaleDateString()}</strong></span>
                          </div>
                        )}
                        {req.approvedLastWorkingDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Approved LWD: <strong>{new Date(req.approvedLastWorkingDate).toLocaleDateString()}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Requested: <strong>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</strong></span>
                        </div>
                      </div>
                      {req.adminRemarks && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
                          <p className="font-semibold text-blue-700 mb-1">Admin Remarks:</p>
                          <p className="text-blue-600">{req.adminRemarks}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openView(req)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {req.status === 'PENDING' && (
                        <>
                          <button onClick={() => openApprove(req)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => openReject(req)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <button onClick={() => openComplete(req)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Mark Complete">
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Policy Modal ── */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editingPolicy ? 'Edit Policy' : 'Create Policy'}</h2>
              <button onClick={() => { setShowPolicyModal(false); setEditingPolicy(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Policy Name *</label>
                <input
                  type="text"
                  value={policyForm.name}
                  onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                  placeholder="e.g., Default Resignation Policy"
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Department (Optional)</label>
                <select
                  value={policyForm.departmentId ?? ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, departmentId: e.target.value, designationId: '' })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Designation (Optional)</label>
                <select
                  value={policyForm.designationId ?? ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, designationId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                >
                  <option value="">All Designations</option>
                  {designations
                    .filter((d) => !policyForm.departmentId || (d as any).departmentId === policyForm.departmentId)
                    .map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Approver Type *</label>
                <select
                  value={policyForm.approverType}
                  onChange={(e) => setPolicyForm({ ...policyForm, approverType: e.target.value as ResignationApproverType, userId: '' })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                >
                  <option value="REPORTING_MANAGER">Reporting Manager</option>
                  <option value="DEPARTMENT_MANAGER">Department Manager</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="SPECIFIC_USER">Specific User</option>
                </select>
              </div>
              {policyForm.approverType === 'SPECIFIC_USER' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Approver User ID *</label>
                  <input
                    type="text"
                    value={policyForm.userId ?? ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, userId: e.target.value })}
                    placeholder="Enter user ID"
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter the exact user ID of the approver</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPolicyForm({ ...policyForm, isActive: !policyForm.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${policyForm.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${policyForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium">{policyForm.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowPolicyModal(false); setEditingPolicy(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handlePolicySave} disabled={submitting} className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition disabled:opacity-50">
                {submitting ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Modal ── */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-green-700">Approve Resignation</h2>
              <button onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Approving resignation for <strong>{selectedRequest.user?.name}</strong>
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1">Approved Last Working Date *</label>
                <input
                  type="date"
                  value={approveForm.approvedLastWorkingDate}
                  onChange={(e) => setApproveForm({ ...approveForm, approvedLastWorkingDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Admin Remarks</label>
                <textarea
                  value={approveForm.adminRemarks}
                  onChange={(e) => setApproveForm({ ...approveForm, adminRemarks: e.target.value })}
                  rows={3}
                  placeholder="Optional remarks..."
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleApprove} disabled={approvalLoading} className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
                {approvalLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-red-700">Reject Resignation</h2>
              <button onClick={() => { setShowRejectModal(false); setSelectedRequest(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Rejecting resignation for <strong>{selectedRequest.user?.name}</strong>
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1">Remarks</label>
                <textarea
                  value={rejectForm.remarks}
                  onChange={(e) => setRejectForm({ ...rejectForm, remarks: e.target.value })}
                  rows={3}
                  placeholder="Reason for rejection (optional)..."
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowRejectModal(false); setSelectedRequest(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleReject} disabled={approvalLoading} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
                {approvalLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Complete Modal ── */}
      {showCompleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-purple-700">Mark as Completed</h2>
              <button onClick={() => { setShowCompleteModal(false); setSelectedRequest(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm text-purple-700">
                  This will mark the resignation as completed and initiate the offboarding process for <strong>{selectedRequest.user?.name}</strong>.
                </p>
              </div>
              {selectedRequest.approvedLastWorkingDate && (
                <p className="text-sm text-gray-600">
                  Last working date: <strong>{new Date(selectedRequest.approvedLastWorkingDate).toLocaleDateString()}</strong>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowCompleteModal(false); setSelectedRequest(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleComplete} disabled={approvalLoading} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                {approvalLoading ? 'Completing...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {showViewModal && viewRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">Resignation Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewRequest(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Employee</p>
                <p className="font-semibold">{viewRequest.user?.name}</p>
                <p className="text-sm text-gray-500">{viewRequest.user?.email}</p>
              </div>
              {viewRequest.user?.department && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Department</p>
                  <p className="font-semibold">{viewRequest.user.department.name}</p>
                </div>
              )}
              {viewRequest.user?.designation && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Designation</p>
                  <p className="font-semibold">{viewRequest.user.designation.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[viewRequest.status]}`}>
                  {STATUS_LABELS[viewRequest.status]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Reason</p>
                <p className="text-sm">{viewRequest.reason}</p>
              </div>
              {viewRequest.preferredLastWorkingDate && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Preferred Last Working Date</p>
                  <p className="text-sm">{new Date(viewRequest.preferredLastWorkingDate).toLocaleDateString()}</p>
                </div>
              )}
              {viewRequest.approvedLastWorkingDate && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Approved Last Working Date</p>
                  <p className="text-sm">{new Date(viewRequest.approvedLastWorkingDate).toLocaleDateString()}</p>
                </div>
              )}
              {viewRequest.adminRemarks && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Admin Remarks</p>
                  <p className="text-sm">{viewRequest.adminRemarks}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Submitted On</p>
                <p className="text-sm">{viewRequest.createdAt ? new Date(viewRequest.createdAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowViewModal(false); setViewRequest(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
