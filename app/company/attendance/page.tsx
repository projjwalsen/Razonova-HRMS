'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Search,
  Filter,
} from 'lucide-react';

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'calendar' | 'requests'>('today');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove GSAP animation - no more blur
    // Elements animate smoothly with CSS instead
    const items = contentRef.current?.querySelectorAll('.attendance-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0'; // Start hidden
    });
  }, [activeTab]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setIsCheckedIn(false);
  };

  const todayAttendance = [
    { id: 1, employee: 'John Doe', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9h 0m' },
    { id: 2, employee: 'Jane Smith', checkIn: '08:45 AM', checkOut: '05:45 PM', status: 'Present', hours: '9h 0m' },
    { id: 3, employee: 'Mike Johnson', checkIn: '09:15 AM', checkOut: null, status: 'Working', hours: '3h 30m' },
    { id: 4, employee: 'Sarah Williams', checkIn: null, checkOut: null, status: 'Absent', hours: '-' },
    { id: 5, employee: 'David Brown', checkIn: '08:30 AM', checkOut: '05:30 PM', status: 'Present', hours: '9h 0m' },
  ];

  const attendanceHistory = [
    { date: '2024-03-18', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9h 0m' },
    { date: '2024-03-17', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9h 0m' },
    { date: '2024-03-16', checkIn: null, checkOut: null, status: 'Weekend', hours: '-' },
    { date: '2024-03-15', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9h 0m' },
    { date: '2024-03-14', checkIn: '09:15 AM', checkOut: '06:15 PM', status: 'Present', hours: '9h 0m' },
  ];

  const regularizeRequests = [
    { id: 1, employee: 'John Doe', date: '2024-03-15', reason: 'Traffic delay', requestedTime: '09:30 AM', status: 'Pending' },
    { id: 2, employee: 'Jane Smith', date: '2024-03-14', reason: 'Medical emergency', requestedTime: '10:00 AM', status: 'Approved' },
  ];

  const attendanceStats = [
    { label: 'Days Present', value: '18', change: '+2 from last month', color: 'green' },
    { label: 'Days Absent', value: '2', change: '-1 from last month', color: 'red' },
    { label: 'Late Arrivals', value: '3', change: 'Same as last month', color: 'yellow' },
    { label: 'Total Hours', value: '162h', change: '+12h from last month', color: 'blue' },
  ];

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
    // Simulated attendance data
    const dayNum = day % 7;
    if (dayNum === 0 || dayNum === 6) return 'weekend';
    if (day === 5 || day === 12) return 'absent';
    if (day === 8 || day === 15) return 'late';
    return 'present';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700';
      case 'Absent':
        return 'bg-red-100 text-red-700';
      case 'Working':
        return 'bg-blue-100 text-blue-700';
      case 'Weekend':
        return 'bg-gray-100 text-gray-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
      case 'Working':
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Absent':
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 attendance-item">
          <h1 className="text-3xl font-bold font-['Montserrat']">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
        </div>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 attendance-item">
          {attendanceStats.map((stat, index) => {
            const colorClasses = {
              green: 'bg-green-50 border-green-200',
              red: 'bg-red-50 border-red-200',
              yellow: 'bg-yellow-50 border-yellow-200',
              blue: 'bg-blue-50 border-blue-200',
            };
            return (
              <div key={index} className={`p-6 rounded-xl border-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <div className="text-3xl font-bold font-['Montserrat'] mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.change}</div>
              </div>
            );
          })}
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
                    className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Check In
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Check Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 attendance-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'today'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Today's Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'history'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              My History
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'calendar'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'requests'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Regularization Requests
            </button>
          </div>
        </div>

        {/* Today's Attendance */}
        {activeTab === 'today' && (
          <div className="attendance-item">
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
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{record.employee}</td>
                        <td className="py-3 px-4">{record.checkIn || '-'}</td>
                        <td className="py-3 px-4">{record.checkOut || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{record.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                  <label className="block text-sm font-semibold mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Status Filter</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                    <option>All</option>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>Weekend</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Check Out</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Hours Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{record.date}</td>
                        <td className="py-3 px-4">{record.checkIn || '-'}</td>
                        <td className="py-3 px-4">{record.checkOut || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{record.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Regularization Requests */}
        {activeTab === 'requests' && (
          <div className="attendance-item">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold font-['Montserrat']">Regularization Requests</h2>
              <button className="px-6 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                New Request
              </button>
            </div>
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Requested Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Reason</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularizeRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{request.date}</td>
                        <td className="py-3 px-4">{request.requestedTime}</td>
                        <td className="py-3 px-4">{request.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {request.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
