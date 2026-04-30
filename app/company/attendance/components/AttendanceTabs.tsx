'use client';

import { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  X,
  Settings,
  AlertCircle,
  Star,
  Sun,
} from 'lucide-react';
import { AttendanceRecord, AttendanceSummary } from '@/store/actions/attendanceActions';

export const WEEK_DAYS = [
  { label: 'Mon', value: 'MONDAY' },
  { label: 'Tue', value: 'TUESDAY' },
  { label: 'Wed', value: 'WEDNESDAY' },
  { label: 'Thu', value: 'THURSDAY' },
  { label: 'Fri', value: 'FRIDAY' },
  { label: 'Sat', value: 'SATURDAY' },
  { label: 'Sun', value: 'SUNDAY' },
];

function getStatusColor(status: string) {
  const upperStatus = (status || '').toUpperCase();
  switch (upperStatus) {
    case 'PRESENT':
    case 'APPROVED':
      return 'bg-green-100 text-green-700';
    case 'ABSENT':
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'LATE':
      return 'bg-yellow-100 text-yellow-700';
    case 'HALF_DAY':
      return 'bg-orange-100 text-orange-700';
    case 'PENDING':
      return 'bg-blue-100 text-blue-700';
    case 'ON_LEAVE':
      return 'bg-purple-100 text-purple-700';
    case 'HOLIDAY':
      return 'bg-pink-100 text-pink-700';
    case 'WEEK_OFF':
      return 'bg-gray-200 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStatusIcon(status: string) {
  const upperStatus = (status || '').toUpperCase();
  switch (upperStatus) {
    case 'PRESENT':
    case 'APPROVED':
      return <CheckCircle className="w-4 h-4" />;
    case 'ABSENT':
    case 'REJECTED':
      return <XCircle className="w-4 h-4" />;
    case 'LATE':
      return <AlertCircle className="w-4 h-4" />;
    case 'ON_LEAVE':
      return <Calendar className="w-4 h-4" />;
    case 'HOLIDAY':
      return <Star className="w-4 h-4" />;
    case 'WEEK_OFF':
      return <Sun className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function formatStatus(status: string) {
  if (!status) return '';
  const labels: Record<string, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    HALF_DAY: 'Half Day',
    ON_LEAVE: 'On Leave',
    HOLIDAY: 'Holiday',
    WEEK_OFF: 'Week Off',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return labels[status.toUpperCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  activeTab: 'today' | 'history' | 'calendar' | 'requests' | 'config';
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dateFilter: { from: string; to: string };
  setDateFilter: (f: { from: string; to: string }) => void;
  todayAttendance: AttendanceRecord[];
  attendanceHistory: AttendanceRecord[];
  monthlySummary: AttendanceSummary[];
  loading: boolean;
  onViewUser: (userId: string, type: 'today' | 'history' | 'summary', record?: AttendanceRecord) => void;
  onRefresh: () => void;
}

export default function AttendanceTabs({
  activeTab,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  todayAttendance,
  attendanceHistory,
  monthlySummary,
  loading,
  onViewUser,
  onRefresh,
}: Props) {
  // ── Today's Attendance ───────────────────────────────────────────────────
  if (activeTab === 'today') {
    const filtered = todayAttendance.filter(
      (record) =>
        (record.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
      <div className="attendance-item">
        <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
        ) : filtered.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No attendance records found</p>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Check In</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Check Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Hours Worked</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.userName}</div>
                        <div className="text-xs text-gray-500">{record.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">{record.checkIn || '-'}</td>
                      <td className="py-3 px-4">{record.checkOut || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {formatStatus(record.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{record.hoursWorked || '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onViewUser(record.userId, 'today', record)}
                          className="p-2 text-[#0445AD] hover:bg-[#0445AD]/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
    );
  }

  // ── Attendance History ─────────────────────────────────────────────────────
  if (activeTab === 'history') {
    const filtered = attendanceHistory.filter((record) => {
      const matchesSearch =
        (record.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesDate =
        (!dateFilter.from || record.date >= dateFilter.from) &&
        (!dateFilter.to || record.date <= dateFilter.to);
      return matchesSearch && matchesDate;
    });

    return (
      <div className="attendance-item">
        <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Action</label>
              <button
                onClick={onRefresh}
                className="w-full px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No attendance history found</p>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Check In</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Check Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Hours</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.userName}</div>
                        <div className="text-xs text-gray-500">{record.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        {record.date ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-3 px-4">{record.checkIn || '-'}</td>
                      <td className="py-3 px-4">{record.checkOut || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {formatStatus(record.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{record.hoursWorked || '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onViewUser(record.userId, 'history', record)}
                          className="p-2 text-[#0445AD] hover:bg-[#0445AD]/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
    );
  }

  // ── Calendar View ──────────────────────────────────────────────────────────
  if (activeTab === 'calendar') {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const getCalendarDays = () => {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay();
      const totalDays = lastDay.getDate();
      const days = [];
      for (let i = 0; i < startDay; i++) days.push(null);
      for (let i = 1; i <= totalDays; i++) days.push(i);
      return days;
    };

    const getAttendanceForDay = (day: number | null) => {
      if (!day) return null;
      const dayNum = day % 7;
      if (dayNum === 0 || dayNum === 6) return 'weekend';
      if (day === 5 || day === 12) return 'absent';
      if (day === 8 || day === 15) return 'late';
      return 'present';
    };

    return (
      <div className="attendance-item">
        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold font-['Montserrat']">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day, index) => {
              const attendance = getAttendanceForDay(day);
              const statusColors = {
                present: 'bg-green-100 text-green-700 border-green-300',
                absent: 'bg-red-100 text-red-700 border-red-300',
                late: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                weekend: 'bg-gray-100 text-gray-500 border-gray-300',
              };
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all hover:scale-105 ${
                    day
                      ? statusColors[attendance as keyof typeof statusColors]
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  {day && (
                    <div className="text-center">
                      <div>{day}</div>
                      {attendance === 'present' && <div className="text-xs">✓</div>}
                      {attendance === 'absent' && <div className="text-xs">✗</div>}
                      {attendance === 'late' && <div className="text-xs">!</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            {[
              { key: 'present', label: 'Present', color: 'bg-green-100 border-2 border-green-300 rounded' },
              { key: 'absent', label: 'Absent', color: 'bg-red-100 border-2 border-red-300 rounded' },
              { key: 'late', label: 'Late', color: 'bg-yellow-100 border-2 border-yellow-300 rounded' },
              { key: 'weekend', label: 'Weekend', color: 'bg-gray-100 border-2 border-gray-300 rounded' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Regularization Requests ────────────────────────────────────────────────
  if (activeTab === 'requests') {
    return (
      <div className="attendance-item">
        <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
          <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Employee regularization requests</p>
          <p className="text-xs text-gray-400 mt-1">Use the "Regularization Admin" tab to manage policies and approvals</p>
        </div>
      </div>
    );
  }

  return null;
}
