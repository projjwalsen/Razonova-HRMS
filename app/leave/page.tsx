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
} from 'lucide-react';

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'requests' | 'approvals' | 'balance'>('overview');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.leave-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0'; // Start hidden
    });
  }, [activeTab, showApplyForm]);

  const leaveBalances = [
    { type: 'Annual Leave', total: 20, used: 5, remaining: 15, icon: CalendarDays },
    { type: 'Sick Leave', total: 10, used: 2, remaining: 8, icon: UserCheck },
    { type: 'Casual Leave', total: 7, used: 3, remaining: 4, icon: Clock },
    { type: 'Maternity/Paternity', total: 90, used: 0, remaining: 90, icon: Users },
  ];

  const myLeaveRequests = [
    {
      id: 1,
      type: 'Annual Leave',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      days: 5,
      reason: 'Family vacation',
      status: 'Approved',
      appliedOn: '2024-03-15',
    },
    {
      id: 2,
      type: 'Sick Leave',
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      days: 3,
      reason: 'Medical treatment',
      status: 'Pending',
      appliedOn: '2024-03-18',
    },
    {
      id: 3,
      type: 'Casual Leave',
      startDate: '2024-03-10',
      endDate: '2024-03-11',
      days: 2,
      reason: 'Personal work',
      status: 'Approved',
      appliedOn: '2024-03-08',
    },
    {
      id: 4,
      type: 'Annual Leave',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      days: 6,
      reason: 'Travel',
      status: 'Rejected',
      appliedOn: '2024-02-10',
      rejectionReason: 'Insufficient leave balance',
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      employee: 'Jane Smith',
      employeeId: 'EMP002',
      type: 'Sick Leave',
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      days: 3,
      reason: 'Medical appointment and recovery',
      appliedOn: '2024-03-18',
    },
    {
      id: 2,
      employee: 'Mike Johnson',
      employeeId: 'EMP003',
      type: 'Annual Leave',
      startDate: '2024-03-25',
      endDate: '2024-03-29',
      days: 5,
      reason: 'Family function',
      appliedOn: '2024-03-17',
    },
    {
      id: 3,
      employee: 'Sarah Williams',
      employeeId: 'EMP004',
      type: 'Casual Leave',
      startDate: '2024-03-21',
      endDate: '2024-03-21',
      days: 1,
      reason: 'Personal errands',
      appliedOn: '2024-03-19',
    },
  ];

  const teamLeaveSchedule = [
    { date: '2024-03-20', employee: 'Jane Smith', type: 'Sick Leave', status: 'Approved' },
    { date: '2024-03-21', employee: 'Jane Smith', type: 'Sick Leave', status: 'Approved' },
    { date: '2024-03-25', employee: 'Mike Johnson', type: 'Annual Leave', status: 'Pending' },
    { date: '2024-04-01', employee: 'John Doe', type: 'Annual Leave', status: 'Approved' },
  ];

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Leave request submitted successfully!');
    setShowApplyForm(false);
    setLeaveType('casual');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleApprove = (id: number) => {
    alert(`Leave request ${id} approved!`);
  };

  const handleReject = (id: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      alert(`Leave request ${id} rejected! Reason: ${reason}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Annual Leave':
        return 'bg-blue-100 text-blue-700';
      case 'Sick Leave':
        return 'bg-red-100 text-red-700';
      case 'Casual Leave':
        return 'bg-yellow-100 text-yellow-700';
      case 'Maternity/Paternity':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 leave-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Leave Management</h1>
            <p className="text-gray-600 mt-1">Apply and manage leave requests</p>
          </div>
          <button
            onClick={() => setShowApplyForm(!showApplyForm)}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Apply for Leave
          </button>
        </div>

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
                  className="text-gray-600 hover:text-black"
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
                      <option value="casual">Casual Leave</option>
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="maternity">Maternity/Paternity Leave</option>
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

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Submit Request
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

        {/* Tabs */}
        <div className="mb-6 leave-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'balance'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Leave Balance
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'requests'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'approvals'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Team Overview
            </button>
          </div>
        </div>

        {/* Leave Balance */}
        {activeTab === 'balance' && (
          <div className="leave-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leaveBalances.map((balance, index) => {
                const Icon = balance.icon;
                return (
                  <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-12 h-12 text-black" />
                      <span className="text-sm text-gray-600">{balance.remaining} / {balance.total} days</span>
                    </div>
                    <h3 className="text-lg font-bold mb-4 font-['Montserrat']">{balance.type}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used</span>
                        <span className="font-semibold">{balance.used} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full"
                          style={{ width: `${(balance.used / balance.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining</span>
                        <span className="font-semibold text-green-600">{balance.remaining} days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Requests */}
        {activeTab === 'requests' && (
          <div className="leave-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
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
                    {myLeaveRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {request.startDate} to {request.endDate}
                        </td>
                        <td className="py-3 px-4 font-semibold">{request.days} days</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{request.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{request.appliedOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {activeTab === 'approvals' && (
          <div className="leave-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
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
                            <p className="font-semibold">{request.employee}</p>
                            <p className="text-xs text-gray-500">{request.employeeId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {request.startDate} to {request.endDate}
                        </td>
                        <td className="py-3 px-4 font-semibold">{request.days} days</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{request.reason}</td>
                        <td className="py-3 px-4 text-sm">{request.appliedOn}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center gap-1"
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
            </div>
          </div>
        )}

        {/* Team Overview */}
        {activeTab === 'overview' && (
          <div className="leave-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar View */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Team Leave Schedule
                  </h3>
                </div>
                <div className="space-y-3">
                  {teamLeaveSchedule.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {item.employee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.employee}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Statistics */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat'] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Leave Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Requests This Month</span>
                    <span className="text-2xl font-bold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-2xl font-bold text-green-600">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-2xl font-bold text-yellow-600">4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rejected</span>
                    <span className="text-2xl font-bold text-red-600">2</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Employees on Leave Today</span>
                      <span className="text-2xl font-bold">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
