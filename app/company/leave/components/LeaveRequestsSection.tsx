'use client';

import { useState } from 'react';
import { Search, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { LeaveRequest, LeaveType } from '@/store/actions/leaveActions';
import { Modal, Field, Spinner, EmptyState, Select } from './BaseComponents';
import RequestDetailDrawer from './RequestDetailDrawer';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
};

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const getInitials = (name: string) =>
  (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface Props {
  leaveRequests: LeaveRequest[];
  leaveTypes: LeaveType[];
  actionLoading: string | null;
  loading: boolean;
  search: string;
  statusFilter: string;
  typeFilter: string;
  setSearch: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
  onApprove: (id: string, remarks?: string) => void;
  onReject: (id: string, remarks?: string) => void;
}

export default function LeaveRequestsSection({
  leaveRequests, leaveTypes, actionLoading, loading, search, statusFilter, typeFilter,
  setSearch, setStatusFilter, setTypeFilter, onApprove, onReject,
}: Props) {
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const filtered = leaveRequests.filter((r) => {
    if (search && !(r.employeeName || r.user?.name || '').toLowerCase().includes(search.toLowerCase()) &&
        !(r.leaveType?.name || r.leaveTypeName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (typeFilter && r.leaveTypeId !== typeFilter) return false;
    return true;
  });

  const handleApprove = () => {
    if (showApproveModal) { onApprove(showApproveModal, remarks); setShowApproveModal(null); setRemarks(''); }
  };
  const handleReject = () => {
    if (showRejectModal) { onReject(showRejectModal, remarks); setShowRejectModal(null); setRemarks(''); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Requests</h2>
          <p className="text-sm text-gray-500">Review and manage employee leave requests</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or type..." className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="">All Status</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'PARTIALLY_APPROVED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-44">
          <option value="">All Types</option>
          {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No leave requests found" description="Adjust filters or wait for new requests" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Employee', 'Leave Type', 'Duration', 'Days', 'Status', 'Level', 'Applied', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(r.employeeName || r.user?.name || '')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{r.employeeName || r.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{r.employeeEmail || r.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{r.leaveType?.name || r.leaveTypeName || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{r.totalDays || 0}</td>
                  <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[r.status || '']}`}>{r.status}</span></td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">Level {r.currentApprovalLevel ?? 1}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">{formatDate(r.createdAt || '')}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setSelectedRequest(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => setShowApproveModal(r.id)} disabled={actionLoading !== null} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowRejectModal(r.id)} disabled={actionLoading !== null} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRequest && <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />}

      <Modal open={!!showApproveModal} onClose={() => setShowApproveModal(null)} title="Approve Leave Request" size="max-w-sm">
        <div className="space-y-4">
          <Field label="Remarks (Optional)">
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Add approval remarks..." />
          </Field>
          <div className="flex gap-3">
            <button onClick={handleApprove} disabled={actionLoading !== null} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition">
              {actionLoading === 'approving' ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />} Approve
            </button>
            <button onClick={() => setShowApproveModal(null)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showRejectModal} onClose={() => setShowRejectModal(null)} title="Reject Leave Request" size="max-w-sm">
        <div className="space-y-4">
          <Field label="Rejection Reason" required>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Reason for rejection is required" required />
          </Field>
          <div className="flex gap-3">
            <button onClick={handleReject} disabled={actionLoading !== null || !remarks.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition">
              {actionLoading === 'rejecting' ? <Spinner size="sm" /> : <XCircle className="w-4 h-4" />} Reject
            </button>
            <button onClick={() => setShowRejectModal(null)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
