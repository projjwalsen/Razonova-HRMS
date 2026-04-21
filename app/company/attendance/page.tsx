'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Clock, CheckCircle, XCircle, Settings, AlertCircle, X,
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
} from '@/store/actions/attendanceActions';
import { useAccess } from '@/lib/access';
import AttendanceTabs from './components/AttendanceTabs';
import ConfigTab from './components/ConfigTab';
import UserDetailModal from './components/UserDetailModal';

interface User {
  id: string;
  name?: string;
  email?: string;
}

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAccess();
  const {
    config, todayAttendance, attendanceHistory, monthlySummary,
    selectedUserAttendance,
    loading, saving, error,
  } = useAppSelector((state) => state.attendance);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'calendar' | 'requests' | 'config'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalType, setModalType] = useState<'today' | 'history' | 'summary'>('today');
  const [modalUserData, setModalUserData] = useState<AttendanceRecord | null>(null);
  const [configForm, setConfigForm] = useState<AttendanceConfig>({
    checkInTime: '', checkOutTime: '', graceMinutes: 0,
    halfDayMinutes: 0, fullDayMinutes: 0, workingDays: [],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      if (user.id) dispatch(fetchUserTodayAttendance(user.id));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttendanceConfig());
    dispatch(fetchTodayAttendance());
    dispatch(fetchAttendanceHistory());
    dispatch(fetchMonthlySummary());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUserAttendance) {
      if (selectedUserAttendance.checkIn) { setCheckInTime(selectedUserAttendance.checkIn); setIsCheckedIn(true); }
      if (selectedUserAttendance.checkOut) { setCheckOutTime(selectedUserAttendance.checkOut); setIsCheckedIn(false); }
      if (selectedUserAttendance.checkIn && !selectedUserAttendance.checkOut) setIsCheckedIn(true);
    }
  }, [selectedUserAttendance]);

  useEffect(() => { if (config) setConfigForm(config); }, [config]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const result = await dispatch(checkIn());
    if (checkIn.fulfilled.match(result)) {
      setCheckInTime(result.payload.checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setIsCheckedIn(true);
      if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
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
      if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
      dispatch(fetchTodayAttendance());
    }
    setCheckingOut(false);
  };

  const handleViewUser = async (userId: string, type: 'today' | 'history' | 'summary', record?: AttendanceRecord) => {
    setModalType(type);
    setShowUserModal(true);
    if (record) setModalUserData(record);
    else setModalUserData(null);
    if (type === 'today') await dispatch(fetchUserTodayAttendance(userId));
    else if (type === 'history') await dispatch(fetchUserAttendanceHistory(userId));
    else await dispatch(fetchUserMonthlySummary(userId));
  };

  const handleSaveConfig = async () => { await dispatch(saveAttendanceConfig(configForm)); };

  if (!hasPermission('ATTENDANCE:READ')) {
    return (
      <div className="p-8">
        <div className="p-8 bg-white rounded-2xl border-2 border-gray-100 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You do not have permission to access Attendance Management</p>
        </div>
      </div>
    );
  }

  const totalPresent = Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.presentDays || 0), 0) : 0;
  const totalAbsent = Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.absentDays || 0), 0) : 0;
  const totalLate = Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (s.lateDays || 0), 0) : 0;
  const totalHours = Array.isArray(monthlySummary) ? monthlySummary.reduce((sum, s) => sum + (parseFloat(s.totalHours) || 0), 0) : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
        </div>
        {hasPermission('ATTENDANCE:CONFIGURE') && (
          <button onClick={() => setActiveTab('config')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
            <Settings className="w-4 h-4" /> Config
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearAttendanceError())}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Days Present', value: totalPresent, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Days Absent', value: totalAbsent, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Late Arrivals', value: totalLate, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Total Hours', value: `${totalHours}h`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-6 rounded-xl border-2 ${color}`}>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Check In/Out */}
      <div className="mb-8 p-8 bg-white rounded-2xl border-2 border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center">
            <Clock className="w-8 h-8 text-[#0445AD] mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-gray-600">{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" /> Check In</div>
                <div className="text-2xl font-bold text-green-600">{checkInTime || '--:--'}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1"><XCircle className="w-4 h-4 text-red-600" /> Check Out</div>
                <div className="text-2xl font-bold text-red-600">{checkOutTime || '--:--'}</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            {!isCheckedIn ? (
              <button onClick={handleCheckIn} disabled={checkingIn} className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {checkingIn ? <span className="animate-spin">⟳</span> : <CheckCircle className="w-5 h-5" />} Check In
              </button>
            ) : (
              <button onClick={handleCheckOut} disabled={checkingOut} className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {checkingOut ? <span className="animate-spin">⟳</span> : <XCircle className="w-5 h-5" />} Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
          {([
            { key: 'today', label: "Today's Attendance" },
            { key: 'history', label: 'Attendance History' },
            // { key: 'calendar', label: 'Calendar View' },
            { key: 'requests', label: 'Regularization Requests' },
            { key: 'config', label: 'Configuration' },
          ] as { key: typeof activeTab; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === key ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'config' ? (
        <ConfigTab configForm={configForm} setConfigForm={setConfigForm} saving={saving} onSave={handleSaveConfig} canEdit={hasPermission('ATTENDANCE:CONFIGURE')} />
      ) : (
        <AttendanceTabs
          activeTab={activeTab}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          dateFilter={dateFilter} setDateFilter={setDateFilter}
          todayAttendance={todayAttendance}
          attendanceHistory={attendanceHistory}
          monthlySummary={monthlySummary}
          loading={loading}
          onViewUser={handleViewUser}
          onRefresh={() => { dispatch(fetchAttendanceHistory()); dispatch(fetchTodayAttendance()); }}
        />
      )}

      <UserDetailModal
        open={showUserModal}
        modalType={modalType}
        modalUserData={modalUserData}
        loading={loading}
        onClose={() => { setShowUserModal(false); setModalUserData(null); dispatch(clearSelectedUser()); }}
      />
    </div>
  );
}
