'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  X,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  LogOut,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CheckCheck,
  Hash,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMyResignations,
  submitResignation,
  withdrawResignation,
  clearResignationError,
  ResignationRequest,
} from '@/store/actions/resignationActions';

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

function fmt(date: string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function FieldRow({ icon: Icon, label, value, valueClass }: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  valueClass?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
      <span className="text-xs text-gray-500 min-w-32">{label}:</span>
      <span className={`text-xs font-medium ${valueClass || 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">{label}</p>;
}

export default function EmployeeResignationPage() {
  const dispatch = useAppDispatch();
  const { myRequests, submitting, listLoading, error } = useAppSelector((s) => s.resignation);

  const hasAnyRequest = myRequests.length > 0;
  const hasPendingRequest = myRequests.some((r) => r.status === 'PENDING');

  const tabs: { key: 'submit' | 'history'; label: string }[] = [];
  if (!hasAnyRequest) tabs.push({ key: 'submit', label: 'Submit Request' });
  tabs.push({ key: 'history', label: `My Requests${hasAnyRequest ? ` (${myRequests.length})` : ''}` });

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>(hasAnyRequest ? 'history' : 'submit');
  const [reason, setReason] = useState('');
  const [preferredLastWorkingDate, setPreferredLastWorkingDate] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchMyResignations());
  }, [dispatch]);

  useEffect(() => {
    if (error) alert(error);
  }, [error]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!reason.trim()) { setFormError('Reason is required'); return; }
    const result = await dispatch(submitResignation({ reason: reason.trim(), preferredLastWorkingDate: preferredLastWorkingDate || undefined }));
    if (submitResignation.fulfilled.match(result)) {
      alert('Resignation submitted successfully');
      setReason('');
      setPreferredLastWorkingDate('');
      setActiveTab('history');
      dispatch(fetchMyResignations());
    } else {
      alert('Failed to submit resignation');
    }
  };

  const handleWithdraw = async (requestId: string) => {
    if (!confirm('Are you sure you want to withdraw this resignation request?')) return;
    const result = await dispatch(withdrawResignation(requestId));
    if (withdrawResignation.fulfilled.match(result)) {
      alert('Resignation withdrawn');
      dispatch(fetchMyResignations());
    }
  };

  const renderRequestCard = (req: ResignationRequest) => (
    <div key={req.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#0445AD]" />
          <h3 className="font-bold text-gray-900">Resignation Request</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[req.status] || req.status}
          </span>
        </div>
        {req.status === 'PENDING' && (
          <button
            onClick={() => handleWithdraw(req.id)}
            disabled={submitting}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Withdraw
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">

          {/* Request Details */}
          <SectionHeader label="Request Details" />
          <div className="sm:col-span-2">
            <FieldRow icon={Hash} label="Request ID" value={req.id} valueClass="text-gray-700 font-mono text-xs" />
          </div>
          <FieldRow icon={User} label="User ID" value={req.userId} valueClass="text-gray-700 font-mono text-xs" />
          <FieldRow icon={Calendar} label="Preferred Last Working Date" value={fmt(req.preferredLastWorkingDate)} />
          <FieldRow icon={Calendar} label="Approved Last Working Date" value={fmt(req.approvedLastWorkingDate)} valueClass="text-green-700" />

          {/* Reason */}
          {req.reason && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{req.reason}</p>
            </div>
          )}

          {/* Approver Info */}
          <SectionHeader label="Approver" />
          <FieldRow icon={User} label="Approver Type" value={req.approverType?.replace('_', ' ')} valueClass="text-gray-700" />
          <FieldRow icon={User} label="Approver User ID" value={req.approverUserId} valueClass="text-gray-700 font-mono text-xs" />

          {/* Approval / Rejection Details */}
          {(req.approvedAt || req.approvedById) && (
            <>
              <SectionHeader label="Approval" />
              <FieldRow icon={CheckCircle2} label="Approved By ID" value={req.approvedById} valueClass="text-gray-700 font-mono text-xs" />
              <FieldRow icon={CheckCircle2} label="Approved On" value={fmt(req.approvedAt)} valueClass="text-green-700" />
              {req.approvedBy && (
                <div className="sm:col-span-2">
                  <FieldRow icon={CheckCircle2} label="Approved By" value={`${req.approvedBy.name} (${req.approvedBy.email})`} valueClass="text-green-700" />
                </div>
              )}
            </>
          )}

          {(req.rejectedAt || req.rejectedById) && (
            <>
              <SectionHeader label="Rejection" />
              <FieldRow icon={XCircle} label="Rejected By ID" value={req.rejectedById} valueClass="text-gray-700 font-mono text-xs" />
              <FieldRow icon={XCircle} label="Rejected On" value={fmt(req.rejectedAt)} valueClass="text-red-700" />
              {req.rejectedBy && (
                <div className="sm:col-span-2">
                  <FieldRow icon={XCircle} label="Rejected By" value={`${req.rejectedBy.name} (${req.rejectedBy.email})`} valueClass="text-red-700" />
                </div>
              )}
            </>
          )}

          {(req.withdrawnAt) && (
            <>
              <SectionHeader label="Withdrawn" />
              <FieldRow icon={RotateCcw} label="Withdrawn On" value={fmt(req.withdrawnAt)} valueClass="text-gray-600" />
            </>
          )}

          {(req.completedAt) && (
            <>
              <SectionHeader label="Completion" />
              <FieldRow icon={CheckCheck} label="Completed On" value={fmt(req.completedAt)} valueClass="text-green-700" />
            </>
          )}

          {/* Admin Remarks */}
          {req.adminRemarks && (
            <>
              <SectionHeader label="Admin Remarks" />
              <div className="sm:col-span-2">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">{req.adminRemarks}</p>
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <SectionHeader label="Timeline" />
          <FieldRow icon={Clock} label="Created At" value={fmt(req.createdAt)} />
          <FieldRow icon={Clock} label="Last Updated" value={fmt(req.updatedAt)} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Resignation</h1>
          <p className="text-gray-600 mt-1">
            {hasAnyRequest
              ? `You have ${myRequests.length} resignation request${myRequests.length > 1 ? 's' : ''} on record`
              : 'Submit and track your resignation requests'}
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMyResignations())}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
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
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 font-semibold transition-all ${activeTab === key ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'}`}
            >
              {key === 'submit'
                ? <><Plus className="w-4 h-4 inline mr-2" />Submit Request</>
                : <><FileText className="w-4 h-4 inline mr-2" />{label}</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submit Tab ── */}
      {activeTab === 'submit' && !hasAnyRequest && (
        <div className="max-w-2xl">
          {hasPendingRequest ? (
            <div className="p-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Pending Request Exists</h3>
              <p className="text-sm text-yellow-700">You already have a pending resignation request. You cannot submit a new one until it is processed.</p>
              <button
                onClick={() => setActiveTab('history')}
                className="mt-4 px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
              >
                View My Requests
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold">Submit Resignation Request</h2>
                <p className="text-sm text-gray-500 mt-1">Please provide your reason and optional last working date preference</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Reason for Resignation *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setFormError(''); }}
                    rows={4}
                    placeholder="Please explain your reason for resigning..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD] resize-none"
                  />
                  {formError && <p className="text-red-500 text-sm mt-1">{formError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Preferred Last Working Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={preferredLastWorkingDate}
                    onChange={(e) => setPreferredLastWorkingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                  <p className="text-xs text-gray-400 mt-1">The company will review and confirm your final working day</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Once submitted, your resignation will be sent to your approver for review. You can withdraw your request while it is still pending.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    <><LogOut className="w-5 h-5" /> Submit Resignation</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div>
          {listLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No resignation requests found</p>
              {!hasAnyRequest && (
                <button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 px-6 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition"
                >
                  Submit a Request
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(renderRequestCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
