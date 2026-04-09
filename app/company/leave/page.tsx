'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  Clock,
  Check,
  X,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  UserCheck,
  Users,
  Settings,
  Eye,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLeaveTypes,
  saveLeaveType,
  fetchLeaveRequests,
  fetchMyLeaveRequests,
  fetchLeaveBalances,
  applyForLeave,
  approveLeave,
  rejectLeave,
  clearLeaveError,
  clearLeaveSuccess,
  LeaveType,
  LeaveRequest,
  LeaveBalance,
} from '@/store/actions/leaveActions';

export default function LeavePage() {
  const dispatch = useAppDispatch();
  const {
    leaveTypes,
    leaveRequests,
    myRequests,
    leaveBalances,
    loading,
    submitting,
    approving,
    rejecting,
    error,
    successMessage,
  } = useAppSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'requests' | 'approvals' | 'balance' | 'config'>('overview');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarksRequestId, setRemarksRequestId] = useState<string | null>(null);
  const [remarksAction, setRemarksAction] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [medicalDocument, setMedicalDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Config form state
  const [configForm, setConfigForm] = useState<LeaveType>({
    name: '',
    typeCode: '',
    maxLimits: 0,
    attachmentRequired: false,
    priorNoticeDays: 0,
    allowHalfDay: true,
    sandwichLeaveAllowed: true,
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchLeaveTypes());
    dispatch(fetchLeaveRequests());
    dispatch(fetchMyLeaveRequests());
    dispatch(fetchLeaveBalances());
  }, [dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearLeaveError());
        dispatch(clearLeaveSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.leave-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showApplyForm, showConfigForm]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType) {
      alert('Please select a leave type');
      return;
    }

    // Check if attachment is required for this leave type
    const selectedLeaveType = leaveTypes.find(t => t.id === leaveType);
    if (selectedLeaveType?.attachmentRequired && !medicalDocument) {
      alert('Medical document is required for this leave type');
      return;
    }

    const result = await dispatch(applyForLeave({
      leaveTypeId: leaveType,
      startDate,
      endDate,
      reason,
      halfDay,
      attachment: medicalDocument,
    }));

    if (applyForLeave.fulfilled.match(result)) {
      setShowApplyForm(false);
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setHalfDay(false);
      setMedicalDocument(null);
      setDocumentPreview('');
      setActiveTab('requests');
      // Refresh data
      dispatch(fetchMyLeaveRequests());
      dispatch(fetchLeaveBalances());
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      setMedicalDocument(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview('PDF');
      }
    }
  };

  const handleRemoveDocument = () => {
    setMedicalDocument(null);
    setDocumentPreview('');
  };

  const handleOpenRemarksModal = (requestId: string, action: 'approve' | 'reject') => {
    setRemarksRequestId(requestId);
    setRemarksAction(action);
    setRemarks('');
    setShowRemarksModal(true);
  };

  const handleApproveReject = async () => {
    if (!remarksRequestId) return;

    if (remarksAction === 'approve') {
      const result = await dispatch(approveLeave({ requestId: remarksRequestId, remarks }));
      if (approveLeave.fulfilled.match(result)) {
        setShowRemarksModal(false);
        setRemarksRequestId(null);
        setRemarks('');
        dispatch(fetchLeaveRequests());
        dispatch(fetchLeaveBalances());
      }
    } else {
      if (!remarks.trim()) {
        alert('Rejection reason is required');
        return;
      }
      const result = await dispatch(rejectLeave({ requestId: remarksRequestId, remarks }));
      if (rejectLeave.fulfilled.match(result)) {
        setShowRemarksModal(false);
        setRemarksRequestId(null);
        setRemarks('');
        dispatch(fetchLeaveRequests());
        dispatch(fetchLeaveBalances());
      }
    }
  };

  const handleEditLeaveType = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    setConfigForm(leaveType);
    setShowConfigForm(true);
  };

  const handleSaveLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(saveLeaveType(configForm));
    setShowConfigForm(false);
    setEditingLeaveType(null);
    setConfigForm({
      name: '',
      typeCode: '',
      maxLimits: 0,
      attachmentRequired: false,
      priorNoticeDays: 0,
      allowHalfDay: true,
      sandwichLeaveAllowed: true,
    });
    dispatch(fetchLeaveTypes());
  };

  const handleAddNewLeaveType = () => {
    setEditingLeaveType(null);
    setConfigForm({
      name: '',
      typeCode: '',
      maxLimits: 0,
      attachmentRequired: false,
      priorNoticeDays: 0,
      allowHalfDay: true,
      sandwichLeaveAllowed: true,
    });
    setShowConfigForm(true);
  };

  const requiresAttachment = leaveTypes.find(t => t.id === leaveType)?.attachmentRequired || false;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'annual':
      case 'annual leave':
        return 'bg-blue-100 text-blue-700';
      case 'sick':
      case 'sick leave':
        return 'bg-red-100 text-red-700';
      case 'casual':
      case 'casual leave':
        return 'bg-yellow-100 text-yellow-700';
      case 'maternity':
      case 'paternity':
      case 'maternity/paternity':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter pending requests for approvals tab
  const pendingApprovals = leaveRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 leave-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Leave Management</h1>
            <p className="text-gray-600 mt-1">Apply and manage leave requests</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('config')}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configure
            </button>
            <button
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Apply for Leave
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearLeaveError())} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Apply Leave Form */}
        {showApplyForm && (
          <div className="mb-8 leave-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat'] flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Apply for Leave
                </h2>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="text-gray-600 hover:text-[#0445AD]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleApplyLeave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Duration</label>
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        required
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={halfDay}
                      onChange={(e) => setHalfDay(e.target.checked)}
                      className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                    />
                    <span className="text-sm font-semibold text-gray-700">Half Day</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                    placeholder="Please provide a reason for your leave request"
                    required
                  />
                </div>

                {/* Attachment for Sick/Maternity Leave */}
                {requiresAttachment && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Medical Document *
                      <span className="text-red-600 ml-1">(Required)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-black transition-colors">
                      {documentPreview ? (
                        <div className="relative">
                          {documentPreview === 'PDF' ? (
                            <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
                              <div className="text-center">
                                <FileText className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                <p className="font-semibold text-red-700">{medicalDocument?.name}</p>
                                <p className="text-sm text-red-600">PDF Document</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={documentPreview}
                              alt="Document preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveDocument}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            className="hidden"
                            id="medicalDocument"
                          />
                          <label
                            htmlFor="medicalDocument"
                            className="cursor-pointer inline-flex flex-col items-center"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <span className="text-sm font-semibold text-gray-600">
                              Click to upload medical document
                            </span>
                            <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Medical document is required for this leave type
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : (
                      <>
                        <FileText className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Configure Leave Types Form */}
        {showConfigForm && (
          <div className="mb-8 leave-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat'] flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  {editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
                </h2>
                <button
                  onClick={() => setShowConfigForm(false)}
                  className="text-gray-600 hover:text-[#0445AD]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveLeaveType} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Leave Type Name</label>
                    <input
                      type="text"
                      value={configForm.name}
                      onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., Annual Leave"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Type Code</label>
                    <input
                      type="text"
                      value={configForm.typeCode}
                      onChange={(e) => setConfigForm({ ...configForm, typeCode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., ANNUAL"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Limits (Days)</label>
                    <input
                      type="number"
                      value={configForm.maxLimits}
                      onChange={(e) => setConfigForm({ ...configForm, maxLimits: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prior Notice Days</label>
                    <input
                      type="number"
                      value={configForm.priorNoticeDays}
                      onChange={(e) => setConfigForm({ ...configForm, priorNoticeDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., 7"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.attachmentRequired}
                      onChange={(e) => setConfigForm({ ...configForm, attachmentRequired: e.target.checked })}
                      className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                    />
                    <span className="text-sm font-semibold text-gray-700">Attachment Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.allowHalfDay}
                      onChange={(e) => setConfigForm({ ...configForm, allowHalfDay: e.target.checked })}
                      className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                    />
                    <span className="text-sm font-semibold text-gray-700">Allow Half Day</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.sandwichLeaveAllowed}
                      onChange={(e) => setConfigForm({ ...configForm, sandwichLeaveAllowed: e.target.checked })}
                      className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                    />
                    <span className="text-sm font-semibold text-gray-700">Sandwich Leave Allowed</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Leave Type'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigForm(false)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 leave-item">
          <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Team Overview
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'balance'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Leave Balance
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingApprovals.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'config'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Leave Types
            </button>
          </div>
        </div>

        {/* Leave Balance */}
        {activeTab === 'balance' && (
          <div className="leave-item">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : leaveBalances.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No leave balances available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {leaveBalances.map((balance, index) => (
                  <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <CalendarDays className="w-12 h-12 text-[#0445AD]" />
                      <span className="text-sm text-gray-600">{balance.remainingDays} / {balance.totalDays} days</span>
                    </div>
                    <h3 className="text-lg font-bold mb-4 font-['Montserrat']">{balance.leaveTypeName}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used</span>
                        <span className="font-semibold">{balance.usedDays} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0445AD] h-2 rounded-full"
                          style={{ width: `${balance.totalDays > 0 ? (balance.usedDays / balance.totalDays) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining</span>
                        <span className="font-semibold text-green-600">{balance.remainingDays} days</span>
                      </div>
                      {balance.pendingDays > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pending</span>
                          <span className="font-semibold text-yellow-600">{balance.pendingDays} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests */}
        {activeTab === 'requests' && (
          <div className="leave-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by leave type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No leave requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Leave Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Days</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Reason</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests
                        .filter(r => (r.leaveTypeName || '').toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((request) => (
                          <tr key={request.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.leaveTypeName)}`}>
                                {request.leaveTypeName}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {formatDate(request.startDate)} to {formatDate(request.endDate)}
                            </td>
                            <td className="py-3 px-4 font-semibold">{request.days} days</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{request.reason}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                {formatStatus(request.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{formatDate(request.createdAt || '')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {activeTab === 'approvals' && (
          <div className="leave-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 mx-auto text-green-300 mb-3" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Leave Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Days</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Reason</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Applied On</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold">{request.employeeName}</p>
                              <p className="text-xs text-gray-500">{request.employeeEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.leaveTypeName)}`}>
                              {request.leaveTypeName}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(request.startDate)} to {formatDate(request.endDate)}
                          </td>
                          <td className="py-3 px-4 font-semibold">{request.days} days</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{request.reason}</td>
                          <td className="py-3 px-4 text-sm">{formatDate(request.createdAt || " ")}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenRemarksModal(request.id, 'approve')}
                                disabled={approving}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 flex items-center gap-1 disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenRemarksModal(request.id, 'reject')}
                                disabled={rejecting}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center gap-1 disabled:opacity-50"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </button>
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
        )}

        {/* Leave Types Configuration */}
        {activeTab === 'config' && (
          <div className="leave-item">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-['Montserrat']">Leave Type Configuration</h2>
              <button
                onClick={handleAddNewLeaveType}
                className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : leaveTypes.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No leave types configured</p>
                <button
                  onClick={handleAddNewLeaveType}
                  className="mt-4 px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                >
                  Add First Leave Type
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaveTypes.map((type) => (
                  <div key={type.id} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold font-['Montserrat']">{type.name}</h3>
                      <button
                        onClick={() => handleEditLeaveType(type)}
                        className="p-2 text-gray-400 hover:text-[#0445AD] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-semibold">{type.typeCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Limit:</span>
                        <span className="font-semibold">{type.maxLimits} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prior Notice:</span>
                        <span className="font-semibold">{type.priorNoticeDays} days</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                      {type.attachmentRequired && (
                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">Attachment Required</span>
                      )}
                      {type.allowHalfDay && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Half Day</span>
                      )}
                      {type.sandwichLeaveAllowed && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Sandwich</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Overview */}
        {activeTab === 'overview' && (
          <div className="leave-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leave Statistics */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat'] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Leave Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Requests This Month</span>
                    <span className="text-2xl font-bold">{leaveRequests.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-2xl font-bold text-green-600">
                      {leaveRequests.filter(r => r.status === 'APPROVED').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {leaveRequests.filter(r => r.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rejected</span>
                    <span className="text-2xl font-bold text-red-600">
                      {leaveRequests.filter(r => r.status === 'REJECTED').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Leave Requests */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat'] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Requests
                </h3>
                <div className="space-y-3">
                  {leaveRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {(request.employeeName || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{request.employeeName}</p>
                          <p className="text-xs text-gray-500">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {formatStatus(request.status)}
                      </span>
                    </div>
                  ))}
                  {leaveRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No leave requests yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {remarksAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h3>
              <button
                onClick={() => setShowRemarksModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                {remarksAction === 'approve' ? 'Approval Remarks' : 'Rejection Reason'} *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                placeholder={remarksAction === 'approve' ? 'Add any remarks (optional)' : 'Enter reason for rejection'}
                required={remarksAction === 'reject'}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApproveReject}
                disabled={remarksAction === 'reject' ? !remarks.trim() : false}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 ${
                  remarksAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {remarksAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button
                onClick={() => setShowRemarksModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
