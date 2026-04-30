'use client';

import { useEffect, useState } from 'react';
import {
  HandCoins,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  X,
  RefreshCw,
  Eye,
  Settings,
  Download,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMyPayrollRecords,
  fetchMyPayrollDetail,
  fetchPayslipPreview,
  downloadPayslip,
  fetchEmployeePayrollComponents,
  clearMyPayslipDetail,
  clearPayrollError,
  clearPayrollSuccess,
  PayrollRecord,
  PayrollItemType,
  EmployeePayrollComponentsDetail,
} from '@/store/actions/payrollActions';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-blue-100 text-blue-700',
  PROCESSED: 'bg-green-100 text-green-700',
  DISBURSING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const ITEM_TYPE_COLORS: Record<PayrollItemType, string> = {
  EARNING: 'bg-green-50 text-green-700',
  ALLOWANCE: 'bg-blue-50 text-blue-700',
  DEDUCTION: 'bg-red-50 text-red-700',
  TAX: 'bg-orange-50 text-orange-700',
  BONUS: 'bg-purple-50 text-purple-700',
};

const fmt = (n: number | undefined | null) => n?.toLocaleString('en-IN') ?? '0';

const formatMonth = (m: number, y: number) =>
  new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
    {status === 'PAID' || status === 'PROCESSED' ? (
      <CheckCircle className="w-3.5 h-3.5" />
    ) : status === 'FAILED' || status === 'CANCELLED' ? (
      <XCircle className="w-3.5 h-3.5" />
    ) : (
      <Clock className="w-3.5 h-3.5" />
    )}
    {status}
  </span>
);

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 font-medium">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────
// PAY STRUCTURE SECTION
// ─────────────────────────────────────────────
const PayStructureSection = ({
  components,
  loading,
}: {
  components: EmployeePayrollComponentsDetail | null;
  loading: boolean;
}) => {
  const allComponents = components?.components || [];
  const earnings = allComponents.filter(
    (c) => c.payrollMasterComponent?.type === 'EARNING' || c.payrollMasterComponent?.type === 'ALLOWANCE'
  );
  const deductions = allComponents.filter(
    (c) => c.payrollMasterComponent?.type === 'DEDUCTION' || c.payrollMasterComponent?.type === 'TAX'
  );
  const bonuses = allComponents.filter((c) => c.payrollMasterComponent?.type === 'BONUS');

  if (loading && !components) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#0445AD]/10 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#0445AD]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Pay Structure</h2>
            <p className="text-sm text-gray-500">Your salary components</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#0445AD]/10 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#0445AD]" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">My Pay Structure</h2>
          <p className="text-sm text-gray-500">
            {components?.payStructure ? `${components.payStructure.name} · Base ₹${fmt(components.baseSalary)}` : 'No structure assigned yet'}
          </p>
        </div>
        {components?.employeeCode && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-mono">
            {components.employeeCode}
          </span>
        )}
      </div>

      {!components || allComponents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No pay structure configured yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Salary Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[#0445AD]/5 border border-[#0445AD]/20 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Base Salary</p>
              <p className="text-lg font-bold text-[#0445AD]">₹{fmt(components.baseSalary)}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Gross Salary</p>
              <p className="text-lg font-bold text-green-700">₹{fmt(components.grossSalary)}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Net Salary</p>
              <p className="text-lg font-bold text-emerald-700">₹{fmt(components.netSalary)}</p>
            </div>
          </div>

          {/* Pay Structure Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pay Structure', value: components.payStructure?.name },
              { label: 'Department', value: components.department },
              { label: 'Designation', value: components.designation },
              { label: 'Employee Code', value: components.employeeCode },
              { label: 'Employment Type', value: components.employmentType },
              { label: 'Joining Date', value: components.joiningDate ? new Date(components.joiningDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined },
              { label: 'Components', value: `${allComponents.length} items` },
              { label: 'Status', value: components.payStructure?.isActive ? 'Active' : 'Inactive' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Component Breakdown */}
          {allComponents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Salary Components</h4>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Component</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Value</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {earnings.map((c, i) => (
                      <tr key={i} className="hover:bg-green-50/30 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.payrollMasterComponent?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ITEM_TYPE_COLORS[c.payrollMasterComponent?.type as PayrollItemType] || 'bg-gray-100 text-gray-500'}`}>
                            {c.payrollMasterComponent?.type || 'EARNING'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {c.valueType === 'PERCENTAGE_OF_BASIC' ? '% of Basic' : 'Fixed'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-green-700">₹{fmt(c.value)}</span>
                          {c.valueType === 'PERCENTAGE_OF_BASIC' && c.value && (
                            <span className="text-xs text-gray-400 ml-1">({c.value}%)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bonuses.map((c, i) => (
                      <tr key={`b-${i}`} className="hover:bg-purple-50/30 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.payrollMasterComponent?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ITEM_TYPE_COLORS.BONUS}`}>
                            Bonus
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {c.valueType === 'PERCENTAGE_OF_BASIC' ? '% of Basic' : 'Fixed'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-purple-700">₹{fmt(c.value)}</span>
                        </td>
                      </tr>
                    ))}
                    {deductions.map((c, i) => (
                      <tr key={`d-${i}`} className="hover:bg-red-50/30 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.payrollMasterComponent?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ITEM_TYPE_COLORS[c.payrollMasterComponent?.type as PayrollItemType] || 'bg-red-50 text-red-700'}`}>
                            {c.payrollMasterComponent?.type || 'DEDUCTION'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {c.valueType === 'PERCENTAGE_OF_BASIC' ? '% of Basic' : 'Fixed'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-red-600">₹{fmt(c.value)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Override indicator */}
          {components.overrides && components.overrides.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                {components.overrides.length} custom override(s) applied on top of your pay structure
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PAYSLIP DRAWER
// ─────────────────────────────────────────────
const PayslipDrawer = ({ record, onClose }: { record: PayrollRecord | null; onClose: () => void }) => {
  if (!record) return null;
  const items = record.items || [];
  const earnings = items.filter((i) => i.type === 'EARNING' || i.type === 'ALLOWANCE');
  const deductions = items.filter((i) => i.type === 'DEDUCTION' || i.type === 'TAX');
  const bonuses = items.filter((i) => i.type === 'BONUS');
  const days = record.daysSummary;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payslip</h2>
            <p className="text-sm text-gray-500 mt-0.5">{formatMonth(record.month, record.year)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={record.status} />
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5 flex-1">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Base Salary', value: record.baseSalary || record.basicSalary },
              { label: 'Gross Salary', value: record.grossSalary },
              { label: 'Total Earnings', value: record.totalEarnings },
              { label: 'Net Salary', value: record.netSalary, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`p-4 rounded-xl border ${highlight ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>₹{fmt(value)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Allowances', value: record.totalAllowances },
              { label: 'Deductions', value: record.totalDeductions, neg: true },
              { label: 'Bonus', value: record.totalBonus },
              { label: 'Tax', value: record.totalTax, neg: true },
            ].map(({ label, value, neg }) => (
              <div key={label} className="p-4 rounded-xl border border-gray-200 bg-white">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${neg ? 'text-red-600' : 'text-gray-900'}`}>{neg ? '-' : ''}₹{fmt(value)}</p>
              </div>
            ))}
          </div>
          {days && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance Summary</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Present', value: days.presentDays },
                  { label: 'Absent', value: days.absentDays },
                  { label: 'Paid Leave', value: days.paidLeaves },
                  { label: 'Unpaid', value: days.unpaidLeaves },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-800">{value ?? 0}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Salary Breakdown</h4>
              {earnings.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Earnings &amp; Allowances</p>
                  {earnings.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 px-3 bg-green-50/50 rounded-lg text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-green-700">+₹{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {bonuses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Bonus</p>
                  {bonuses.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 px-3 bg-purple-50/50 rounded-lg text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-purple-700">+₹{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {deductions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Deductions &amp; Tax</p>
                  {deductions.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 px-3 bg-red-50/50 rounded-lg text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-red-700">-₹{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Payslip Download</p>
                <p className="text-xs text-blue-400">Available soon</p>
              </div>
            </div>
            <button disabled className="px-4 py-2 bg-blue-100 text-blue-400 rounded-lg text-xs font-semibold cursor-not-allowed">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAYSLIP PREVIEW MODAL
// ─────────────────────────────────────────────
const PayslipPreviewModal = ({ open, previewUrl, previewLoading, record, onClose, onDownload }: {
  open: boolean; previewUrl: string | null; previewLoading: boolean;
  record: PayrollRecord | null; onClose: () => void; onDownload: () => void;
}) => {
  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payslip Preview</h2>
            <p className="text-xs text-gray-400">{formatMonth(record.month, record.year)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition">
              <Download className="w-3.5 h-3.5" />Download
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {previewLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading preview...
            </div>
          ) : previewUrl ? (
            <iframe src={previewUrl} className="w-full h-[70vh] border border-gray-200 rounded-xl" title="Payslip Preview" />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
              <FileText className="w-10 h-10 mb-2 opacity-30" />
              <p>Preview not available</p>
              <p className="text-xs mt-1">The payslip preview could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function EmployeePayrollPage() {
  const dispatch = useAppDispatch();
  const { myPayslips, myPayslipDetail, employeePayrollComponents, loading, error, successMessage } =
    useAppSelector((s) => s.payroll);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [drawerRecord, setDrawerRecord] = useState<PayrollRecord | null>(null);
  const [previewRecord, setPreviewRecord] = useState<PayrollRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [localMsg, setLocalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setCurrentUserId(u.id || u.userId);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    dispatch(fetchMyPayrollRecords());
    if (currentUserId) {
      dispatch(fetchEmployeePayrollComponents(currentUserId));
    }
  }, [dispatch, currentUserId]);

  useEffect(() => {
    if (successMessage) { setLocalMsg({ type: 'success', text: successMessage }); dispatch(clearPayrollSuccess()); }
    if (error) { setLocalMsg({ type: 'error', text: error }); dispatch(clearPayrollError()); }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    if (localMsg) { const t = setTimeout(() => setLocalMsg(null), 4000); return () => clearTimeout(t); }
  }, [localMsg]);

  const filtered = myPayslips.filter((p) => p.month === selectedMonth && p.year === selectedYear);
  const netTotal = filtered.reduce((s, p) => s + (p.netSalary || 0), 0);
  const grossTotal = filtered.reduce((s, p) => s + (p.grossSalary || 0), 0);
  const deductionTotal = filtered.reduce((s, p) => s + (p.totalDeductions || 0), 0);
  const statusCounts = filtered.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const handleViewPayslip = async (record: PayrollRecord) => {
    setDrawerRecord(record);
    const result = await dispatch(fetchMyPayrollDetail(record.id));
    if (fetchMyPayrollDetail.fulfilled.match(result)) {
      setDrawerRecord(result.payload);
    } else {
      setDrawerRecord(record);
    }
  };

  const handlePreviewPayslip = async (record: PayrollRecord) => {
    setPreviewLoading(true);
    setPreviewRecord(record);
    const result = await dispatch(fetchPayslipPreview(record.id));
    if (fetchPayslipPreview.fulfilled.match(result)) {
      setPreviewUrl(result.payload?.url || null);
    }
    setPreviewLoading(false);
  };

  const handleCloseDrawer = () => {
    setDrawerRecord(null);
    dispatch(clearMyPayslipDetail());
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
          <p className="text-sm text-gray-500 mt-0.5">View your salary history and payslips</p>
        </div>
      </div>

      {/* Alerts */}
      {localMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${localMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {localMsg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{localMsg.text}</span>
          <button onClick={() => setLocalMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Month / Year Filter */}
      <div className="flex items-center gap-3 flex-wrap bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" /><span>Viewing:</span></div>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
          {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => dispatch(fetchMyPayrollRecords())}
          className="ml-auto p-2.5 text-gray-500 hover:text-[#0445AD] border border-gray-200 rounded-xl hover:bg-blue-50" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: HandCoins, label: 'Net Salary', value: `₹${fmt(netTotal)}`, bg: 'bg-[#0445AD]', sub: filtered.length > 0 ? `${filtered.length} record${filtered.length !== 1 ? 's' : ''}` : '—' },
          { icon: FileText, label: 'Gross Salary', value: `₹${fmt(grossTotal)}`, bg: 'bg-green-500', sub: 'this month' },
          { icon: XCircle, label: 'Deductions', value: `₹${fmt(deductionTotal)}`, bg: 'bg-red-500', sub: 'this month' },
          { icon: CheckCircle, label: 'Status', value: filtered.length > 0 ? (Object.keys(statusCounts)[0] || '—') : '—', bg: 'bg-purple-500', sub: Object.keys(statusCounts).length > 0 ? Object.entries(statusCounts).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(', ') : 'no records' },
        ].map(({ icon: Icon, label, value, bg, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
              <span className="text-xs text-gray-400">{sub}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* My Pay Structure */}
      <PayStructureSection components={employeePayrollComponents} loading={loading} />

      {/* Payroll Records */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Payslips — {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        {loading && filtered.length === 0 ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No payroll records found"
            subtitle={`No payroll records for ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Period', 'Base', 'Gross', 'Deductions', 'Net Salary', 'Status', 'Payslip'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-gray-800">{formatMonth(record.month, record.year)}</p>
                        {record.payDate && <p className="text-xs text-gray-400 mt-0.5">Paid {new Date(record.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">₹{fmt(record.baseSalary || record.basicSalary)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">₹{fmt(record.grossSalary)}</td>
                      <td className="px-4 py-3.5 text-sm text-red-600">-₹{fmt(record.totalDeductions)}</td>
                      <td className="px-4 py-3.5"><p className="text-sm font-bold text-green-700">₹{fmt(record.netSalary)}</p></td>
                      <td className="px-4 py-3.5"><StatusBadge status={record.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleViewPayslip(record)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0445AD]/10 text-[#0445AD] rounded-lg text-xs font-semibold hover:bg-[#0445AD]/20 transition">
                            <Eye className="w-3.5 h-3.5" />View
                          </button>
                          {record.status === 'PAID' || record.status === 'PROCESSED' ? (
                            <button onClick={() => downloadPayslip(record.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                              title="Download Payslip">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handlePreviewPayslip(record)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
                              title="Preview Payslip">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* All-time History */}
      {myPayslips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">All Payroll History</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Period', 'Net Salary', 'Status', 'Payslip'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myPayslips.slice().sort((a, b) => b.year - a.year || b.month - a.month).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{formatMonth(record.month, record.year)}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-green-700">₹{fmt(record.netSalary)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={record.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleViewPayslip(record)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0445AD]/10 text-[#0445AD] rounded-lg text-xs font-semibold hover:bg-[#0445AD]/20 transition">
                            <Eye className="w-3.5 h-3.5" />View
                          </button>
                          {record.status === 'PAID' || record.status === 'PROCESSED' ? (
                            <button onClick={() => downloadPayslip(record.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                              title="Download Payslip">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handlePreviewPayslip(record)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
                              title="Preview Payslip">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Payslip Preview Modal */}
      <PayslipPreviewModal
        open={!!previewRecord}
        previewUrl={previewUrl}
        previewLoading={previewLoading}
        record={previewRecord}
        onClose={() => { setPreviewRecord(null); setPreviewUrl(null); }}
        onDownload={() => previewRecord && downloadPayslip(previewRecord.id)}
      />

      <PayslipDrawer record={drawerRecord} onClose={handleCloseDrawer} />
    </div>
  );
}
