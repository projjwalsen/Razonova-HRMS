'use client';

import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { AttendanceRecord, AttendanceSummary } from '@/store/actions/attendanceActions';

function getStatusColor(status: string) {
  switch ((status || '').toUpperCase()) {
    case 'PRESENT':
    case 'APPROVED': return 'bg-green-100 text-green-700';
    case 'ABSENT':
    case 'REJECTED': return 'bg-red-100 text-red-700';
    case 'LATE': return 'bg-yellow-100 text-yellow-700';
    case 'HALF_DAY': return 'bg-orange-100 text-orange-700';
    case 'PENDING': return 'bg-blue-100 text-blue-700';
    case 'ON_LEAVE': return 'bg-purple-100 text-purple-700';
    case 'HOLIDAY': return 'bg-pink-100 text-pink-700';
    case 'WEEK_OFF': return 'bg-gray-200 text-gray-600';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getStatusIcon(status: string) {
  switch ((status || '').toUpperCase()) {
    case 'PRESENT': case 'APPROVED': return <span>✓</span>;
    case 'ABSENT': case 'REJECTED': return <span>✗</span>;
    case 'LATE': return <span>!</span>;
    default: return <Clock className="w-4 h-4" />;
  }
}

function formatStatus(status: string) {
  if (!status) return '';
  const labels: Record<string, string> = {
    PRESENT: 'Present', ABSENT: 'Absent', LATE: 'Late', HALF_DAY: 'Half Day',
    ON_LEAVE: 'On Leave', HOLIDAY: 'Holiday', WEEK_OFF: 'Week Off', PENDING: 'Pending',
    APPROVED: 'Approved', REJECTED: 'Rejected',
  };
  return labels[status.toUpperCase()] || status.replace(/_/g, ' ');
}

interface Props {
  open: boolean;
  modalType: 'today' | 'history' | 'summary';
  modalUserData: AttendanceRecord | null;
  loading: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ open, modalType, modalUserData, loading, onClose }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {modalType === 'today' ? "Today's Attendance" : modalType === 'history' ? 'Attendance History' : 'Monthly Summary'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
            </div>
          ) : modalUserData ? (
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
                  <div className="text-sm font-medium">
                    {new Date(modalUserData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
