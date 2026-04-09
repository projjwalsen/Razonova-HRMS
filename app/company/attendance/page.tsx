'use client';

import { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAttendanceConfig,
  saveAttendanceConfig,
  fetchTodayAttendance,
  fetchUserTodayAttendance,
  fetchAttendanceHistory,
  fetchUserAttendanceHistory,
  fetchMonthlySummary,
  fetchUserMonthlySummary,
  checkIn,
  checkOut,
  clearAttendanceError,
  clearSelectedUser,
  AttendanceConfig,
  AttendanceRecord,
  AttendanceSummary,
} from '@/store/actions/attendanceActions';

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  tenantId?: string;
}

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const {
    config,
    todayAttendance,
    attendanceHistory,
    monthlySummary,
    selectedUserAttendance,
    selectedUserSummary,
    loading,
    saving,
    error,
  } = useAppSelector((state) => state.attendance);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'calendar' | 'requests' | 'config'>('today');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const contentRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalType, setModalType] = useState<'today' | 'history' | 'summary'>('today');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalUserData, setModalUserData] = useState<AttendanceRecord | null>(null);

  // Config form state
  const [configForm, setConfigForm] = useState<AttendanceConfig>({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    graceMinutes: 15,
    halfDayMinutes: 240,
    fullDayMinutes: 480,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      if (user.id) {
        dispatch(fetchUserTodayAttendance(user.id));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttendanceConfig());
    dispatch(fetchTodayAttendance());
    dispatch(fetchAttendanceHistory());
    dispatch(fetchMonthlySummary());
  }, [dispatch]);

  // Update check-in/check-out times based on current user's attendance
  useEffect(() => {
    if (selectedUserAttendance) {
      if (selectedUserAttendance.checkIn) {
        setCheckInTime(selectedUserAttendance.checkIn);
        setIsCheckedIn(true);
      }
      if (selectedUserAttendance.checkOut) {
        setCheckOutTime(selectedUserAttendance.checkOut);
        setIsCheckedIn(false);
      }
      if (selectedUserAttendance.checkIn && !selectedUserAttendance.checkOut) {
        setIsCheckedIn(true);
      }
    }
  }, [selectedUserAttendance]);

  useEffect(() => {
    if (config) {
      setConfigForm(config);
    }
  }, [config]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.attendance-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const result = await dispatch(checkIn());
    if (checkIn.fulfilled.match(result)) {
      setCheckInTime(result.payload.checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setIsCheckedIn(true);
      if (currentUser?.id) {
        dispatch(fetchUserTodayAttendance(currentUser.id));
      }
      dispatch(fetchTodayAttendance());
    }
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    const result = await dispatch(checkOut());
    if (checkOut.fulfilled.match(result)) {
      setCheckOutTime(result.payload.checkOut || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setIsCheckedIn(false);
      if (currentUser?.id) {
        dispatch(fetchUserTodayAttendance(currentUser.id));
      }
      dispatch(fetchTodayAttendance());
    }
    setCheckingOut(false);
  };

  const handleSaveConfig = async () => {
    await dispatch(saveAttendanceConfig(configForm));
  };

  const handleViewUser = async (userId: string, type: 'today' | 'history' | 'summary', record?: AttendanceRecord) => {
    setSelectedUserId(userId);
    setModalType(type);
    setShowUserModal(true);

    // Set modal data from record if available
    if (record) {
      setModalUserData(record);
    } else {
      setModalUserData(null);
    }

    if (type === 'today') {
      await dispatch(fetchUserTodayAttendance(userId));
    } else if (type === 'history') {
      await dispatch(fetchUserAttendanceHistory(userId));
    } else {
      await dispatch(fetchUserMonthlySummary(userId));
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUserId(null);
    setModalUserData(null);
    dispatch(clearSelectedUser());
  };

  const getStatusColor = (status: string) => {
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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    const upperStatus = (status || '').toUpperCase();
    switch (upperStatus) {
      case 'PRESENT':
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'ABSENT':
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1).toLowerCase();
  };

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
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

  const filteredTodayAttendance = todayAttendance.filter(
    (record) =>
      (record.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredHistory = attendanceHistory.filter((record) => {
    const matchesSearch =
      (record.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesDate =
      (!dateFilter.from || record.date >= dateFilter.from) &&
      (!dateFilter.to || record.date <= dateFilter.to);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 attendance-item flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Attendance Management</h1>
            <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
          </div>
          <button
            onClick={() => setActiveTab('config')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Config
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearAttendanceError())} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 attendance-item">
          <div className="p-6 rounded-xl border-2 bg-green-50 border-green-200">
            <div className="text-3xl font-bold font-['Montserrat'] mb-1 text-green-700">
              {Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.presentDays || 0), 0) : 0}
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Days Present</div>
            <div className="text-xs text-gray-500">This month</div>
          </div>
          <div className="p-6 rounded-xl border-2 bg-red-50 border-red-200">
            <div className="text-3xl font-bold font-['Montserrat'] mb-1 text-red-700">
              {Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.absentDays || 0), 0) : 0}
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Days Absent</div>
            <div className="text-xs text-gray-500">This month</div>
          </div>
          <div className="p-6 rounded-xl border-2 bg-yellow-50 border-yellow-200">
            <div className="text-3xl font-bold font-['Montserrat'] mb-1 text-yellow-700">
              {Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.lateDays || 0), 0) : 0}
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Late Arrivals</div>
            <div className="text-xs text-gray-500">This month</div>
          </div>
          <div className="p-6 rounded-xl border-2 bg-blue-50 border-blue-200">
            <div className="text-3xl font-bold font-['Montserrat'] mb-1 text-blue-700">
              {Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (parseFloat(s.totalHours) || 0), 0) : 0}h
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Total Hours</div>
            <div className="text-xs text-gray-500">This month</div>
          </div>
        </div>

        {/* Check In/Out Card */}
        <div className="mb-8 attendance-item">
          <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-8 h-8 text-[#0445AD]" />
                </div>
                <div className="text-5xl font-bold font-['Montserrat'] mb-2">
                  {currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-600">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Check In
                    </div>
                    <div className="text-2xl font-bold text-green-600 font-['Montserrat']">
                      {checkInTime || '--:--'}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Check Out
                    </div>
                    <div className="text-2xl font-bold text-red-600 font-['Montserrat']">
                      {checkOutTime || '--:--'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingIn ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Check In
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={checkingOut}
                    className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingOut ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Check Out
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 attendance-item">
          <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'today'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Today's Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Regularization Requests
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'config'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Configuration
            </button>
          </div>
        </div>

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="attendance-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Attendance Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Check In Time</label>
                  <input
                    type="time"
                    value={configForm.checkInTime}
                    onChange={(e) => setConfigForm({ ...configForm, checkInTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Check Out Time</label>
                  <input
                    type="time"
                    value={configForm.checkOutTime}
                    onChange={(e) => setConfigForm({ ...configForm, checkOutTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Grace Minutes</label>
                  <input
                    type="number"
                    value={configForm.graceMinutes}
                    onChange={(e) => setConfigForm({ ...configForm, graceMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Half Day Minutes</label>
                  <input
                    type="number"
                    value={configForm.halfDayMinutes}
                    onChange={(e) => setConfigForm({ ...configForm, halfDayMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Day Minutes</label>
                  <input
                    type="number"
                    value={configForm.fullDayMinutes}
                    onChange={(e) => setConfigForm({ ...configForm, fullDayMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Today's Attendance */}
        {activeTab === 'today' && (
          <div className="attendance-item">
            {/* Search */}
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
            ) : filteredTodayAttendance.length === 0 ? (
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
                      {filteredTodayAttendance.map((record) => (
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
                              onClick={() => handleViewUser(record.userId, 'today', record)}
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
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="attendance-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              {/* Month Navigation */}
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

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
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

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded" />
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded" />
                  <span>Weekend</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance History */}
        {activeTab === 'history' && (
          <div className="attendance-item">
            {/* Filters */}
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
                    onClick={() => dispatch(fetchAttendanceHistory())}
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
            ) : filteredHistory.length === 0 ? (
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
                      {filteredHistory.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="font-medium">{record.userName}</div>
                            <div className="text-xs text-gray-500">{record.userEmail}</div>
                          </td>
                          <td className="py-3 px-4">{record.date ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
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
                              onClick={() => handleViewUser(record.userId, 'history', record)}
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
        )}

        {/* Regularization Requests */}
        {activeTab === 'requests' && (
          <div className="attendance-item">
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Regularization requests will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {modalType === 'today' ? "Today's Attendance" : modalType === 'history' ? 'Attendance History' : 'Monthly Summary'}
              </h3>
              <button onClick={closeUserModal} className="p-1 text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                </div>
              ) : (modalType !== 'summary' && modalUserData) ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{modalUserData.userName || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500">{modalUserData.userEmail || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Check In</div>
                      <div className="text-xl font-bold">{modalUserData.checkIn || '--:--'}</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Check Out</div>
                      <div className="text-xl font-bold">{modalUserData.checkOut || '--:--'}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 mt-1 ${getStatusColor(modalUserData.status)}`}>
                          {getStatusIcon(modalUserData.status)}
                          {formatStatus(modalUserData.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Hours Worked</div>
                        <div className="text-xl font-bold">{modalUserData.hoursWorked || '-'}</div>
                      </div>
                    </div>
                  </div>
                  {modalUserData.remarks && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Remarks</div>
                      <div className="text-sm">{modalUserData.remarks}</div>
                    </div>
                  )}
                  {modalUserData.date && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Date</div>
                      <div className="text-sm font-medium">{new Date(modalUserData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  )}
                </div>
              ) : selectedUserAttendance || selectedUserSummary ? (
                modalType === 'summary' && selectedUserSummary ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">{selectedUserSummary.userName}</h4>
                      <p className="text-sm text-gray-500">
                        {selectedUserSummary.month} {selectedUserSummary.year}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{selectedUserSummary.presentDays}</div>
                        <div className="text-sm text-gray-600">Days Present</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">{selectedUserSummary.absentDays}</div>
                        <div className="text-sm text-gray-600">Days Absent</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">{selectedUserSummary.lateDays}</div>
                        <div className="text-sm text-gray-600">Late Days</div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-700">{selectedUserSummary.halfDays}</div>
                        <div className="text-sm text-gray-600">Half Days</div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{selectedUserSummary.totalHours}h</div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                      <div className="text-xs text-gray-500 mt-1">Avg: {selectedUserSummary.averageHoursPerDay}h/day</div>
                    </div>
                  </div>
                ) : selectedUserAttendance ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{selectedUserAttendance.userName}</h4>
                      <p className="text-sm text-gray-500">{selectedUserAttendance.userEmail}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Check In</div>
                        <div className="text-xl font-bold">{selectedUserAttendance.checkIn || '--:--'}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Check Out</div>
                        <div className="text-xl font-bold">{selectedUserAttendance.checkOut || '--:--'}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 mt-1 ${getStatusColor(selectedUserAttendance.status)}`}>
                            {getStatusIcon(selectedUserAttendance.status)}
                            {formatStatus(selectedUserAttendance.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Hours Worked</div>
                          <div className="text-xl font-bold">{selectedUserAttendance.hoursWorked || '-'}</div>
                        </div>
                      </div>
                    </div>
                    {selectedUserAttendance.remarks && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Remarks</div>
                        <div className="text-sm">{selectedUserAttendance.remarks}</div>
                      </div>
                    )}
                  </div>
                ) : null
              ) : (
                <p className="text-center text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
