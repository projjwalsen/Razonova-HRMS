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
  Send,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  checkIn,
  checkOut,
  fetchUserTodayAttendance,
  fetchUserAttendanceHistory,
  createRegularizationRequest,
  fetchMyRegularizationRequests,
  AttendanceRecord,
  AttendanceRegularizationRequest,
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
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'regularization'>('today');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [regularizationDate, setRegularizationDate] = useState('');
  const [regularizationCheckIn, setRegularizationCheckIn] = useState('');
  const [regularizationCheckOut, setRegularizationCheckOut] = useState('');
  const [regularizationReason, setRegularizationReason] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [myRequests, setMyRequests] = useState<AttendanceRegularizationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  // ── Geolocation helpers ──────────────────────────────────────────────────

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationLoading(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setLocationLoading(false);
          let msg = 'Unable to get location';
          if (err.code === 1) msg = 'Location permission denied';
          else if (err.code === 2) msg = 'Location unavailable';
          else if (err.code === 3) msg = 'Location request timed out';
          reject(new Error(msg));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.display_name;
    } catch {
      return undefined;
    }
  };

  // ── End helpers ────────────────────────────────────────────────────────
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
    if (activeTab === 'regularization' && currentUser?.id) {
      setLoadingRequests(true);
      dispatch(fetchMyRegularizationRequests()).then((result) => {
        setLoadingRequests(false);
        if (fetchMyRegularizationRequests.fulfilled.match(result)) {
          setMyRequests(Array.isArray(result.payload) ? result.payload : []);
        }
      });
    }
  }, [activeTab, currentUser, dispatch, records.length]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setLocalError(null);
    setSuccessMsg(null);
    setLocationError(null);

    try {
      const position = await getCurrentLocation();
      const { lat, lng } = position;
      const address = await reverseGeocode(lat, lng);
      setLastLocation({ lat, lng, address });

      const result = await dispatch(checkIn({ lat, lng, address }));
      if (checkIn.fulfilled.match(result)) {
        setSuccessMsg('Checked in successfully!');
        if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
      } else {
        setLocalError((result.payload as string) || 'Check-in failed');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Check-in failed');
    }

    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setLocalError(null);
    setSuccessMsg(null);
    setLocationError(null);

    try {
      const position = await getCurrentLocation();
      const { lat, lng } = position;
      const address = await reverseGeocode(lat, lng);
      setLastLocation({ lat, lng, address });

      const result = await dispatch(checkOut({ lat, lng, address }));
      if (checkOut.fulfilled.match(result)) {
        setSuccessMsg('Checked out successfully!');
        if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
      } else {
        setLocalError((result.payload as string) || 'Check-out failed');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Check-out failed');
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
      if (activeTab === 'regularization') {
        setLoadingRequests(true);
        dispatch(fetchMyRegularizationRequests()).then((result) => {
          setLoadingRequests(false);
          if (fetchMyRegularizationRequests.fulfilled.match(result)) {
            setMyRequests(Array.isArray(result.payload) ? result.payload : []);
          }
        });
      }
    }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regularizationDate) { setRegError('Date is required'); return; }
    if (!regularizationReason.trim()) { setRegError('Reason is required'); return; }
    if (!regularizationCheckIn && !regularizationCheckOut) { setRegError('At least one of Check-in or Check-out time is required'); return; }

    const checkInISO = regularizationCheckIn
      ? new Date(`${regularizationDate}T${regularizationCheckIn}:00`).toISOString()
      : undefined;
    const checkOutISO = regularizationCheckOut
      ? new Date(`${regularizationDate}T${regularizationCheckOut}:00`).toISOString()
      : undefined;

    const result = await dispatch(createRegularizationRequest({
      date: regularizationDate,
      requestedCheckInAt: checkInISO,
      requestedCheckOutAt: checkOutISO,
      reason: regularizationReason,
    }));

    if (createRegularizationRequest.fulfilled.match(result)) {
      setRegSuccess('Regularization request submitted successfully!');
      setRegularizationDate('');
      setRegularizationCheckIn('');
      setRegularizationCheckOut('');
      setRegularizationReason('');
      setMyRequests((prev) => [result.payload, ...prev]);
    } else {
      setRegError((result.payload as string) || 'Failed to submit request');
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
          {(['today', 'history', 'regularization'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setHistoryPage(1); setSearchTerm(''); }}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#0445AD] text-[#0445AD]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'today' ? "Today's Attendance" : tab === 'history' ? 'Attendance History' : 'Regularization'}
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

          {/* Out Duty / Restricted Notice */}
          {today?.actionState?.disableCheckIn && today?.actionState?.disableCheckOut && today?.actionState?.reason ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-700 font-semibold text-base">{today.actionState.reason}</p>
            </div>
          ) : (
            <>
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
                today?.actionState?.disableCheckIn ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-medium mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Check-in Disabled
                    </div>
                    {today?.actionState?.reason && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">{today.actionState.reason}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn || locationLoading}
                    className="w-full py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    {checkingIn || locationLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {locationLoading ? 'Getting location...' : checkingIn ? 'Checking in...' : 'Check In'}
                  </button>
                )
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
                today?.actionState?.disableCheckOut ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-medium mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Check-out Disabled
                    </div>
                    {today?.actionState?.reason && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">{today.actionState.reason}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={!isCheckedIn || checkingOut || locationLoading}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    {checkingOut || locationLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {locationLoading ? 'Getting location...' : checkingOut ? 'Checking out...' : 'Check Out'}
                  </button>
                )
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
          </>
          )}

          {/* Location Info */}
          {lastLocation && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0445AD] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700">Location Captured</p>
                  {lastLocation.address ? (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lastLocation.address}</p>
                  ) : null}
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <MapPin className="w-4 h-4 shrink-0" />
              {locationError}
            </div>
          )}
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

      {/* Regularization Tab */}
      {activeTab === 'regularization' && (
        <div className="space-y-5">
          {/* Request Form */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-[#0445AD] to-[#033080] text-white">
              <h2 className="text-base font-bold">Request Attendance Regularization</h2>
              <p className="text-xs text-white/70 mt-0.5">Submit a correction for missed or wrong attendance</p>
            </div>
            <form onSubmit={handleRegSubmit} className="p-6 space-y-4">
              {regError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <XCircle className="w-4 h-4 shrink-0" />{regError}
                </div>
              )}
              {regSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 shrink-0" />{regSuccess}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={regularizationDate}
                    onChange={(e) => setRegularizationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Requested Check-In</label>
                  <input
                    type="time"
                    value={regularizationCheckIn}
                    onChange={(e) => setRegularizationCheckIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Requested Check-Out</label>
                  <input
                    type="time"
                    value={regularizationCheckOut}
                    onChange={(e) => setRegularizationCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Reason <span className="text-red-500">*</span></label>
                <textarea
                  value={regularizationReason}
                  onChange={(e) => setRegularizationReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why you need this regularization (e.g., forgot to check in due to network issue)..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-[#033080] transition-all"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => { setRegularizationDate(''); setRegularizationCheckIn(''); setRegularizationCheckOut(''); setRegularizationReason(''); setRegError(''); setRegSuccess(''); }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-gray-400">At least one of Check-in or Check-out time is required. Backend will match a policy to route your request to the appropriate approver.</p>
            </form>
          </div>

          {/* My Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">My Regularization Requests</h2>
              <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-[#0445AD] hover:bg-blue-50 rounded-lg transition">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-10"><div className="h-6 w-6 border-2 border-[#0445AD] border-t-transparent rounded-full animate-spin" /></div>
            ) : myRequests.length === 0 ? (
              <div className="p-10 text-center">
                <Clock className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No regularization requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Date', 'Check-In Requested', 'Check-Out Requested', 'Reason', 'Status', 'Submitted'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3.5 text-sm text-gray-800">
                          {req.date ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {req.requestedCheckInAt ? new Date(req.requestedCheckInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {req.requestedCheckOutAt ? new Date(req.requestedCheckOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {formatStatus(req.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
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
    </div>
  );
}
