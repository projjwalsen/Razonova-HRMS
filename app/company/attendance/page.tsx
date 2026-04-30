'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Clock, CheckCircle, XCircle, Settings, AlertCircle, X, MapPin, RefreshCw, Briefcase, Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserSelectOptions } from '@/store/actions/authActions';
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
  fetchOutDutyRecords,
  createOutDuty,
  deleteOutDutyRecord,
  AttendanceConfig,
  AttendanceRecord,
  OutDutyRecord,
} from '@/store/actions/attendanceActions';
import { useAccess } from '@/lib/access';
import AttendanceTabs from './components/AttendanceTabs';
import ConfigTab from './components/ConfigTab';
import UserDetailModal from './components/UserDetailModal';
import RegularizationTabs from './components/RegularizationTabs';

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
    selectedUserAttendance, outDutyRecords, outDutyLoading,
    loading, saving, error,
  } = useAppSelector((state) => state.attendance);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'calendar' | 'requests' | 'config' | 'regularization' | 'outDuty'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalType, setModalType] = useState<'today' | 'history' | 'summary'>('today');
  const [modalUserData, setModalUserData] = useState<AttendanceRecord | null>(null);
  const [configForm, setConfigForm] = useState<AttendanceConfig>({
    checkInTime: '', checkOutTime: '', graceMinutes: 0,
    halfDayMinutes: 0, fullDayMinutes: 0, workingDays: [],
  });

  // Out Duty
  const [showOutDutyModal, setShowOutDutyModal] = useState(false);
  const [outDutyForm, setOutDutyForm] = useState({ userId: '', startDate: '', endDate: '', reason: '' });
  const [submittingOutDuty, setSubmittingOutDuty] = useState(false);
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);

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
    dispatch(fetchOutDutyRecords());
  }, [dispatch]);

  const openOutDutyModal = async () => {
    setShowOutDutyModal(true);
    setOutDutyForm({ userId: '', startDate: '', endDate: '', reason: '' });
    const result = await dispatch(fetchUserSelectOptions());
    if (fetchUserSelectOptions.fulfilled.match(result)) {
      setUserOptions(result.payload);
    }
  };

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

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationLoading(false); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        (err) => { setLocationLoading(false); let msg = 'Unable to get location'; if (err.code === 1) msg = 'Location permission denied'; reject(new Error(msg)); },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.display_name;
    } catch { return undefined; }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setLocationError(null);
    try {
      const { lat, lng } = await getCurrentLocation();
      const address = await reverseGeocode(lat, lng);
      setLastLocation({ lat, lng, address });
      const result = await dispatch(checkIn({ lat, lng, address }));
      if (checkIn.fulfilled.match(result)) {
        setCheckInTime(result.payload.checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setIsCheckedIn(true);
        if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
        dispatch(fetchTodayAttendance());
      }
    } catch (err: any) { setLocationError(err.message); }
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setLocationError(null);
    try {
      const { lat, lng } = await getCurrentLocation();
      const address = await reverseGeocode(lat, lng);
      setLastLocation({ lat, lng, address });
      const result = await dispatch(checkOut({ lat, lng, address }));
      if (checkOut.fulfilled.match(result)) {
        setCheckOutTime(result.payload.checkOut || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setIsCheckedIn(false);
        if (currentUser?.id) dispatch(fetchUserTodayAttendance(currentUser.id));
        dispatch(fetchTodayAttendance());
      }
    } catch (err: any) { setLocationError(err.message); }
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
      <div className="w-full p-8">
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
    <div className="w-full p-8">
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
        {hasPermission('ATTENDANCE:READ') && (
          <button onClick={openOutDutyModal} className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition-all flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Mark Out Duty
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

      {/* Location Error */}
      {locationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-3">
          <MapPin className="w-4 h-4 shrink-0" /> {locationError}
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
              <button onClick={handleCheckIn} disabled={checkingIn || locationLoading} className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {checkingIn || locationLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} {locationLoading ? 'Getting location...' : checkingIn ? 'Checking in...' : 'Check In'}
              </button>
            ) : (
              <button onClick={handleCheckOut} disabled={checkingOut || locationLoading} className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {checkingOut || locationLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />} {locationLoading ? 'Getting location...' : checkingOut ? 'Checking out...' : 'Check Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Info */}
      {lastLocation && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[#0445AD] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700">Location Captured</p>
            {lastLocation.address && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lastLocation.address}</p>}
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
          {([
            { key: 'today', label: "Today's Attendance" },
            { key: 'history', label: 'Attendance History' },
            // { key: 'calendar', label: 'Calendar View' },
            { key: 'requests', label: 'Regularization Requests' },
            { key: 'regularization', label: 'Regularization Admin' },
            { key: 'config', label: 'Configuration' },
            { key: 'outDuty', label: 'Out Duty' },
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
      ) : activeTab === 'regularization' ? (
        <RegularizationTabs />
      ) : activeTab === 'outDuty' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Out Duty Records</h3>
            <button onClick={openOutDutyModal} className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Mark Out Duty
            </button>
          </div>
          {outDutyLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : outDutyRecords.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No out-duty records found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Employee</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Start Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">End Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Reason</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outDutyRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{record.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{record.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{record.startDate ? new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                      <td className="px-6 py-4 text-sm">{record.endDate ? new Date(record.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${record.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => dispatch(deleteOutDutyRecord(record.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <AttendanceTabs
          activeTab={activeTab as 'today' | 'history' | 'calendar' | 'requests'}
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

      {/* Out Duty Modal */}
      {showOutDutyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">Mark Out Duty</h2>
              <button onClick={() => setShowOutDutyModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Employee *</label>
                <select value={outDutyForm.userId} onChange={(e) => setOutDutyForm({ ...outDutyForm, userId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]">
                  <option value="">Select employee</option>
                  {userOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Date *</label>
                  <input type="date" value={outDutyForm.startDate} onChange={(e) => setOutDutyForm({ ...outDutyForm, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Date *</label>
                  <input type="date" value={outDutyForm.endDate} onChange={(e) => setOutDutyForm({ ...outDutyForm, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Reason *</label>
                <textarea value={outDutyForm.reason} onChange={(e) => setOutDutyForm({ ...outDutyForm, reason: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD] resize-none" placeholder="Reason for out duty..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowOutDutyModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button
                onClick={async () => {
                  if (!outDutyForm.userId || !outDutyForm.startDate || !outDutyForm.endDate || !outDutyForm.reason) { alert('All fields are required'); return; }
                  setSubmittingOutDuty(true);
                  const result = await dispatch(createOutDuty(outDutyForm));
                  setSubmittingOutDuty(false);
                  if (createOutDuty.fulfilled.match(result)) {
                    dispatch(fetchOutDutyRecords());
                    setShowOutDutyModal(false);
                    setOutDutyForm({ userId: '', startDate: '', endDate: '', reason: '' });
                  } else { alert((result.payload as string) || 'Failed to create out-duty record'); }
                }}
                disabled={submittingOutDuty}
                className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition disabled:opacity-50"
              >
                {submittingOutDuty ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
