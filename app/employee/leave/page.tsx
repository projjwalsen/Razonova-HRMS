'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  X,
  Search,
  RefreshCw,
  Clock,
  AlertCircle,
  Star,
  FileText,
  Download,
  Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLeaveTypes,
  fetchMyBalances,
  fetchMyRequests,
  applyForLeave,
  cancelLeaveRequest,
  fetchActiveHolidayCalendar,
  clearLeaveError,
  clearLeaveSuccess,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  HolidayCalendar,
  Holiday,
  LeaveRequestStatus,
  ApplyLeavePayload,
} from '@/store/actions/leaveActions';

interface User {
  id: string;
  name?: string;
  email?: string;
  roles?: string[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-600',
  PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  CANCELLED: <X className="w-4 h-4" />,
  PARTIALLY_APPROVED: <AlertCircle className="w-4 h-4" />,
};

const formatStatus = (status: string) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
};

const getUpcomingHolidays = (cal: HolidayCalendar | null): Holiday[] => {
  if (!cal?.holidays) return [];
  const today = new Date();
  return (cal.holidays as Holiday[])
    .filter((h) => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
};

export default function EmployeeLeavePage() {
  const dispatch = useAppDispatch();
  const {
    myBalances,
    myRequests,
    leaveTypes,
    activeHolidayCalendar,
    loading,
    submitting,
    error,
    successMessage,
  } = useAppSelector((s) => s.leave);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'balances' | 'requests' | 'holidays' | 'upcoming'>('balances');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestPage, setRequestPage] = useState(1);
  const requestsPerPage = 8;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply form
  const [applyForm, setApplyForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw) as User;
      setCurrentUser(u);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchLeaveTypes());
    dispatch(fetchMyBalances());
    dispatch(fetchMyRequests());
    dispatch(fetchActiveHolidayCalendar());
  }, [dispatch]);

  useEffect(() => {
    if (error) { setLocalError(error); dispatch(clearLeaveError()); }
    if (successMessage) { setLocalSuccess(successMessage); dispatch(clearLeaveSuccess()); }
  }, [error, successMessage, dispatch]);

  const handleApply = async () => {
    if (!applyForm.leaveTypeId || !applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      setLocalError('Please fill in all required fields');
      return;
    }
    setLocalError(null);
    const payload: ApplyLeavePayload = {
      leaveTypeId: applyForm.leaveTypeId,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      reason: applyForm.reason,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    const result = await dispatch(applyForLeave(payload));
    if (applyForLeave.fulfilled.match(result)) {
      setShowApplyModal(false);
      setApplyForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      setAttachments([]);
      dispatch(fetchMyBalances());
      dispatch(fetchMyRequests());
    }
  };

  const handleCancel = async () => {
    if (!cancelModalId) return;
    await dispatch(cancelLeaveRequest({ requestId: cancelModalId, reason: cancelReason }));
    setCancelModalId(null);
    setCancelReason('');
    dispatch(fetchMyBalances());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) { setLocalError('Maximum 5 attachments allowed'); return; }
    setAttachments(files);
  };

  const selectedType = leaveTypes.find((t) => t.id === applyForm.leaveTypeId);

  // Filter + pagination
  const filteredRequests = myRequests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return !term
      || (r.leaveTypeName || '').toLowerCase().includes(term)
      || (r.status || '').toLowerCase().includes(term);
  });
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / requestsPerPage));
  const paginatedRequests = filteredRequests.slice((requestPage - 1) * requestsPerPage, requestPage * requestsPerPage);

  // Days calculation
  const calcDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) return 0;
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const upcomingHolidays = getUpcomingHolidays(activeHolidayCalendar);
  const today = new Date();
  const upcomingLeaveRequests = myRequests.filter(
    (r) => r.status === 'APPROVED' && new Date(r.startDate) >= today
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Montserrat']">My Leave</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your leave balances and requests</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0445AD] hover:bg-[#033080] text-white rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Alerts */}
      {localError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{localError}</span>
          <button onClick={() => setLocalError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {localSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{localSuccess}</span>
          <button onClick={() => setLocalSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {([
            { key: 'balances', label: 'Leave Balances' },
            { key: 'requests', label: 'My Requests' },
            { key: 'upcoming', label: 'Upcoming Leave' },
            { key: 'holidays', label: 'Upcoming Holidays' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setRequestPage(1); setSearchTerm(''); }}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === key ? 'border-[#0445AD] text-[#0445AD]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : myBalances.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leave balances found</p>
              <p className="text-xs text-gray-400 mt-1">Leave balances will appear once your organization configures policies</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBalances.map((balance) => {
                  const allocated = balance.allocatedDays ?? balance.allocated ?? 0;
                  const used = balance.usedDays ?? balance.used ?? 0;
                  const remaining = balance.remainingDays ?? balance.available ?? 0;
                  const taken = balance.takenDays ?? 0;
                  const carriedForward = balance.carriedForwardDays ?? balance.carryForward ?? 0;
                  const name = balance.leaveType?.name || balance.leaveTypeName || balance.leaveTypeId;
                  const typeCode = balance.leaveType?.typeCode || balance.leaveTypeCode;
                  const pct = allocated > 0 ? Math.min(100, (used / allocated) * 100) : 0;
                  return (
                    <div key={balance.leaveTypeId} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
                          {typeCode && (
                            <p className="text-xs text-gray-400 mt-0.5">{typeCode}</p>
                          )}
                          {balance.year && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                              {balance.year}
                            </span>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-[#0445AD]/10 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#0445AD]" />
                        </div>
                      </div>

                      {/* Remaining Count */}
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-gray-900">{remaining}</span>
                        <span className="text-sm text-gray-400 ml-1">/ {allocated} days</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Used</span>
                          <span>{used} / {allocated}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0445AD] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Allocated', value: allocated },
                          { label: 'Taken', value: taken },
                          { label: 'Used', value: used },
                          { label: 'Carry Fwd', value: carriedForward },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-500">{label}</span>
                            <span className="text-xs font-bold text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { label: 'Allocated', value: myBalances.reduce((s, b) => s + (b.allocatedDays ?? b.allocated ?? 0), 0), color: 'text-blue-600' },
                    { label: 'Taken', value: myBalances.reduce((s, b) => s + (b.takenDays ?? 0), 0), color: 'text-purple-600' },
                    { label: 'Used', value: myBalances.reduce((s, b) => s + (b.usedDays ?? b.used ?? 0), 0), color: 'text-red-600' },
                    { label: 'Remaining', value: myBalances.reduce((s, b) => s + (b.remainingDays ?? b.available ?? 0), 0), color: 'text-green-600' },
                    { label: 'Carried Fwd', value: myBalances.reduce((s, b) => s + (b.carriedForwardDays ?? b.carryForward ?? 0), 0), color: 'text-orange-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Search + Count */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type or status..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setRequestPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as LeaveRequestStatus[]).map((s) => {
                const count = myRequests.filter((r) => r.status === s).length;
                return count > 0 ? (
                  <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[s] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_ICONS[s] || <Clock className="w-3 h-3" />}
                    {formatStatus(s)}: {count}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No leave requests found</p>
                <button onClick={() => setShowApplyModal(true)} className="mt-3 text-sm text-[#0445AD] font-semibold hover:underline">
                  Apply for Leave →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Leave Type', 'From', 'To', 'Days', 'Status', 'Applied On', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRequests.map((req) => {
                      const canCancel = req.status === 'PENDING' || req.status === 'PARTIALLY_APPROVED';
                      return (
                        <tr key={req.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{req.leaveType?.name || req.leaveTypeName || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{req.startDate ? new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{req.endDate ? new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-800">{req.totalDays}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${STATUS_COLORS[req.status || ''] || 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_ICONS[req.status || ''] || <Clock className="w-4 h-4" />}
                              {formatStatus(req.status || '')}
                            </span>
                          </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {req.remarks && (
                                <button title={req.remarks} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              )}
                              {req.attachmentUrls && req.attachmentUrls.length > 0 && (
                                <button title="View attachment" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                                  <FileText className="w-4 h-4" />
                                </button>
                              )}
                              {canCancel && (
                                <button
                                  onClick={() => setCancelModalId(req.id)}
                                  className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {Math.min((requestPage - 1) * requestsPerPage + 1, filteredRequests.length)}–{Math.min(requestPage * requestsPerPage, filteredRequests.length)} of {filteredRequests.length}
                </p>
                <div className="flex gap-1.5">
                  <button onClick={() => setRequestPage(Math.max(1, requestPage - 1))} disabled={requestPage === 1}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setRequestPage(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${p === requestPage ? 'bg-[#0445AD] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setRequestPage(Math.min(totalPages, requestPage + 1))} disabled={requestPage === totalPages}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Leave Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingLeaveRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming approved leave</p>
              <p className="text-xs text-gray-400 mt-1">Your upcoming approved leave will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLeaveRequests.map((req) => {
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">{req.leaveTypeName || 'Leave'}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' – '}
                          {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${daysUntil <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {daysUntil}d away
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Duration</p>
                        <p className="text-sm font-bold text-gray-800">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Status</p>
                        <p className={`text-xs font-bold ${
                          req.status === 'APPROVED' ? 'text-green-600' :
                          req.status === 'PARTIALLY_APPROVED' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {formatStatus(req.status || '')}
                        </p>
                      </div>
                    </div>
                    {req.reason && (
                      <p className="mt-3 text-xs text-gray-500 line-clamp-2">{req.reason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Holidays Tab */}
      {activeTab === 'holidays' && (
        <div className="space-y-4">
          {upcomingHolidays.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming holidays</p>
              <p className="text-xs text-gray-400 mt-1">Your organization has not configured a holiday calendar yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Holiday', 'Date', 'Day', 'Type'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {upcomingHolidays.map((h) => {
                      const d = new Date(h.date);
                      const isOptional = h.isOptional;
                      return (
                        <tr key={h.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{h.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                          <td className="py-3 px-4">
                            {isOptional ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Optional</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">Holiday</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {activeHolidayCalendar && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                  Calendar: <span className="font-semibold">{activeHolidayCalendar.name}</span>
                  {activeHolidayCalendar.country && ` • ${activeHolidayCalendar.country}`}
                  {activeHolidayCalendar.year && ` • ${activeHolidayCalendar.year}`}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Apply Leave Modal ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Apply for Leave</h2>
                <p className="text-xs text-gray-400 mt-0.5">Submit a new leave request</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.typeCode})
                    </option>
                  ))}
                </select>
                {/* Balance info */}
                {applyForm.leaveTypeId && (() => {
                  const bal = myBalances.find((b) => b.leaveTypeId === applyForm.leaveTypeId);
                  const remaining = bal?.remainingDays ?? bal?.available ?? 0;
                  const pending = bal?.pending ?? 0;
                  return bal ? (
                    <p className="text-xs text-green-600 mt-1.5 font-medium">
                      Remaining: {remaining} days &nbsp;|&nbsp; Pending: {pending} days &nbsp;|&nbsp; Allocated: {bal.allocatedDays} days
                    </p>
                  ) : null;
                })()}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={applyForm.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value, endDate: e.target.value >= (applyForm.endDate || e.target.value) ? applyForm.endDate : e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={applyForm.endDate}
                    min={applyForm.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
              </div>

              {/* Days Summary */}
              {applyForm.startDate && applyForm.endDate && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm text-blue-700">
                    <span className="font-semibold">{calcDays()}</span> day(s) selected
                    {applyForm.startDate === applyForm.endDate ? ' (same day)' : ''}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD] resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Attachments <span className="text-xs font-normal text-gray-400">(optional, max 5)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#0445AD] hover:text-[#0445AD] transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'Click to attach files'}
                </button>
                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {attachments.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate">{f.name}</span>
                        <span className="text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                        <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={submitting || !applyForm.leaveTypeId || !applyForm.startDate || !applyForm.endDate || !applyForm.reason}
                className="px-6 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Cancel Leave Request</h2>
              <button onClick={() => setCancelModalId(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-3">Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Optional reason..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD] resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setCancelModalId(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Keep Request
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
