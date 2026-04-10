'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sun,
  Star,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  checkIn,
  checkOut,
  fetchUserTodayAttendance,
  fetchUserAttendanceHistory,
  fetchAttendanceConfig,
  AttendanceRecord,
} from '@/store/actions/attendanceActions';

interface User {
  id: string;
  name?: string;
  email?: string;
  roles?: string[];
}

const getStatusColor = (status: string) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PRESENT': return 'bg-green-100 text-green-700';
    case 'ABSENT': return 'bg-red-100 text-red-700';
    case 'LATE': return 'bg-yellow-100 text-yellow-700';
    case 'HALF_DAY': return 'bg-orange-100 text-orange-700';
    case 'ON_LEAVE': return 'bg-purple-100 text-purple-700';
    case 'HOLIDAY': return 'bg-pink-100 text-pink-700';
    case 'WEEK_OFF': return 'bg-gray-200 text-gray-600';
    case 'PENDING': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
    case 'ABSENT': return <XCircle className="w-4 h-4" />;
    case 'LATE': return <AlertCircle className="w-4 h-4" />;
    case 'ON_LEAVE': return <Calendar className="w-4 h-4" />;
    case 'HOLIDAY': return <Star className="w-4 h-4" />;
    case 'WEEK_OFF': return <Sun className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const formatStatus = (status: string) => {
  if (!status) return '';
  const labels: Record<string, string> = {
    PRESENT: 'Present', ABSENT: 'Absent', LATE: 'Late',
    HALF_DAY: 'Half Day', ON_LEAVE: 'On Leave', HOLIDAY: 'Holiday',
    WEEK_OFF: 'Week Off', PENDING: 'Pending',
  };
  return labels[status.toUpperCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
};

export default function EmployeeAttendancePage() {
  const dispatch = useAppDispatch();
  const { selectedUserAttendance, loading, error } = useAppSelector((s) => s.attendance);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyPerPage = 10;

  // Live clock
  useEffect(() => {
    timerRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Load current user
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw) as User;
      setCurrentUser(u);
      if (u.id) {
        dispatch(fetchUserTodayAttendance(u.id));
        dispatch(fetchAttendanceConfig());
      }
    }
  }, [dispatch]);

  // Auto-refresh today's attendance every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser, dispatch]);

  // Load history when tab is opened
  useEffect(() => {
    if (activeTab === 'history' && currentUser?.id && records.length === 0) {
      setLoadingHistory(true);
      dispatch(fetchUserAttendanceHistory(currentUser.id)).then((result) => {
        setLoadingHistory(false);
        if (fetchUserAttendanceHistory.fulfilled.match(result)) {
          const payload = result.payload as AttendanceRecord;
          setRecords(Array.isArray(payload) ? payload : [payload]);
        }
      });
    }
  }, [activeTab, currentUser, dispatch, records.length]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setLocalError(null);
    setSuccessMsg(null);
    const result = await dispatch(checkIn());
    if (checkIn.fulfilled.match(result)) {
      setSuccessMsg('Checked in successfully!');
      if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
    } else {
      setLocalError((result.payload as string) || 'Check-in failed');
    }
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setLocalError(null);
    setSuccessMsg(null);
    const result = await dispatch(checkOut());
    if (checkOut.fulfilled.match(result)) {
      setSuccessMsg('Checked out successfully!');
      if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
    } else {
      setLocalError((result.payload as string) || 'Check-out failed');
    }
    setCheckingOut(false);
  };

  const handleRefresh = () => {
    if (currentUser?.id) {
      dispatch(fetchUserTodayAttendance(currentUser.id));
      if (activeTab === 'history') {
        setLoadingHistory(true);
        dispatch(fetchUserAttendanceHistory(currentUser.id)).then((result) => {
          setLoadingHistory(false);
          if (fetchUserAttendanceHistory.fulfilled.match(result)) {
            const payload = result.payload as AttendanceRecord;
            setRecords(Array.isArray(payload) ? payload : [payload]);
          }
        });
      }
    }
  };

  const today = selectedUserAttendance;
  const isCheckedIn = !!today?.checkIn;
  const isCheckedOut = !!today?.checkOut;

  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // History filtering & pagination
  const filtered = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return !term || (r.date || '').toLowerCase().includes(term) || (r.status || '').toLowerCase().includes(term);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / historyPerPage));
  const paginated = filtered.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Montserrat']">My Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your daily attendance</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['today', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setHistoryPage(1); setSearchTerm(''); }}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#0445AD] text-[#0445AD]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'today' ? "Today's Attendance" : 'Attendance History'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(localError || error) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <XCircle className="w-5 h-5 shrink-0" />
          {localError || error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Today's Tab */}
      {activeTab === 'today' && (
        <div className="space-y-5">
          {/* Date/Time Banner */}
          <div className="bg-gradient-to-r from-[#0445AD] to-[#033080] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-white/70">{dateStr}</p>
                <p className="text-4xl font-bold font-['Montserrat'] mt-1 tracking-wider">{timeStr}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70">Week</div>
                <div className="text-2xl font-bold">
                  {/* Week number fallback */}
                  {(() => {
                    const d = new Date(currentTime);
                    d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                    const yearStart = new Date(d.getFullYear(), 0, 1);
                    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Check In / Out Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Check In Card */}
            <div className={`p-5 rounded-xl border-2 transition-all ${isCheckedIn ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckedIn ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <LogIn className={`w-5 h-5 ${isCheckedIn ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Check In</p>
                  <p className="text-xs text-gray-400">{isCheckedIn ? today?.checkIn : '—'}</p>
                </div>
              </div>
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {checkingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {checkingIn ? 'Checking in...' : 'Check In'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Checked In
                </div>
              )}
            </div>

            {/* Hours Card */}
            <div className="p-5 rounded-xl border-2 border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Hours Worked</p>
                  <p className="text-xs text-gray-400">{today?.hoursWorked || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                <Clock className="w-4 h-4" /> {today?.hoursWorked ? `${today.hoursWorked} worked` : 'No data yet'}
              </div>
            </div>

            {/* Check Out Card */}
            <div className={`p-5 rounded-xl border-2 transition-all ${isCheckedOut ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckedOut ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <LogOut className={`w-5 h-5 ${isCheckedOut ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Check Out</p>
                  <p className="text-xs text-gray-400">{isCheckedOut ? today?.checkOut : '—'}</p>
                </div>
              </div>
              {!isCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn || checkingOut}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {checkingOut ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  {checkingOut ? 'Checking out...' : 'Check Out'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Checked Out
                </div>
              )}
            </div>
          </div>

          {/* Status Row */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">Today&apos;s Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getStatusColor(today?.status || 'PENDING')}`}>
                {getStatusIcon(today?.status || 'PENDING')}
                {formatStatus(today?.status || 'PENDING')}
              </span>
              {today?.remarks && (
                <span className="text-xs text-gray-400 ml-auto">{today.remarks}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date or status..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setHistoryPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loadingHistory ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Date', 'Check In', 'Check Out', 'Status', 'Hours'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                          No attendance records found
                        </td>
                      </tr>
                    ) : paginated.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {record.date ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.checkIn || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.checkOut || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {formatStatus(record.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.hoursWorked || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {Math.min((historyPage - 1) * historyPerPage + 1, filtered.length)}–{Math.min(historyPage * historyPerPage, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1.5">
                  <button onClick={() => setHistoryPage(Math.max(1, historyPage - 1))} disabled={historyPage === 1}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setHistoryPage(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${p === historyPage ? 'bg-[#0445AD] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setHistoryPage(Math.min(totalPages, historyPage + 1))} disabled={historyPage === totalPages}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
