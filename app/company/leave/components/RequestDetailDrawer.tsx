'use client';

import { X, Check, FileText, Download } from 'lucide-react';
import { LeaveRequest } from '@/store/actions/leaveActions';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
};

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const getInitials = (name: string) =>
  (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface Props {
  request: LeaveRequest;
  onClose: () => void;
}

export default function RequestDetailDrawer({ request, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Leave Request Details</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-lg font-bold">
              {getInitials(request.employeeName || request.user?.name || '')}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{request.employeeName || request.user?.name || '—'}</p>
              <p className="text-sm text-gray-400">{request.employeeEmail || request.user?.email || ''}</p>
            </div>
          </div>

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
                {badge
                  ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status || '']}`}>{value}</span>
                  : <p className="text-sm font-semibold text-gray-900">{value}</p>}
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Reason</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{request.reason || '—'}</p>
          </div>

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
