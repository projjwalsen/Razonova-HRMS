'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  Check,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Globe,
  Info,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Wallet,
  Users,
  X,
  XCircle,
  AlertCircle,
  Layers,
  Briefcase,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAccess } from '@/lib/access';
import { Modal, Field, Input, Select, Toggle, Badge, EmptyState, Spinner, STATUS_COLORS, formatDate, formatDateInput, getInitials } from './components/BaseComponents';
import LeaveRequestsSectionComponent from './components/LeaveRequestsSection';
import RequestDetailDrawerComponent from './components/RequestDetailDrawer';
import {
  // Leave Types
  fetchLeaveTypes,
  createLeaveType,
  // Leave Policies
  fetchLeavePolicies,
  createLeavePolicy,
  // Approval Policies
  fetchApprovalPolicies,
  createApprovalPolicy,
  // Holiday Calendars
  fetchHolidayCalendars,
  fetchActiveHolidayCalendar,
  createHolidayCalendar,
  createHoliday,
  deleteHoliday,
  setSelectedCalendar,
  addHolidayToCalendar,
  // Work Week
  fetchWorkWeek,
  updateWorkWeek,
  // Apply Leave
  applyForLeave,
  // My Leave
  fetchMyBalances,
  fetchMyRequests,
  cancelLeaveRequest,
  // Admin requests
  fetchLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  // User Options
  fetchUserSelectOptions,
  applyLeaveOnBehalf,
  // State
  clearLeaveError,
  clearLeaveSuccess,
  // Types
  LeaveType,
  LeavePolicy,
  ApprovalPolicy,
  HolidayCalendar,
  LeaveRequest,
  LeaveBalance,
  LeaveTypeCode,
  EmploymentType,
  LeaveApproverType,
  HolidayRegionType,
  WorkingDay,
  PolicyRule,
  ApprovalLevel,
  Holiday,
  UserSelectOption,
} from '@/store/actions/leaveActions';

type Section = 'dashboard' | 'balances' | 'types' | 'policies' | 'approval' | 'calendars' | 'workweek' | 'myleave' | 'requests';

const TYPE_CODE_OPTIONS: { value: LeaveTypeCode; label: string }[] = [
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'EARNED', label: 'Earned Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave' },
];

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'TRAINEE', label: 'Trainee' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'OTHER', label: 'Other' },
];

const APPROVER_TYPE_OPTIONS: { value: LeaveApproverType; label: string }[] = [
  { value: 'REPORTING_MANAGER', label: 'Reporting Manager' },
  { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'SPECIFIC_USER', label: 'Specific User' },
  { value: 'ROLE', label: 'By Role' },
];

const REGION_TYPE_OPTIONS: { value: HolidayRegionType; label: string }[] = [
  { value: 'GLOBAL', label: 'Global' },
  { value: 'COUNTRY', label: 'Country' },
  { value: 'STATE', label: 'State' },
  { value: 'CITY', label: 'City' },
  { value: 'CUSTOM', label: 'Custom' },
];

const ALL_DAYS: WorkingDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS: Record<WorkingDay, string> = {
  SUNDAY: 'Sun', MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat',
};

const COUNTRIES = [
  { code: 'IN', name: 'India' }, { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' }, { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' }, { code: 'JP', name: 'Japan' },
];

// ===== DASHBOARD SECTION =====
export default function LeavePage() {
  const dispatch = useAppDispatch();
  const {
    leaveTypes, leavePolicies, approvalPolicies, holidayCalendars,
    activeHolidayCalendar, workWeek, leaveRequests, myRequests, myBalances,
    loading, submitting, actionLoading, error, successMessage,
  } = useAppSelector((s) => s.leave);

  const [section, setSection] = useState<Section>('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // User info from localStorage
  const [currentUser, setCurrentUser] = useState<{ id?: string; roles?: string[] }>({});
  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}
  }, []);

  const isAdmin = currentUser.roles?.some((r) =>
    ['COMPANY_ADMIN', 'HR_ADMIN', 'ADMIN'].includes(r.toUpperCase())
  );
  const { hasPermission } = useAccess();

  // Fetch all admin data
  const fetchAdminData = useCallback(() => {
    dispatch(fetchLeaveTypes());
    dispatch(fetchLeavePolicies());
    dispatch(fetchApprovalPolicies());
    dispatch(fetchHolidayCalendars());
    dispatch(fetchWorkWeek());
    dispatch(fetchLeaveRequests());
    dispatch(fetchMyBalances());
  }, [dispatch]);

  // Fetch employee data
  const fetchEmployeeData = useCallback(() => {
    dispatch(fetchMyBalances());
    dispatch(fetchMyRequests());
    dispatch(fetchActiveHolidayCalendar());
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
      fetchEmployeeData();
    } else {
      fetchEmployeeData();
    }
  }, [isAdmin, fetchAdminData, fetchEmployeeData]);

  // Clear messages
  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(() => {
        dispatch(clearLeaveError());
        dispatch(clearLeaveSuccess());
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error, dispatch]);

  const toast = (msg: string, type: 'success' | 'error') => (
    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border flex items-center gap-2 ${
      type === 'success'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
      <button onClick={() => dispatch(clearLeaveError())} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
    </div>
  );

  // ===== SECTION NAVIGATION =====
  const sections: { key: Section; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'balances', label: 'Leave Balance', icon: Wallet },
    { key: 'myleave', label: 'My Leave', icon: CalendarCheck },
    { key: 'types', label: 'Leave Types', icon: Layers, adminOnly: true },
    { key: 'policies', label: 'Leave Policies', icon: Briefcase, adminOnly: true },
    { key: 'approval', label: 'Approval Policies', icon: Shield, adminOnly: true },
    { key: 'calendars', label: 'Holiday Calendars', icon: Globe, adminOnly: true },
    { key: 'workweek', label: 'Work Week', icon: CalendarDays, adminOnly: true },
    { key: 'requests', label: 'Leave Requests', icon: FileText, adminOnly: true },
  ];

  const visibleSections = sections.filter((s) => !s.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gray-50/50 mt-5">
      {/* Top Bar */}
      <div className=" px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage leave policies, requests, and approvals</p>
          </div>
          <button
            onClick={() => {
              if (isAdmin) fetchAdminData(); else fetchEmployeeData();
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {visibleSections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                section === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Toasts */}
        {successMessage && toast(successMessage, 'success')}
        {error && toast(error, 'error')}

        {!hasPermission('LEAVE:READ') && (
          <div className="p-8 text-center">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">You do not have permission to access Leave Management</p>
            </div>
          </div>
        )}

        {section === 'dashboard' && <DashboardSection {...{ leaveRequests, leaveTypes, leavePolicies, holidayCalendars, myBalances, isAdmin: !!isAdmin, pendingCount: leaveRequests.filter((r) => r.status === 'PENDING').length, onApply: () => setSection('myleave') }} />}
        {section === 'balances' && <LeaveBalancesSection myBalances={myBalances} loading={loading} />}
        {section === 'types' && isAdmin && hasPermission('LEAVE_TYPE:MANAGE') && <LeaveTypesSection />}
        {section === 'policies' && isAdmin && hasPermission('LEAVE_POLICY:MANAGE') && <LeavePoliciesSection leaveTypes={leaveTypes} />}
        {section === 'approval' && isAdmin && hasPermission('LEAVE_APPROVAL_POLICY:MANAGE') && <ApprovalPoliciesSection leavePolicies={leavePolicies} leaveTypes={leaveTypes} />}
        {section === 'calendars' && isAdmin && hasPermission('HOLIDAY_CALENDAR:MANAGE') && <HolidayCalendarsSection />}
        {section === 'workweek' && isAdmin && hasPermission('WORK_WEEK:MANAGE') && <WorkWeekSection />}
        {section === 'myleave' && <MyLeaveSection
          myBalances={myBalances}
          myRequests={myRequests}
          leaveTypes={leaveTypes}
          activeHolidayCalendar={activeHolidayCalendar}
          submitting={submitting}
          actionLoading={actionLoading}
          onApply={(p) => dispatch(applyForLeave(p))}
          onCancel={(id, reason) => dispatch(cancelLeaveRequest({ requestId: id, reason }))}
          loading={loading}
          dispatch={dispatch}
        />}
        {section === 'requests' && isAdmin && hasPermission('LEAVE:APPROVE') && <LeaveRequestsSectionComponent
          leaveRequests={leaveRequests}
          leaveTypes={leaveTypes}
          actionLoading={actionLoading}
          loading={loading}
          search={search}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setTypeFilter={setTypeFilter}
          onApprove={(id, remarks) => dispatch(approveLeaveRequest({ requestId: id, remarks }))}
          onReject={(id, remarks) => dispatch(rejectLeaveRequest({ requestId: id, remarks }))}
        />}
      </div>
    </div>
  );
}

// ===== DASHBOARD SECTION =====
function DashboardSection({ leaveRequests, leaveTypes, leavePolicies, holidayCalendars, myBalances, isAdmin, pendingCount, onApply }: {
  leaveRequests: LeaveRequest[]; leaveTypes: LeaveType[]; leavePolicies: LeavePolicy[];
  holidayCalendars: HolidayCalendar[]; myBalances: LeaveBalance[]; isAdmin: boolean;
  pendingCount: number; onApply: () => void;
}) {
  const approved = leaveRequests.filter((r) => r.status === 'APPROVED').length;
  const rejected = leaveRequests.filter((r) => r.status === 'REJECTED').length;
  const cancelled = leaveRequests.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Overview</h2>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Organization leave summary and quick actions' : 'Your leave summary and quick actions'}
          </p>
        </div>
        <button onClick={onApply} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Balance Cards (Employee) */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myBalances.slice(0, 4).map((b) => (
            <div key={b.leaveTypeId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{b.leaveType?.name || b.leaveTypeName}</span>
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{b.available}</div>
              <p className="text-xs text-gray-400">days available</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(b.allocatedDays ?? b.allocated ?? 0) > 0 ? Math.round(((b.usedDays ?? b.used ?? 0) / (b.allocatedDays ?? b.allocated ?? 0)) * 100) : 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>{b.usedDays ?? b.used ?? 0} used</span>
                <span>{b.allocatedDays ?? b.allocated ?? 0} total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Requests', value: leaveRequests.length, color: 'text-gray-700', bg: 'bg-white' },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'dot-yellow' },
            { label: 'Approved', value: approved, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Rejected', value: rejected, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Leave Types', value: leaveTypes.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Policies', value: leavePolicies.length, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4 text-center`}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Leave Requests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {leaveRequests.slice(0, 6).map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(r.employeeName || r.user?.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.employeeName || r.user?.name || '—'}</p>
                  <p className="text-xs text-gray-400">{r.leaveType?.name || r.leaveTypeName} · {formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[r.status || '']}`}>
                  {r.status}
                </span>
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">No leave requests found</div>
            )}
          </div>
        </div>

        {/* Quick Admin Actions */}
        {isAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Quick Actions</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Create Leave Type', icon: Layers, section: 'types' },
                { label: 'Create Leave Policy', icon: Briefcase, section: 'policies' },
                { label: 'Create Approval Policy', icon: Shield, section: 'approval' },
                { label: 'Holiday Calendar', icon: Globe, section: 'calendars' },
              ].map(({ label, icon: Icon }) => (
                <button key={label} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-sm font-medium text-gray-700 transition">
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Holidays (Employee) */}
        {!isAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Upcoming Holidays</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {holidayCalendars.flatMap((c) => (c.holidays || []).map((h) => ({ ...h, calName: c.name })))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((h) => (
                  <div key={h.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      {new Date(h.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                      <p className="text-xs text-gray-400">{new Date(h.date).toLocaleString('default', { month: 'long' })} · {h.calName}</p>
                    </div>
                    {h.isOptional && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>}
                  </div>
                ))}
              {holidayCalendars.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">No holidays configured</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== LEAVE BALANCES SECTION =====
function LeaveBalancesSection({ myBalances, loading }: { myBalances: LeaveBalance[]; loading: boolean }) {
  const dispatch = useAppDispatch();
  const totalAllocated = myBalances.reduce((s, b) => s + (b.allocatedDays ?? b.allocated ?? 0), 0);
  const totalUsed = myBalances.reduce((s, b) => s + (b.usedDays ?? b.used ?? 0), 0);
  const totalAvailable = myBalances.reduce((s, b) => s + (b.remainingDays ?? b.available ?? 0), 0);
  const totalTaken = myBalances.reduce((s, b) => s + (b.takenDays ?? 0), 0);
  const totalCarryFwd = myBalances.reduce((s, b) => s + (b.carriedForwardDays ?? b.carryForward ?? 0), 0);

  const BALANCE_COLORS = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Balance</h2>
          <p className="text-sm text-gray-500">Your current leave balances and usage summary</p>
        </div>
        <button
          onClick={() => {
            dispatch(fetchMyBalances());
            dispatch(fetchLeaveTypes());
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Allocated', value: totalAllocated, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Taken', value: totalTaken, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Used', value: totalUsed, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Remaining', value: totalAvailable, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Carried Forward', value: totalCarryFwd, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-transparent p-4 text-center`}>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Year Banner */}
      {myBalances[0]?.year && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <Calendar className="w-4 h-4" />
          <span className="font-semibold">Year:</span>
          <span>{myBalances[0].year}</span>
        </div>
      )}

      {/* Balance Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : myBalances.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No leave balances found</p>
          <p className="text-xs text-gray-400 mt-1">Leave balances will appear once your organization configures policies</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBalances.map((b, idx) => {
            const allocated = b.allocatedDays ?? b.allocated ?? 0;
            const used = b.usedDays ?? b.used ?? 0;
            const remaining = b.remainingDays ?? b.available ?? 0;
            const taken = b.takenDays ?? 0;
            const carriedForward = b.carriedForwardDays ?? b.carryForward ?? 0;
            const pct = allocated > 0 ? Math.min(100, (used / allocated) * 100) : 0;
            const color = BALANCE_COLORS[idx % BALANCE_COLORS.length];
            const name = b.leaveType?.name || b.leaveTypeName || '—';
            const typeCode = b.leaveType?.typeCode || b.leaveTypeCode;
            return (
              <div key={b.leaveTypeId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    {typeCode && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                        {typeCode}
                      </span>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Remaining Count */}
                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">{remaining}</span>
                  <span className="text-sm text-gray-400 ml-1">/ {allocated} days</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
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
      )}
    </div>
  );
}

// ===== LEAVE TYPES SECTION =====
function LeaveTypesSection() {
  const dispatch = useAppDispatch();
  const { leaveTypes, loading, submitting } = useAppSelector((s) => s.leave);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LeaveType | null>(null);
  const [form, setForm] = useState({ name: '', typeCode: 'CASUAL' as LeaveTypeCode, isActive: true });

  const openCreate = () => { setEditItem(null); setForm({ name: '', typeCode: 'CASUAL', isActive: true }); setShowModal(true); };
  const openEdit = (t: LeaveType) => { setEditItem(t); setForm({ name: t.name, typeCode: t.typeCode, isActive: t.isActive ?? true }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, ...(editItem?.id && { id: editItem.id }) };
    const result = await dispatch(createLeaveType(payload as Partial<LeaveType>));
    if (createLeaveType.fulfilled.match(result)) { setShowModal(false); dispatch(fetchLeaveTypes()); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Types</h2>
          <p className="text-sm text-gray-500">Define and manage leave categories for your organization</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Leave Type
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : leaveTypes.length === 0 ? (
        <EmptyState icon={Layers} title="No leave types yet" description="Create leave types to define available leave categories" action={{ label: 'Add Leave Type', onClick: openCreate }} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Type Code', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leaveTypes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{t.name}</td>
                  <td className="px-5 py-3.5"><Badge color="bg-blue-50 text-blue-700">{t.typeCode}</Badge></td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(t.createdAt || '')}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Leave Type' : 'Create Leave Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Leave Type Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Annual Leave" required />
          </Field>
          <Field label="Type Code" required>
            <Select value={form.typeCode} onChange={(e) => setForm({ ...form, typeCode: e.target.value as LeaveTypeCode })}>
              {TYPE_CODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
              {editItem ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ===== LEAVE POLICIES SECTION =====
function LeavePoliciesSection({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const dispatch = useAppDispatch();
  const { leavePolicies, loading, submitting } = useAppSelector((s) => s.leave);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LeavePolicy | null>(null);
  const [detailPolicy, setDetailPolicy] = useState<LeavePolicy | null>(null);
  const [form, setForm] = useState({
    name: '', employmentType: 'FULL_TIME' as EmploymentType, probationMonths: 0, isActive: true,
  });
  const [rules, setRules] = useState<PolicyRule[]>([]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', employmentType: 'FULL_TIME', probationMonths: 0, isActive: true });
    setRules([{
      leaveTypeId: '', annualAllocation: 12, maxPerRequest: 3, maxPerYear: 12, maxConsecutiveDays: 5,
      allowDuringProbation: true, attachmentRequired: false, priorNoticeDays: 1, sandwichLeaveAllowed: false,
      countMode: 'WORKING_DAYS', isPaid: true, carryForwardAllowed: false, carryForwardLimit: 0,
      accrualFrequency: 'MONTHLY', accrualAmount: 1,
    }]);
    setShowModal(true);
  };

  const openEdit = (p: LeavePolicy) => {
    setEditItem(p);
    setForm({
      name: p.name,
      employmentType: p.employmentType,
      probationMonths: p.probationMonths,
      isActive: p.isActive ?? true,
    });
    const rulesToSet = (p.rules ?? []).map((r) => ({
      ...r,
      leaveTypeName: r.leaveType?.name ?? r.leaveTypeName ?? '',
    }));
    setRules(rulesToSet.length > 0 ? rulesToSet : [{
      leaveTypeId: '', annualAllocation: 0, maxPerRequest: 0, maxPerYear: 0, maxConsecutiveDays: 0,
      allowDuringProbation: true, attachmentRequired: false, priorNoticeDays: 0, sandwichLeaveAllowed: false,
      countMode: 'WORKING_DAYS', isPaid: true, carryForwardAllowed: false, carryForwardLimit: 0,
      accrualFrequency: 'MONTHLY', accrualAmount: 0,
    }]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRules = rules.filter((r) => r.leaveTypeId);
    const payload = { ...form, rules: validRules, ...(editItem?.id && { id: editItem.id }) };
    const result = await dispatch(createLeavePolicy(payload as Partial<LeavePolicy>));
    if (createLeavePolicy.fulfilled.match(result)) { setShowModal(false); dispatch(fetchLeavePolicies()); }
  };

  const updateRule = (idx: number, patch: Partial<PolicyRule>) => {
    setRules((prev) => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };

  const addRule = () => {
    setRules((prev) => [...prev, {
      leaveTypeId: '', annualAllocation: 0, maxPerRequest: 0, maxPerYear: 0, maxConsecutiveDays: 0,
      allowDuringProbation: true, attachmentRequired: false, priorNoticeDays: 0, sandwichLeaveAllowed: false,
      countMode: 'WORKING_DAYS', isPaid: true, carryForwardAllowed: false, carryForwardLimit: 0,
      accrualFrequency: 'MONTHLY', accrualAmount: 0,
    }]);
  };

  const removeRule = (idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leave Policies</h2>
          <p className="text-sm text-gray-500">Configure leave allocation and accrual rules</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : leavePolicies.length === 0 ? (
        <EmptyState icon={Briefcase} title="No leave policies" description="Create policies to manage leave allocations" action={{ label: 'Create Policy', onClick: openCreate }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leavePolicies.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer" onClick={() => setDetailPolicy(p)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <span className="text-xs text-gray-400">{p.employmentType} · {p.probationMonths}mo probation</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Layers className="w-3.5 h-3.5" /> {p.rules?.length || 0} rule{p.rules?.length !== 1 ? 's' : ''}
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
              </div>
              {p.rules && p.rules.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.rules.map((r) => (
                    <span key={r.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {r.leaveType?.name || r.leaveTypeName || '—'} · {r.annualAllocation}d
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Leave Policy' : 'Create Leave Policy'} size="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Policy Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Time Policy" required /></Field>
            <Field label="Employment Type" required>
              <Select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}>
                {EMPLOYMENT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
            <Field label="Probation (months)"><Input type="number" min={0} value={form.probationMonths} onChange={(e) => setForm({ ...form, probationMonths: +e.target.value })} /></Field>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Policy Rules</h4>
              <button type="button" onClick={addRule} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Rule
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  {/* Rule Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">Rule {idx + 1}</span>
                    </div>
                    <button type="button" onClick={() => removeRule(idx)} className="text-red-400 hover:text-red-600 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-5">
                    {/* Section 1: Basic Allocation */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Basic Allocation</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Field label="Leave Type" required>
                          <Select value={rule.leaveTypeId} onChange={(e) => updateRule(idx, { leaveTypeId: e.target.value })}>
                            <option value="">Select</option>
                            {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </Select>
                        </Field>
                        <Field label="Annual Allocation">
                          <Input type="number" min={0} value={rule.annualAllocation} onChange={(e) => {
                            const v = +e.target.value;
                            updateRule(idx, { annualAllocation: v, maxPerYear: v });
                          }} />
                        </Field>
                        <Field label="Max Per Request">
                          <Input type="number" min={0} value={rule.maxPerRequest} onChange={(e) => updateRule(idx, { maxPerRequest: +e.target.value })} />
                        </Field>
                        <Field label="Max Consecutive Days">
                          <Input type="number" min={0} value={rule.maxConsecutiveDays} onChange={(e) => updateRule(idx, { maxConsecutiveDays: +e.target.value })} />
                        </Field>
                      </div>
                    </div>

                    {/* Section 2: Leave Counting */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Leave Counting</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Count Mode">
                          <Select value={rule.countMode} onChange={(e) => updateRule(idx, { countMode: e.target.value as 'CALENDAR_DAYS' | 'WORKING_DAYS' })}>
                            <option value="WORKING_DAYS">Working Days</option>
                            <option value="CALENDAR_DAYS">Calendar Days</option>
                          </Select>
                        </Field>
                        <Field label="Is Paid">
                          <div className="flex items-center gap-3 h-full">
                            <Toggle checked={rule.isPaid} onChange={(v) => updateRule(idx, { isPaid: v })} />
                            <span className="text-sm text-gray-700">{rule.isPaid ? 'Paid' : 'Unpaid'}</span>
                          </div>
                        </Field>
                        <Field label="Sandwich Leave Allowed">
                          <div className="flex items-center gap-3 h-full">
                            <Toggle checked={rule.sandwichLeaveAllowed} onChange={(v) => updateRule(idx, { sandwichLeaveAllowed: v })} />
                            <span className="text-sm text-gray-700">{rule.sandwichLeaveAllowed ? 'Allowed' : 'Not Allowed'}</span>
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* Section 3: Probation & Notice */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Probation &amp; Notice</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Allow During Probation">
                          <div className="flex items-center gap-3 h-full">
                            <Toggle checked={rule.allowDuringProbation} onChange={(v) => updateRule(idx, { allowDuringProbation: v })} />
                            <span className="text-sm text-gray-700">{rule.allowDuringProbation ? 'Allowed' : 'Not Allowed'}</span>
                          </div>
                        </Field>
                        <Field label="Prior Notice (Days)">
                          <Input type="number" min={0} value={rule.priorNoticeDays} onChange={(e) => updateRule(idx, { priorNoticeDays: +e.target.value })} />
                        </Field>
                        <Field label="Attachment Required">
                          <div className="flex items-center gap-3 h-full">
                            <Toggle checked={rule.attachmentRequired} onChange={(v) => updateRule(idx, { attachmentRequired: v })} />
                            <span className="text-sm text-gray-700">{rule.attachmentRequired ? 'Required' : 'Not Required'}</span>
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* Section 4: Carry Forward & Accrual */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Carry Forward &amp; Accrual</p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <Field label="Carry Forward Allowed">
                          <div className="flex items-center gap-3 h-full">
                            <Toggle checked={rule.carryForwardAllowed} onChange={(v) => updateRule(idx, { carryForwardAllowed: v })} />
                            <span className="text-sm text-gray-700">{rule.carryForwardAllowed ? 'Yes' : 'No'}</span>
                          </div>
                        </Field>
                        <Field label="Carry Forward Limit">
                          <Input type="number" min={0} value={rule.carryForwardLimit} onChange={(e) => updateRule(idx, { carryForwardLimit: +e.target.value })} />
                        </Field>
                        <Field label="Accrual Frequency">
                          <Select value={rule.accrualFrequency} onChange={(e) => updateRule(idx, { accrualFrequency: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' })}>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="YEARLY">Yearly</option>
                          </Select>
                        </Field>
                        <Field label="Accrual Amount (Days)">
                          <Input type="number" min={0} value={rule.accrualAmount} onChange={(e) => updateRule(idx, { accrualAmount: +e.target.value })} />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !form.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} {editItem ? 'Update Policy' : 'Create Policy'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Policy Detail Modal */}
      <PolicyDetailModal policy={detailPolicy} onClose={() => setDetailPolicy(null)} onEdit={() => { if (detailPolicy) { openEdit(detailPolicy); setDetailPolicy(null); } }} />
    </div>
  );
}

// ===== POLICY DETAIL MODAL =====
function PolicyDetailModal({ policy, onClose, onEdit }: { policy: LeavePolicy | null; onClose: () => void; onEdit: () => void }) {
  if (!policy) return null;

  const BoolBadge = ({ value }: { value: boolean }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {value ? 'Yes' : 'No'}
    </span>
  );

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{policy.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {policy.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">Policy Details</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
              Edit Policy
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Policy Overview */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Policy Overview</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Policy Name', value: policy.name },
                { label: 'Employment Type', value: policy.employmentType.replace('_', ' ') },
                { label: 'Probation (Months)', value: policy.probationMonths },
                { label: 'Total Rules', value: policy.rules?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-900">{fmt(policy.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Updated At</p>
                <p className="text-sm font-semibold text-gray-900">{fmt(policy.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Rules */}
          {(policy.rules ?? []).length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No rules configured</div>
          ) : (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Rules ({policy.rules?.length})</p>
              <div className="space-y-4">
                {policy.rules?.map((rule, idx) => (
                  <div key={rule.id || idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {/* Rule Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {rule.leaveType?.name || rule.leaveTypeName || '—'}
                      </span>
                      <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {rule.leaveType?.typeCode || '—'}
                      </span>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Basic Allocation */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Basic Allocation</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Annual Alloc.</p>
                            <p className="text-sm font-bold text-gray-900">{rule.annualAllocation} days</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Max/Request</p>
                            <p className="text-sm font-bold text-gray-900">{rule.maxPerRequest} days</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Max/Year</p>
                            <p className="text-sm font-bold text-gray-900">{rule.maxPerYear} days</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Max Consecutive</p>
                            <p className="text-sm font-bold text-gray-900">{rule.maxConsecutiveDays} days</p>
                          </div>
                        </div>
                      </div>

                      {/* Leave Counting */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Leave Counting</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Count Mode</span>
                            <span className="text-xs font-semibold text-gray-800">{rule.countMode === 'WORKING_DAYS' ? 'Working Days' : 'Calendar Days'}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Is Paid</span>
                            <BoolBadge value={rule.isPaid} />
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Sandwich Leave</span>
                            <BoolBadge value={rule.sandwichLeaveAllowed} />
                          </div>
                        </div>
                      </div>

                      {/* Probation & Notice */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Probation &amp; Notice</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Allow During Probation</span>
                            <BoolBadge value={rule.allowDuringProbation} />
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Prior Notice</span>
                            <span className="text-xs font-semibold text-gray-800">{rule.priorNoticeDays} day{rule.priorNoticeDays !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Attachment Required</span>
                            <BoolBadge value={rule.attachmentRequired} />
                          </div>
                        </div>
                      </div>

                      {/* Carry Forward & Accrual */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Carry Forward &amp; Accrual</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                            <span className="text-xs text-gray-500">Carry Fwd Allowed</span>
                            <BoolBadge value={rule.carryForwardAllowed} />
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Carry Fwd Limit</p>
                            <p className="text-sm font-bold text-gray-900">{rule.carryForwardLimit} days</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Accrual Freq.</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{rule.accrualFrequency.toLowerCase()}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Accrual Amount</p>
                            <p className="text-sm font-bold text-gray-900">{rule.accrualAmount} days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== APPROVAL POLICIES SECTION =====
function ApprovalPoliciesSection({ leavePolicies, leaveTypes }: { leavePolicies: LeavePolicy[]; leaveTypes: LeaveType[] }) {
  const dispatch = useAppDispatch();
  const { approvalPolicies, loading, submitting } = useAppSelector((s) => s.leave);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ApprovalPolicy | null>(null);
  const [detailPolicy, setDetailPolicy] = useState<ApprovalPolicy | null>(null);
  const [userOptions, setUserOptions] = useState<UserSelectOption[]>([]);
  const [form, setForm] = useState({
    name: '', leavePolicyId: '', leaveTypeId: '', isActive: true,
  });
  const [approvalCount, setApprovalCount] = useState(1);
  const [minApprovals, setMinApprovals] = useState(1);
  const [approvers, setApprovers] = useState<ApprovalLevel[]>([
    { level: 1, approverType: 'REPORTING_MANAGER', minApprovals: 1 },
  ]);

  const fetchUsers = useCallback(() => {
    dispatch(fetchUserSelectOptions()).then((result) => {
      if (fetchUserSelectOptions.fulfilled.match(result)) {
        setUserOptions(result.payload);
      }
    });
  }, [dispatch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', leavePolicyId: '', leaveTypeId: '', isActive: true });
    setApprovalCount(1);
    setMinApprovals(1);
    setApprovers([{ level: 1, approverType: 'REPORTING_MANAGER', minApprovals: 1 }]);
    fetchUsers();
    setShowModal(true);
  };

  const openEdit = (p: ApprovalPolicy) => {
    setEditItem(p);
    setForm({
      name: p.name,
      leavePolicyId: p.leavePolicyId || '',
      leaveTypeId: p.leaveTypeId || '',
      isActive: p.isActive ?? true,
    });
    const lvlCount = p.levels?.length || 1;
    setApprovalCount(lvlCount);
    setMinApprovals(p.levels?.[0]?.minApprovals || 1);
    const loadedApprovers: ApprovalLevel[] = (p.levels ?? []).map((l) => ({
      ...l,
      approverType: l.approverType,
      minApprovals: l.minApprovals,
    }));
    setApprovers(loadedApprovers.length > 0 ? loadedApprovers : [{ level: 1, approverType: 'REPORTING_MANAGER', minApprovals: 1 }]);
    fetchUsers();
    setShowModal(true);
  };

  // Sync approvers array length when approvalCount changes
  const handleApprovalCountChange = (count: number) => {
    setApprovalCount(count);
    setApprovers((prev) => {
      if (count > prev.length) {
        const newApprovers = [...prev];
        for (let i = prev.length; i < count; i++) {
          newApprovers.push({ level: i + 1, approverType: 'REPORTING_MANAGER', minApprovals: 1 });
        }
        return newApprovers;
      }
      return prev.slice(0, count);
    });
  };

  const updateApprover = (idx: number, patch: Partial<ApprovalLevel>) => {
    setApprovers((prev) => prev.map((a, i) => i === idx ? { ...a, ...patch } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      levels: approvers.map((a) => ({
        ...a,
        level: a.level,
        minApprovals,
      })),
      ...(editItem?.id && { id: editItem.id }),
    };
    const result = await dispatch(createApprovalPolicy(payload as Partial<ApprovalPolicy>));
    if (createApprovalPolicy.fulfilled.match(result)) { setShowModal(false); dispatch(fetchApprovalPolicies()); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Approval Policies</h2>
          <p className="text-sm text-gray-500">Define multi-level approval chains for leave requests</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Create Approval Policy
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : approvalPolicies.length === 0 ? (
        <EmptyState icon={Shield} title="No approval policies" description="Set up approval chains for leave requests" action={{ label: 'Create Policy', onClick: openCreate }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {approvalPolicies.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer" onClick={() => setDetailPolicy(p)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                    <span className="text-xs text-gray-400">
                      {p.leavePolicy?.name || p.leavePolicyName || '—'} · {p.leaveType?.name || p.leaveTypeName || '—'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {p.levels?.map((l, i) => (
                  <span key={l.id || i} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-600">
                    L{l.level}: {l.approverType.replace('_', ' ')}
                    {l.user?.name && ` → ${l.user.name}`}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {p.levels?.length || 0} level{p.levels?.length !== 1 ? 's' : ''} · Min {p.levels?.[0]?.minApprovals || 1} approval{p.levels?.[0]?.minApprovals !== 1 ? 's' : ''}
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Approval Policy' : 'Create Approval Policy'} size="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Policy Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Earned Leave Multi-Level Approval" required />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Leave Policy">
              <Select value={form.leavePolicyId} onChange={(e) => setForm({ ...form, leavePolicyId: e.target.value })}>
                <option value="">All Policies</option>
                {leavePolicies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Leave Type">
              <Select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
                <option value="">All Leave Types</option>
                {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>

          {/* Approval Chain Settings */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Approval Chain Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="No. of Approval Levels">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={approvalCount}
                  onChange={(e) => handleApprovalCountChange(+e.target.value)}
                />
              </Field>
              <Field label="Min Approvals Required">
                <Input
                  type="number"
                  min={1}
                  max={approvalCount}
                  value={minApprovals}
                  onChange={(e) => setMinApprovals(+e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Approval Levels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Approval Levels ({approvalCount})</h4>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {approvers.map((approver, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  {/* Level Header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">Level {idx + 1}</span>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Approver Type" required>
                        <Select
                          value={approver.approverType}
                          onChange={(e) => updateApprover(idx, { approverType: e.target.value as LeaveApproverType, userId: undefined, userName: undefined })}
                        >
                          {APPROVER_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                      </Field>
                      {approver.approverType === 'SPECIFIC_USER' ? (
                        <Field label="Select User" required>
                          <Select
                            value={approver.userId || ''}
                            onChange={(e) => {
                              const selected = userOptions.find((u) => u.id === e.target.value);
                              updateApprover(idx, { userId: e.target.value, userName: selected?.name });
                            }}
                          >
                            <option value="">Select User</option>
                            {userOptions.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </Select>
                        </Field>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400 italic bg-gray-100 rounded-lg border border-gray-200">
                          {approver.approverType === 'ROLE' ? 'Select role in approver type' : approver.approverType.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !form.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} {editItem ? 'Update Policy' : 'Create Policy'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Policy Detail Modal */}
      <ApprovalPolicyDetailModal policy={detailPolicy} onClose={() => setDetailPolicy(null)} onEdit={() => { if (detailPolicy) { openEdit(detailPolicy); setDetailPolicy(null); } }} />
    </div>
  );
}

// ===== APPROVAL POLICY DETAIL MODAL =====
function ApprovalPolicyDetailModal({ policy, onClose, onEdit }: { policy: ApprovalPolicy | null; onClose: () => void; onEdit: () => void }) {
  if (!policy) return null;

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const APPROVER_LABELS: Record<string, string> = {
    REPORTING_MANAGER: 'Reporting Manager',
    DEPARTMENT_MANAGER: 'Department Manager',
    COMPANY_ADMIN: 'Company Admin',
    SPECIFIC_USER: 'Specific User',
    ROLE: 'By Role',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{policy.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {policy.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">Approval Policy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
              Edit Policy
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Policy Overview */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Policy Overview</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Policy Name', value: policy.name },
                { label: 'Leave Policy', value: policy.leavePolicy?.name || policy.leavePolicyName || 'All' },
                { label: 'Leave Type', value: policy.leaveType?.name || policy.leaveTypeName || 'All' },
                { label: 'Employment Type', value: policy.leavePolicy?.employmentType?.replace('_', ' ') || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            {policy.leavePolicy?.probationMonths !== undefined && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Probation (Months)</p>
                  <p className="text-sm font-semibold text-gray-900">{policy.leavePolicy.probationMonths}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Min Approvals</p>
                  <p className="text-sm font-semibold text-gray-900">{policy.levels?.[0]?.minApprovals || 1}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-900">{fmt(policy.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Updated At</p>
                <p className="text-sm font-semibold text-gray-900">{fmt(policy.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Approval Levels */}
          {(policy.levels ?? []).length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No approval levels configured</div>
          ) : (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Approval Levels ({policy.levels?.length})</p>
              <div className="space-y-3">
                {policy.levels?.map((lvl, idx) => (
                  <div key={lvl.id || idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {/* Level Header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                      <div className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {lvl.level}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Level {lvl.level}</span>
                      <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                        {APPROVER_LABELS[lvl.approverType] || lvl.approverType}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Level Details */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                          <p className="text-[10px] text-gray-400 uppercase">Min Approvals</p>
                          <p className="text-sm font-bold text-gray-900">{lvl.minApprovals}</p>
                        </div>
                        {lvl.approverType === 'SPECIFIC_USER' && (
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Selected User</p>
                            <p className="text-sm font-bold text-gray-900">{lvl.user?.name || lvl.userName || '—'}</p>
                          </div>
                        )}
                        {lvl.approverType === 'ROLE' && lvl.roleId && (
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase">Role ID</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{lvl.roleId}</p>
                          </div>
                        )}
                        {lvl.user?.email && (
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200 col-span-2">
                            <p className="text-[10px] text-gray-400 uppercase">User Email</p>
                            <p className="text-sm font-bold text-gray-900">{lvl.user.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Approver User Badge */}
                      {lvl.user && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="w-8 h-8 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {(lvl.user.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{lvl.user.name || '—'}</p>
                            <p className="text-xs text-gray-400">{lvl.user.email || ''}</p>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
                        <span>Created: {fmt(lvl.createdAt)}</span>
                        <span>Updated: {fmt(lvl.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== HOLIDAY CALENDARS SECTION =====
function HolidayCalendarsSection() {
  const dispatch = useAppDispatch();
  const { holidayCalendars, loading, submitting } = useAppSelector((s) => s.leave);
  const selectedCalendar = useAppSelector((s) => s.leave.selectedCalendar);
  const [showCalModal, setShowCalModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [activeCalTab, setActiveCalTab] = useState<'all' | 'imported' | 'custom'>('all');
  const [calForm, setCalForm] = useState({
    name: '', regionType: 'CUSTOM' as HolidayRegionType, country: '', state: '', city: '', year: new Date().getFullYear(), isDefault: false, isActive: true,
  });
  const [holidayForm, setHolidayForm] = useState({ holidayCalendarId: '', name: '', date: '', isOptional: false });

  const openCalendar = (cal: HolidayCalendar) => { dispatch(setSelectedCalendar(cal)); };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createHolidayCalendar(calForm as Partial<HolidayCalendar>));
    if (createHolidayCalendar.fulfilled.match(result)) { setShowCalModal(false); dispatch(fetchHolidayCalendars()); }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createHoliday(holidayForm as Partial<Holiday>));
    if (createHoliday.fulfilled.match(result)) {
      dispatch(addHolidayToCalendar({ ...holidayForm, id: Date.now().toString() } as Holiday));
      setShowHolidayModal(false);
      setHolidayForm({ holidayCalendarId: holidayForm.holidayCalendarId, name: '', date: '', isOptional: false });
    }
  };

  const filtered = holidayCalendars.filter((c) => {
    if (activeCalTab === 'imported') return c.regionType !== 'CUSTOM' && c.regionType !== 'GLOBAL';
    if (activeCalTab === 'custom') return c.regionType === 'CUSTOM';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Holiday Calendars</h2>
          <p className="text-sm text-gray-500">Manage organizational holidays and leave-free days</p>
        </div>
        <button onClick={() => setShowCalModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Create Calendar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['all', 'imported', 'custom'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveCalTab(tab)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeCalTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Globe} title="No holiday calendars" description="Create a calendar to manage organizational holidays" action={{ label: 'Create Calendar', onClick: () => setShowCalModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cal) => (
            <div key={cal.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer" onClick={() => openCalendar(cal)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{cal.name}</h3>
                    <span className="text-xs text-gray-400">{cal.year}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {cal.isDefault && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Default</span>}
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cal.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cal.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{cal.regionType}</span>
                {cal.country && <span>{cal.country}</span>}
                <span className="ml-auto flex items-center gap-1"><Calendar className="w-3 h-3" /> {cal.holidays?.length || 0} holidays</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Detail Drawer */}
      {selectedCalendar && (
        <CalendarDetailDrawer
          calendar={selectedCalendar}
          onClose={() => dispatch(setSelectedCalendar(null))}
          onAddHoliday={() => {
            setHolidayForm((p) => ({ ...p, holidayCalendarId: selectedCalendar.id }));
            setShowHolidayModal(true);
          }}
          onDeleteHoliday={(holidayId) => dispatch(deleteHoliday(holidayId))}
          submitting={submitting}
        />
      )}

      {/* Create Calendar Modal */}
      <Modal open={showCalModal} onClose={() => setShowCalModal(false)} title="Create Holiday Calendar">
        <form onSubmit={handleCreateCalendar} className="space-y-4">
          <Field label="Calendar Name" required>
            <Input value={calForm.name} onChange={(e) => setCalForm({ ...calForm, name: e.target.value })} placeholder="Custom Holiday Calendar 2026" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Region Type" required>
              <Select value={calForm.regionType} onChange={(e) => setCalForm({ ...calForm, regionType: e.target.value as HolidayRegionType })}>
                {REGION_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
            <Field label="Year"><Input type="number" min={2000} value={calForm.year} onChange={(e) => setCalForm({ ...calForm, year: +e.target.value })} /></Field>
          </div>
          {(calForm.regionType === 'COUNTRY' || calForm.regionType === 'STATE' || calForm.regionType === 'CITY') && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country">
                <Select value={calForm.country} onChange={(e) => setCalForm({ ...calForm, country: e.target.value })}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </Field>
              {calForm.regionType === 'STATE' && <Field label="State"><Input value={calForm.state || ''} onChange={(e) => setCalForm({ ...calForm, state: e.target.value })} /></Field>}
              {calForm.regionType === 'CITY' && <Field label="City"><Input value={calForm.city || ''} onChange={(e) => setCalForm({ ...calForm, city: e.target.value })} /></Field>}
            </div>
          )}
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <Toggle checked={calForm.isDefault} onChange={(v) => setCalForm({ ...calForm, isDefault: v })} />
              <span className="text-sm font-medium text-gray-700">Default Calendar</span>
            </div>
            <div className="flex items-center gap-3">
              <Toggle checked={calForm.isActive} onChange={(v) => setCalForm({ ...calForm, isActive: v })} />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !calForm.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} Create
            </button>
            <button type="button" onClick={() => setShowCalModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Add Holiday Modal */}
      <Modal open={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Add Holiday">
        <form onSubmit={handleAddHoliday} className="space-y-4">
          <Field label="Holiday Name" required>
            <Input value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} placeholder="Organization Foundation Day" required />
          </Field>
          <Field label="Date" required>
            <Input type="date" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} required />
          </Field>
          <div className="flex items-center gap-3">
            <Toggle checked={holidayForm.isOptional} onChange={(v) => setHolidayForm({ ...holidayForm, isOptional: v })} />
            <span className="text-sm font-medium text-gray-700">Optional Holiday</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !holidayForm.name || !holidayForm.date} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} Add Holiday
            </button>
            <button type="button" onClick={() => setShowHolidayModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ===== CALENDAR DETAIL DRAWER =====
function CalendarDetailDrawer({ calendar, onClose, onAddHoliday, onDeleteHoliday, submitting }: {
  calendar: HolidayCalendar; onClose: () => void; onAddHoliday: () => void;
  onDeleteHoliday: (holidayId: string) => void; submitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{calendar.name}</h3>
            <p className="text-xs text-gray-400">{calendar.regionType} · {calendar.year}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Holidays ({calendar.holidays?.length || 0})</h4>
            <button onClick={onAddHoliday} disabled={submitting} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              <Plus className="w-3.5 h-3.5" /> Add Holiday
            </button>
          </div>
          {(calendar.holidays || []).length === 0 ? (
            <EmptyState icon={Calendar} title="No holidays added" description="Add holidays to this calendar" />
          ) : (
            <div className="space-y-2">
              {calendar.holidays?.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                    {new Date(h.date).getDate()}
                    <br />
                    <span className="text-[8px]">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(h.date)}</p>
                  </div>
                  {h.isOptional && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Optional</span>}
                  <button
                    onClick={() => onDeleteHoliday(h.id)}
                    disabled={submitting}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Delete holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== WORK WEEK SECTION =====
function WorkWeekSection() {
  const dispatch = useAppDispatch();
  const { workWeek, loading, submitting } = useAppSelector((s) => s.leave);
  const [selectedDays, setSelectedDays] = useState<WorkingDay[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);

  useEffect(() => {
    if (workWeek?.workingDays) setSelectedDays(workWeek.workingDays);
  }, [workWeek]);

  const toggleDay = (day: WorkingDay) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleSave = async () => {
    const result = await dispatch(updateWorkWeek({ workingDays: selectedDays }));
    if (updateWorkWeek.fulfilled.match(result)) dispatch(fetchWorkWeek());
  };

  const reset = () => setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Work Week</h2>
          <p className="text-sm text-gray-500">Configure working days used for leave counting (WORKING_DAYS mode)</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">Selected days are counted as working days for WORKING_DAYS leave calculation. Non-selected days (weekends) are excluded.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-16 h-16 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedDays.includes(day)
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{DAY_LABELS[day].slice(0, 3)}</span>
                {selectedDays.includes(day) ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3 opacity-40" />}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} Save Work Week
            </button>
            <button onClick={reset} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
              Reset to Mon–Fri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MY LEAVE SECTION =====
function MyLeaveSection({ myBalances, myRequests, leaveTypes, activeHolidayCalendar, submitting, actionLoading, onApply, onCancel, loading, dispatch }: {
  myBalances: LeaveBalance[]; myRequests: LeaveRequest[]; leaveTypes: LeaveType[];
  activeHolidayCalendar: HolidayCalendar | null; submitting: boolean; actionLoading: string | null;
  onApply: (p: any) => void; onCancel: (id: string, reason?: string) => void;
  loading: boolean; dispatch: any;
}) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showBehalfModal, setShowBehalfModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userOptions, setUserOptions] = useState<UserSelectOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [behalfForm, setBehalfForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [attachments, setAttachments] = useState<File[]>([]);

  const upcomingHolidays = (activeHolidayCalendar?.holidays || [])
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onApply({ ...form, attachments });
    if ((result as any).type === 'leave/apply/fulfilled') {
      setShowApplyModal(false);
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      setAttachments([]);
      dispatch(fetchMyRequests());
      dispatch(fetchMyBalances());
    }
  };

  const handleCancel = () => {
    if (cancelModal) { onCancel(cancelModal, cancelReason); setCancelModal(null); setCancelReason(''); }
  };

  const openBehalfModal = async () => {
    setSelectedUserId('');
    setSelectedUserName('');
    setBehalfForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    const result = await dispatch(fetchUserSelectOptions());
    if (fetchUserSelectOptions.fulfilled.match(result)) {
      setUserOptions(result.payload);
    }
    setShowBehalfModal(true);
  };

  const handleApplyOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    const result = await dispatch(applyLeaveOnBehalf({
      userId: selectedUserId,
      payload: { ...behalfForm, attachments },
    }));
    if (applyLeaveOnBehalf.fulfilled.match(result)) {
      setShowBehalfModal(false);
      setSelectedUserId('');
      setSelectedUserName('');
      setBehalfForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      dispatch(fetchLeaveRequests());
    }
  };

  const daysBetween = (s: string, e: string) => {
    const diff = new Date(e).getTime() - new Date(s).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0;
  const behalfTotalDays = behalfForm.startDate && behalfForm.endDate ? daysBetween(behalfForm.startDate, behalfForm.endDate) : 0;

  const filteredRequests = myRequests.filter((r) =>
    (r.leaveType?.name || r.leaveTypeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Leave</h2>
          <p className="text-sm text-gray-500">View your leave balance, apply for leave, and track requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openBehalfModal} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition shadow-sm">
            <Users className="w-4 h-4" /> Apply on Behalf
          </button>
          <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : myBalances.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No leave balances" description="Your leave balances will appear here once configured" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myBalances.map((b) => (
            <div key={b.leaveTypeId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{b.leaveType?.name || b.leaveTypeName}</span>
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{b.remainingDays ?? b.available ?? 0} <span className="text-sm font-normal text-gray-400">/ {b.allocatedDays ?? b.allocated ?? 0} days</span></div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(b.allocatedDays ?? b.allocated ?? 0) > 0 ? Math.round(((b.usedDays ?? b.used ?? 0) / (b.allocatedDays ?? b.allocated ?? 0)) * 100) : 0}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{b.usedDays ?? b.used ?? 0} used</span>
                {(b.pending ?? 0) > 0 && <span className="text-yellow-600">{b.pending} pending</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-500" /> Upcoming Holidays
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upcomingHolidays.slice(0, 5).map((h) => (
              <div key={h.id} className="shrink-0 flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-700">{new Date(h.date).getDate()}</div>
                  <div className="text-[10px] text-orange-500">{new Date(h.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">{h.name}</p>
                  {h.isOptional && <span className="text-[10px] text-gray-400">Optional</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">My Leave Requests</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search leave type..." className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
        </div>
        {filteredRequests.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No leave requests found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.leaveType?.name || r.leaveTypeName || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(r.startDate)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(r.endDate)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{r.totalDays || 0}</td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status || '']}`}>{r.status}</span></td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(r.createdAt || '')}</td>
                  <td className="px-5 py-3.5">
                    {(r.status === 'PENDING' || r.status === 'PARTIALLY_APPROVED') && (
                      <button onClick={() => setCancelModal(r.id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal open={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Leave" size="max-w-lg">
        <form onSubmit={handleApply} className="space-y-4">
          <Field label="Leave Type" required>
            <Select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
              <option value="">Select Leave Type</option>
              {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
            <Field label="End Date" required><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></Field>
          </div>
          {totalDays > 0 && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {totalDays} calendar day{totalDays !== 1 ? 's' : ''} selected
            </div>
          )}
          <Field label="Reason" required>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Brief reason for leave" required />
          </Field>
          <div>
            <Field label="Attachments" hint="Up to 5 files, max 5MB each">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAttachments(Array.from(e.target.files || []))} className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-semibold hover:file:bg-blue-100 cursor-pointer" />
            </Field>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((f, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{f.name}</span>)}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !form.leaveTypeId || !form.startDate || !form.endDate || !form.reason} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Check className="w-4 h-4" />} Submit Request
            </button>
            <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Apply on Behalf Modal */}
      <Modal open={showBehalfModal} onClose={() => setShowBehalfModal(false)} title="Apply Leave on Behalf" size="max-w-lg">
        <form onSubmit={handleApplyOnBehalf} className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-2">
            <Users className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <p className="text-xs text-purple-700">Apply leave on behalf of an employee. The leave will be submitted from their account.</p>
          </div>

          <Field label="Select Employee" required>
            <Select
              value={selectedUserId}
              onChange={(e) => {
                const selected = userOptions.find((u) => u.id === e.target.value);
                setSelectedUserId(e.target.value);
                setSelectedUserName(selected?.name || '');
              }}
            >
              <option value="">Select Employee</option>
              {userOptions.map((u) => <option key={u.id} value={u.id}>{u.name} </option>)}
            </Select>
          </Field>

          {selectedUserId && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                {getInitials(selectedUserName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedUserName}</p>
                <p className="text-xs text-gray-400">{userOptions.find((u) => u.id === selectedUserId)?.email}</p>
              </div>
            </div>
          )}

          <Field label="Leave Type" required>
            <Select value={behalfForm.leaveTypeId} onChange={(e) => setBehalfForm({ ...behalfForm, leaveTypeId: e.target.value })}>
              <option value="">Select Leave Type</option>
              {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required><Input type="date" value={behalfForm.startDate} onChange={(e) => setBehalfForm({ ...behalfForm, startDate: e.target.value })} required /></Field>
            <Field label="End Date" required><Input type="date" value={behalfForm.endDate} onChange={(e) => setBehalfForm({ ...behalfForm, endDate: e.target.value })} required /></Field>
          </div>
          {behalfTotalDays > 0 && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {behalfTotalDays} calendar day{behalfTotalDays !== 1 ? 's' : ''} selected
            </div>
          )}
          <Field label="Reason" required>
            <textarea value={behalfForm.reason} onChange={(e) => setBehalfForm({ ...behalfForm, reason: e.target.value })} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Brief reason for leave" required />
          </Field>
          <div>
            <Field label="Attachments" hint="Up to 5 files, max 5MB each">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAttachments(Array.from(e.target.files || []))} className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-semibold hover:file:bg-blue-100 cursor-pointer" />
            </Field>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((f, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{f.name}</span>)}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !selectedUserId || !behalfForm.leaveTypeId || !behalfForm.startDate || !behalfForm.endDate || !behalfForm.reason} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition">
              {submitting ? <Spinner size="sm" /> : <Users className="w-4 h-4" />} Submit for {selectedUserName || 'Employee'}
            </button>
            <button type="button" onClick={() => setShowBehalfModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Leave Request" size="max-w-sm">
        <div className="space-y-4">
          <Field label="Cancellation Reason">
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional reason for cancellation" />
          </Field>
          <div className="flex gap-3">
            <button onClick={handleCancel} disabled={!!actionLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition">
              {actionLoading === 'cancelling' ? <Spinner size="sm" /> : <XCircle className="w-4 h-4" />} Cancel Request
            </button>
            <button onClick={() => setCancelModal(null)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ===== LEAVE REQUESTS SECTION (Admin) =====
function LeaveRequestsSection({ leaveRequests, leaveTypes, actionLoading, loading, search, statusFilter, typeFilter, setSearch, setStatusFilter, setTypeFilter, onApprove, onReject }: {
  leaveRequests: LeaveRequest[]; leaveTypes: LeaveType[]; actionLoading: string | null;
  loading: boolean; search: string; statusFilter: string; typeFilter: string;
  setSearch: (v: string) => void; setStatusFilter: (v: string) => void; setTypeFilter: (v: string) => void;
  onApprove: (id: string, remarks?: string) => void; onReject: (id: string, remarks?: string) => void;
}) {
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

      {/* Filters */}
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

      {/* Request Detail Drawer */}
      {selectedRequest && (
        <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}

      {/* Approve Modal */}
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

      {/* Reject Modal */}
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

// ===== REQUEST DETAIL DRAWER =====
function RequestDetailDrawer({ request, onClose }: { request: LeaveRequest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Leave Request Details</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Employee Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-lg font-bold">
              {getInitials(request.employeeName || request.user?.name || '')}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{request.employeeName || request.user?.name || '—'}</p>
              <p className="text-sm text-gray-400">{request.employeeEmail || request.user?.email || ''}</p>
            </div>
          </div>

          {/* Leave Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Leave Type', value: request.leaveTypeName || '—' },
              { label: 'Policy', value: request.leavePolicyName || '—' },
              { label: 'Start Date', value: formatDate(request.startDate) },
              { label: 'End Date', value: formatDate(request.endDate) },
              { label: 'Total Days', value: `${request.totalDays || 0}` },
              { label: 'Status', value: request.status || '—', badge: true },
            ].map(({ label, value, badge }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                {badge ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status || '']}`}>{value}</span>
                  : <p className="text-sm font-semibold text-gray-900">{value}</p>}
              </div>
            ))}
          </div>

          {/* Reason */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Reason</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{request.reason || '—'}</p>
          </div>

          {/* Approval Chain */}
          {request.approvals && request.approvals.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Approval Chain</h4>
              <div className="space-y-2">
                {request.approvals.map((a, i) => (
                  <div key={a.id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${a.decision === 'APPROVED' ? 'bg-green-100 text-green-700' : a.decision === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                      {a.decision === 'APPROVED' ? <Check className="w-3 h-3" /> : a.decision === 'REJECTED' ? <X className="w-3 h-3" /> : a.level}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800">{a.approver?.name || `Level ${a.level}`}</p>
                      {a.remarks && <p className="text-xs text-gray-400">{a.remarks}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{a.actedAt ? formatDate(a.actedAt) : 'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {request.attachmentUrls && request.attachmentUrls.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Attachments</h4>
              <div className="space-y-2">
                {request.attachmentUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition">
                    <FileText className="w-4 h-4" /> Attachment {i + 1}
                    <Download className="w-3.5 h-3.5 ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
