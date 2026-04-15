'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  Settings,
  FileText,
  RefreshCw,
  Eye,
  Search,
  Check,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardKPIs,
  fetchComponentMasters,
  createComponentMaster,
  fetchPayStructures,
  createPayStructure,
  updatePayStructure,
  deletePayStructure,
  fetchEmployeeOverrides,
  saveEmployeeOverrides,
  fetchAllPayrolls,
  generatePayroll,
  generateSingleUserPayroll,
  processPayroll,
  markPayrollDisbursing,
  markPayrollPaid,
  markPayrollFailed,
  clearPayrollError,
  clearPayrollSuccess,
  PayrollComponentMaster,
  CreateComponentMasterPayload,
  PayStructure,
  CreatePayStructurePayload,
  EmployeePayrollComponent,
  PayrollRecord,
  PayrollItem,
  PayrollStatus,
  PayrollItemType,
  PayStructureValueType,
  PayrollComponentType,
  GeneratePayrollPayload,
  fetchAllEmployees,
  EmployeeInfo,
} from '@/store/actions/payrollActions';
import { fetchDepartments } from '@/store/actions/departmentActions';
import { fetchDesignations } from '@/store/actions/designationActions';

type AdminTab = 'dashboard' | 'components' | 'structures' | 'overrides' | 'generate' | 'listing';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const STATUS_COLORS: Record<PayrollStatus, string> = {
  DRAFT: 'bg-blue-100 text-blue-700',
  PROCESSED: 'bg-green-100 text-green-700',
  DISBURSING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const STATUS_ICON: Record<PayrollStatus, React.ReactNode> = {
  DRAFT: <Clock className="w-3.5 h-3.5" />,
  PROCESSED: <CheckCircle className="w-3.5 h-3.5" />,
  DISBURSING: <Clock className="w-3.5 h-3.5" />,
  PAID: <Check className="w-3.5 h-3.5" />,
  FAILED: <XCircle className="w-3.5 h-3.5" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5" />,
};

const ITEM_TYPE_COLORS: Record<PayrollItemType, string> = {
  EARNING: 'bg-green-50 text-green-700',
  ALLOWANCE: 'bg-blue-50 text-blue-700',
  DEDUCTION: 'bg-red-50 text-red-700',
  TAX: 'bg-orange-50 text-orange-700',
  BONUS: 'bg-purple-50 text-purple-700',
};

const formatMonth = (m: number, y: number) =>
  new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const fmt = (n: number | undefined | null) =>
  n?.toLocaleString('en-IN') ?? '0';

// ─────────────────────────────────────────────
// Reusable: Status Badge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }: { status: PayrollStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
    {STATUS_ICON[status]}
    {status}
  </span>
);

// ─────────────────────────────────────────────
// Reusable: Confirmation Modal
// ─────────────────────────────────────────────
const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  loading: boolean; onConfirm: () => void; onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 ${
              confirmVariant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0445AD] hover:bg-[#033080]'
            }`}>
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Reusable: Empty State
// ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 font-medium">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────
// Reusable: Section Header
// ─────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─────────────────────────────────────────────
// COMPONENT MASTER MODAL
// ─────────────────────────────────────────────
const VALUE_TYPE_LABELS: Record<PayStructureValueType, string> = {
  PERCENTAGE_OF_BASIC: '% of Basic',
  COMPANY_FIXED: 'Company Fixed',
  EMPLOYEE_FIXED: 'Employee Fixed',
  CUSTOM: 'Custom',
};

const ComponentMasterModal = ({
  open,
  editing,
  onClose,
  onSave,
  loading,
}: {
  open: boolean; editing: PayrollComponentMaster | null;
  onClose: () => void; onSave: (p: CreateComponentMasterPayload) => void; loading: boolean;
}) => {
  const [form, setForm] = useState<CreateComponentMasterPayload>({
    name: '', type: 'EARNING', valueType: 'PERCENTAGE_OF_BASIC', isTaxable: false, isOptional: false, isActive: true,
  });
  useEffect(() => {
    setForm(editing ? {
      name: editing.name, type: editing.type, valueType: editing.valueType,
      isTaxable: editing.isTaxable, isOptional: editing.isOptional, isActive: editing.isActive,
      defaultValue: editing.defaultValue,
    } : { name: '', type: 'EARNING', valueType: 'PERCENTAGE_OF_BASIC', isTaxable: false, isOptional: false, isActive: true });
  }, [editing, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">{editing ? 'Edit Component Master' : 'Add Component Master'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Component Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., House Rent Allowance"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PayrollComponentType })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
                {(['EARNING', 'ALLOWANCE', 'DEDUCTION', 'TAX', 'BONUS'] as PayrollComponentType[]).map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Value Type *</label>
              <select value={form.valueType} onChange={(e) => setForm({ ...form, valueType: e.target.value as PayStructureValueType })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
                {(Object.keys(VALUE_TYPE_LABELS) as PayStructureValueType[]).map(vt => (
                  <option key={vt} value={vt}>{VALUE_TYPE_LABELS[vt]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Value — shown only when COMPANY_FIXED is selected */}
          {form.valueType === 'COMPANY_FIXED' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount*</label>
              <input
                type="number"
                value={form.defaultValue ?? ''}
                onChange={(e) => setForm({ ...form, defaultValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter the amount"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-6">
            {(['isTaxable', 'isOptional', 'isActive'] as const).map((field) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })}
                  className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]" />
                <span className="text-sm text-gray-600">{field === 'isTaxable' ? 'Taxable' : field === 'isOptional' ? 'Optional' : 'Active'}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.name.trim() || (form.valueType === 'COMPANY_FIXED' && !form.defaultValue)}
            className="flex-1 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {editing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAY STRUCTURE MODAL
// ─────────────────────────────────────────────
const PayStructureModal = ({
  open, editing, departments, components,
  onClose, onSave, loading,
}: {
  open: boolean; editing: PayStructure | null; departments: any[];
  components: PayrollComponentMaster[]; onClose: () => void;
  onSave: (p: CreatePayStructurePayload) => void; loading: boolean;
}) => {
  const [form, setForm] = useState<CreatePayStructurePayload>(() => {
    if (editing) {
      return {
        name: editing.name,
        departmentId: editing.departmentId,
        isDefault: editing.isDefault,
        isActive: editing.isActive,
        components: editing.components.map(c => ({
          payrollComponentMasterId: c.payrollComponentMasterId || c.id || '',
          valueType: c.valueType,
          value: c.value,
          isActive: c.isActive,
          remarks: c.remarks,
        })),
      };
    }
    return { name: '', isDefault: false, isActive: true, components: [] };
  });

  // Re-sync form when editing structure changes (e.g., when modal reopens with new structure)
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        departmentId: editing.departmentId,
        isDefault: editing.isDefault,
        isActive: editing.isActive,
        components: editing.components.map(c => ({
          payrollComponentMasterId: c.payrollComponentMasterId || c.id || '',
          valueType: c.valueType,
          value: c.value,
          isActive: c.isActive,
          remarks: c.remarks,
        })),
      });
    } else if (open) {
      // Only reset when creating new (not when switching between edits)
      setForm({ name: '', isDefault: false, isActive: true, components: [] });
    }
  }, [editing, open]);

  const removeComponent = (i: number) => setForm({ ...form, components: form.components.filter((_, idx) => idx !== i) });

  const updateComponent = (i: number, field: string, value: any) => {
    const updated = [...form.components];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, components: updated });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold">{editing ? 'Edit Pay Structure' : 'Add Pay Structure'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Structure Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Engineering Structure"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
              <select value={form.departmentId || ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value || undefined })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
                <option value="">All Departments</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              {(['isDefault', 'isActive'] as const).map(f => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.checked })}
                    className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]" />
                  <span className="text-sm text-gray-600">{f === 'isDefault' ? 'Set as Default' : 'Active'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Select Components</h4>
              <span className="text-xs text-gray-400">{form.components.length} / {components.length} selected</span>
            </div>

            {/* Component Master chips — click to add */}
            {components.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
                No component masters available. Create them first.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {components.map(cm => {
                  const isSelected = form.components.some(c => c.payrollComponentMasterId === cm.id);
                  const isCompanyFixed = cm.valueType === 'COMPANY_FIXED';
                  const hasDefault = cm.defaultValue != null;
                  return (
                    <button
                      key={cm.id}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          setForm({
                            ...form,
                            components: [...form.components, {
                              payrollComponentMasterId: cm.id!,
                              valueType: cm.valueType,
                              value: hasDefault ? cm.defaultValue! : 0,
                              isActive: true,
                            }],
                          });
                        }
                      }}
                      disabled={isSelected}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#0445AD]/10 text-[#0445AD] opacity-60 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-[#0445AD]/10 hover:text-[#0445AD]'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 text-[#0445AD]" /> : <Plus className="w-3.5 h-3.5" />}
                      {cm.name}
                      {isCompanyFixed && hasDefault && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">uses default</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected components with value inputs */}
            {form.components.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Set Values</p>
                {form.components.map((c, i) => {
                  const cm = components.find(m => m.id === c.payrollComponentMasterId);
                  const isCompanyFixed = (cm?.valueType || c.valueType) === 'COMPANY_FIXED';
                  const hasDefault = cm?.defaultValue != null;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-xl">
                      <div className="col-span-5">
                        <p className="text-xs font-semibold text-gray-800 truncate">{cm?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{VALUE_TYPE_LABELS[(cm?.valueType || c.valueType) as PayStructureValueType] || c.valueType}</p>
                      </div>
                      {!isCompanyFixed || !hasDefault ? (
                        <input
                          type="number"
                          value={c.value ?? ''}
                          onChange={(e) => updateComponent(i, 'value', parseFloat(e.target.value) || 0)}
                          placeholder={isCompanyFixed ? 'Set amount' : 'Amount / %'}
                          className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0445AD]"
                        />
                      ) : (
                        <div className="col-span-4 flex items-center gap-1 px-2">
                          <span className="text-xs text-blue-600 font-semibold">₹{cm.defaultValue!.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400">(default)</span>
                        </div>
                      )}
                      <label className="col-span-1 flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.isActive}
                          onChange={(e) => updateComponent(i, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-[#0445AD] border-gray-300 rounded"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeComponent(i)}
                        className="col-span-1 p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="col-span-1 text-[10px] text-gray-400 text-center">Active</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading || !form.name.trim()}
            className="flex-1 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {editing ? 'Update Structure' : 'Create Structure'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PROCESS PAYROLL MODAL
// ─────────────────────────────────────────────
const ProcessPayrollModal = ({
  open, record, onClose, onProcess, loading,
}: {
  open: boolean; record: PayrollRecord | null; onClose: () => void;
  onProcess: (id: string, items: PayrollItem[]) => void; loading: boolean;
}) => {
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [newItem, setNewItem] = useState<PayrollItem>({ label: '', type: 'BONUS', amount: 0, description: '' });
  useEffect(() => { if (open) setItems(record?.items || []); }, [record, open]);

  const addItem = () => {
    if (!newItem.label || newItem.amount <= 0) return;
    setItems([...items, { ...newItem }]);
    setNewItem({ label: '', type: 'BONUS', amount: 0, description: '' });
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  if (!open || !record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold">Process Payroll</h2>
            <p className="text-xs text-gray-400 mt-0.5">{record.user?.name || record.employeeName} · {formatMonth(record.month, record.year)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl text-sm">
            <div className="text-center"><p className="text-gray-400 text-xs">Base</p><p className="font-bold">₹{fmt(record.baseSalary || record.basicSalary)}</p></div>
            <div className="text-center"><p className="text-gray-400 text-xs">Gross</p><p className="font-bold">₹{fmt(record.grossSalary)}</p></div>
            <div className="text-center"><p className="text-gray-400 text-xs">Net</p><p className="font-bold text-green-600">₹{fmt(record.netSalary)}</p></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Extra Items</h4>
            <div className="grid grid-cols-12 gap-2 mb-2">
              <input value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="Label"
                className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0445AD]" />
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as PayrollItemType })}
                className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0445AD]">
                {(['EARNING', 'ALLOWANCE', 'DEDUCTION', 'TAX', 'BONUS'] as PayrollItemType[]).map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <input type="number" value={newItem.amount || ''} onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })} placeholder="₹"
                className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0445AD]" />
              <button onClick={addItem} className="col-span-2 px-3 py-2 bg-[#0445AD] text-white rounded-lg text-xs font-semibold hover:bg-[#033080]">+ Add</button>
            </div>
          </div>
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ITEM_TYPE_COLORS[item.type]}`}>{item.type}</span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <span className={`text-sm font-bold ${item.type === 'DEDUCTION' || item.type === 'TAX' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.type === 'DEDUCTION' || item.type === 'TAX' ? '-' : '+'}₹{fmt(item.amount)}
                  </span>
                  <button onClick={() => removeItem(i)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onProcess(record.id, items)} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}Process Payroll
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADJUST SINGLE USER MODAL
// ─────────────────────────────────────────────
const AdjustUserModal = ({
  open, record, onClose, onAdjust, loading,
}: {
  open: boolean; record: PayrollRecord | null; onClose: () => void;
  onAdjust: (payload: { payrollId: string; userId: string; month: number; year: number; leaveDeduction?: any; attendanceDeduction?: any }) => void; loading: boolean;
}) => {
  const [leaveEnabled, setLeaveEnabled] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);
  const [leaveAmount, setLeaveAmount] = useState(0);
  const [attEnabled, setAttEnabled] = useState(false);
  const [attCount, setAttCount] = useState(0);
  const [attAmount, setAttAmount] = useState(0);

  useEffect(() => {
    if (record && open) {
      setLeaveEnabled(false); setLeaveCount(0); setLeaveAmount(0);
      setAttEnabled(false); setAttCount(0); setAttAmount(0);
    }
  }, [record, open]);

  if (!open || !record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold">Adjust Payroll</h2>
            <p className="text-xs text-gray-400 mt-0.5">{record.user?.name || record.employeeName} · {formatMonth(record.month, record.year)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={leaveEnabled} onChange={(e) => setLeaveEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0445AD] border-gray-300 rounded" />
              <span className="text-sm font-semibold">Leave Deduction</span>
            </div>
            {leaveEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Leave Count</label>
                  <input type="number" value={leaveCount || ''} onChange={(e) => setLeaveCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0445AD]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
                  <input type="number" value={leaveAmount || ''} onChange={(e) => setLeaveAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0445AD]" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={attEnabled} onChange={(e) => setAttEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0445AD] border-gray-300 rounded" />
              <span className="text-sm font-semibold">Attendance Deduction</span>
            </div>
            {attEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Absent Count</label>
                  <input type="number" value={attCount || ''} onChange={(e) => setAttCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0445AD]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
                  <input type="number" value={attAmount || ''} onChange={(e) => setAttAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0445AD]" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onAdjust({
            payrollId: record.id, userId: record.userId,
            month: record.month, year: record.year,
            leaveDeduction: leaveEnabled ? { enabled: true, manualLeaveCount: leaveCount, manualAmountDeducted: leaveAmount } : undefined,
            attendanceDeduction: attEnabled ? { enabled: true, manualAbsentCount: attCount, manualAmountDeducted: attAmount } : undefined,
          })} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// GENERATE PAYROLL MODAL
// ─────────────────────────────────────────────
const GeneratePayrollModal = ({ open, onClose, onGenerate, loading }: {
  open: boolean; onClose: () => void;
  onGenerate: (p: GeneratePayrollPayload) => void; loading: boolean;
}) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [leaveEnabled, setLeaveEnabled] = useState(false);
  const [attEnabled, setAttEnabled] = useState(false);

  const handleGenerate = () => {
    onGenerate({
      month, year,
      leaveDeduction: leaveEnabled ? { enabled: true } : undefined,
      attendanceDeduction: attEnabled ? { enabled: true } : undefined,
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold">Generate Payroll</h2>
            <p className="text-xs text-gray-400 mt-0.5">Create draft payroll for all eligible employees</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Month *</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
                {MONTHS.filter(m => m.value < now.getMonth() + 1).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year *</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={leaveEnabled} onChange={(e) => setLeaveEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0445AD] border-gray-300 rounded" />
              <span className="text-sm font-semibold text-gray-700">Leave Deduction</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={attEnabled} onChange={(e) => setAttEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0445AD] border-gray-300 rounded" />
              <span className="text-sm font-semibold text-gray-700">Attendance Deduction</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleGenerate} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033080] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}Generate
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAYROLL DETAIL MODAL
// ─────────────────────────────────────────────
const PayrollDetailModal = ({ open, record, onClose, onAction }: {
  open: boolean; record: PayrollRecord | null;
  onClose: () => void;
  onAction: (type: string, id: string) => void;
  loading: boolean;
}) => {
  if (!open || !record) return null;

  const items = record.items || [];
  const earnings = items.filter(i => i.type === 'EARNING' || i.type === 'ALLOWANCE');
  const deductions = items.filter(i => i.type === 'DEDUCTION' || i.type === 'TAX');
  const bonuses = items.filter(i => i.type === 'BONUS');

  const days = record.daysSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold">{record.user?.name || record.employeeName || 'Payroll Detail'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formatMonth(record.month, record.year)} · {record.user?.employeeCode || ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={record.status} />
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Employee Info */}
          {record.user && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div><p className="text-xs text-gray-400">Employee</p><p className="text-sm font-semibold">{record.user.name}</p></div>
              <div><p className="text-xs text-gray-400">Department</p><p className="text-sm font-semibold">{record.user.department?.name || record.department || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Designation</p><p className="text-sm font-semibold">{record.user.designation?.name || record.designation || '—'}</p></div>
            </div>
          )}

          {/* Salary Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Base Salary', value: record.baseSalary || record.basicSalary, color: 'text-gray-800' },
              { label: 'Gross Salary', value: record.grossSalary, color: 'text-blue-700' },
              { label: 'Total Earnings', value: record.totalEarnings, color: 'text-green-700' },
              { label: 'Net Salary', value: record.netSalary, color: 'text-emerald-700', highlight: true },
            ].map(({ label, value, color, highlight }) => (
              <div key={label} className={`p-4 rounded-xl border ${highlight ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>₹{fmt(value)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Allowances', value: record.totalAllowances },
              { label: 'Total Deductions', value: record.totalDeductions, negative: true },
              { label: 'Total Bonus', value: record.totalBonus },
              { label: 'Total Tax', value: record.totalTax, negative: true },
            ].map(({ label, value, negative }) => (
              <div key={label} className="p-4 rounded-xl border border-gray-200 bg-white">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${negative ? 'text-red-600' : 'text-gray-800'}`}>
                  {negative ? '-' : ''}₹{fmt(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Days Summary */}
          {days && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance & Leave Summary</h4>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { label: 'Present', value: days.presentDays },
                  { label: 'Absent', value: days.absentDays },
                  { label: 'Late', value: days.lateCount },
                  { label: 'Half Days', value: days.halfDays },
                  { label: 'Payable', value: days.payableDays },
                  { label: 'Paid Leaves', value: days.paidLeaves },
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

          {/* Payroll Items */}
          {items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Salary Breakdown</h4>
              {earnings.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Earnings & Allowances</p>
                  <div className="space-y-1">
                    {earnings.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 px-3 bg-green-50/50 rounded-lg text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-green-700">+₹{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {deductions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Deductions & Tax</p>
                  <div className="space-y-1">
                    {deductions.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 px-3 bg-red-50/50 rounded-lg text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-red-700">-₹{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {bonuses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Bonus</p>
                  <div className="space-y-1">
                    {bonuses.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 px-3 bg-purple-50/50 rounded-lg text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-purple-700">+₹{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payslip Placeholder */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Payslip</p>
                <p className="text-xs text-blue-400">Payslip generation will be available soon</p>
              </div>
            </div>
            <button disabled className="px-4 py-2 bg-blue-100 text-blue-400 rounded-lg text-xs font-semibold cursor-not-allowed">Download</button>
          </div>
        </div>

        {/* Actions */}
        {record.status !== 'PAID' && record.status !== 'CANCELLED' && (
          <div className="flex items-center justify-end gap-2 px-6 pb-6 border-t border-gray-100 pt-4">
            {record.status === 'DRAFT' && (
              <button onClick={() => onAction('adjust', record.id)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <Settings className="w-4 h-4" /> Adjust
              </button>
            )}
            {(record.status === 'DRAFT') && (
              <button onClick={() => onAction('process', record.id)}
                className="px-4 py-2 bg-[#0445AD] text-white rounded-xl text-sm font-semibold hover:bg-[#033080] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Process
              </button>
            )}
            {record.status === 'PROCESSED' && (
              <button onClick={() => onAction('disbursing', record.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-semibold hover:bg-yellow-600 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4" /> Mark Disbursing
              </button>
            )}
            {record.status === 'DISBURSING' && (
              <button onClick={() => onAction('paid', record.id)}
                className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Mark Paid
              </button>
            )}
            {(record.status as PayrollStatus) !== 'PAID' && (record.status as PayrollStatus) !== 'CANCELLED' && (
              <button onClick={() => onAction('failed', record.id)}
                className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Mark Failed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const {
    dashboardKPIs, componentMasters, payStructures, employeeOverrides,
    payrollRecords, allEmployees,
    loading, processing, generating, error, successMessage,
  } = useAppSelector(s => s.payroll);
  const { departments } = useAppSelector(s => s.departments);
  const { designations } = useAppSelector(s => s.designations);

  const now = new Date();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [listMonth, setListMonth] = useState(now.getMonth() + 1);
  const [listYear, setListYear] = useState(now.getFullYear());
  const [listStatus, setListStatus] = useState<PayrollStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PayrollComponentMaster | null>(null);
  const [editingStructure, setEditingStructure] = useState<PayStructure | null>(null);
  const [deleteStructureId, setDeleteStructureId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<PayrollRecord | null>(null);
  const [processRecord, setProcessRecord] = useState<PayrollRecord | null>(null);
  const [adjustRecord, setAdjustRecord] = useState<PayrollRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; label: string; variant: 'danger' | 'primary' } | null>(null);
  const [overrideUser, setOverrideUser] = useState<EmployeeInfo | null>(null);
  const [overrideComponents, setOverrideComponents] = useState<EmployeePayrollComponent[]>([]);
  const [overrideSearch, setOverrideSearch] = useState('');
  const [localMsg, setLocalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardKPIs({ month: now.getMonth() + 1, year: now.getFullYear() }));
    dispatch(fetchComponentMasters());
    dispatch(fetchPayStructures());
    dispatch(fetchAllPayrolls({}));
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) { setLocalMsg({ type: 'success', text: successMessage }); dispatch(clearPayrollSuccess()); }
    if (error) { setLocalMsg({ type: 'error', text: error }); dispatch(clearPayrollError()); }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    if (localMsg) { const t = setTimeout(() => setLocalMsg(null), 4000); return () => clearTimeout(t); }
  }, [localMsg]);

  // Load employees when overrides tab is opened
  useEffect(() => {
    if (activeTab === 'overrides' && allEmployees.length === 0) {
      dispatch(fetchAllEmployees());
    }
  }, [activeTab, dispatch, allEmployees.length]);

  const kpis = dashboardKPIs;
  const filteredRecords = payrollRecords.filter(r => {
    const term = searchTerm.toLowerCase();
    if (term && !(r.user?.name || r.employeeName || '').toLowerCase().includes(term)) return false;
    if (listMonth && r.month !== listMonth) return false;
    if (listYear && r.year !== listYear) return false;
    if (listStatus && r.status !== listStatus) return false;
    return true;
  });

  // ── Handlers ──────────────────────────────────────────

  const handleSaveComponent = async (form: CreateComponentMasterPayload) => {
    const result = await dispatch(createComponentMaster(form));
    if (createComponentMaster.fulfilled.match(result)) {
      setShowComponentModal(false); setEditingComponent(null);
      dispatch(fetchComponentMasters());
    }
  };

  const handleSaveStructure = async (form: CreatePayStructurePayload) => {
    if (editingStructure?.id) {
      const result = await dispatch(updatePayStructure({ id: editingStructure.id, payload: form }));
      if (updatePayStructure.fulfilled.match(result)) { setShowStructureModal(false); setEditingStructure(null); dispatch(fetchPayStructures()); }
    } else {
      const result = await dispatch(createPayStructure(form));
      if (createPayStructure.fulfilled.match(result)) { setShowStructureModal(false); dispatch(fetchPayStructures()); }
    }
  };

  const handleDeleteStructure = async () => {
    if (!deleteStructureId) return;
    const result = await dispatch(deletePayStructure(deleteStructureId));
    if (deletePayStructure.fulfilled.match(result)) {
      setDeleteStructureId(null);
      dispatch(fetchPayStructures());
    }
  };

  const handleGenerate = async (payload: GeneratePayrollPayload) => {
    const result = await dispatch(generatePayroll(payload));
    if (generatePayroll.fulfilled.match(result)) {
      setShowGenerateModal(false);
      setListMonth(payload.month);
      setListYear(payload.year);
      setListStatus('');
      dispatch(fetchDashboardKPIs({ month: payload.month, year: payload.year }));
      dispatch(fetchAllPayrolls({ month: payload.month, year: payload.year }));
      setActiveTab('listing');
    }
  };

  const handleAdjustUser = async (payload: any) => {
    const result = await dispatch(generateSingleUserPayroll({
      userId: payload.userId, month: payload.month, year: payload.year,
      leaveDeduction: payload.leaveDeduction, attendanceDeduction: payload.attendanceDeduction,
    }));
    if (generateSingleUserPayroll.fulfilled.match(result)) {
      setShowAdjustModal(false); setAdjustRecord(null);
    }
  };

  const handleProcess = async (payrollId: string, items: PayrollItem[]) => {
    const result = await dispatch(processPayroll({ payrollId, items }));
    if (processPayroll.fulfilled.match(result)) { setShowProcessModal(false); setProcessRecord(null); }
  };

  const handleAction = (type: string, id: string) => {
    if (type === 'process') { setProcessRecord(payrollRecords.find(r => r.id === id) || null); setShowProcessModal(true); }
    else if (type === 'adjust') { setAdjustRecord(payrollRecords.find(r => r.id === id) || null); setShowAdjustModal(true); }
    else if (['disbursing', 'paid', 'failed'].includes(type)) {
      const labels: Record<string, string> = { disbursing: 'Mark as Disbursing', paid: 'Mark as Paid', failed: 'Mark as Failed' };
      const variants: Record<string, 'danger' | 'primary'> = { disbursing: 'primary', paid: 'primary', failed: 'danger' };
      setConfirmAction({ type, id, label: labels[type], variant: variants[type] });
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    let result;
    if (type === 'disbursing') result = await dispatch(markPayrollDisbursing(id));
    else if (type === 'paid') result = await dispatch(markPayrollPaid(id));
    else if (type === 'failed') result = await dispatch(markPayrollFailed(id));
    if (result && (result as any).meta.requestStatus === 'fulfilled') setConfirmAction(null);
  };

  const handleViewDetail = async (record: PayrollRecord) => {
    setDetailRecord(record);
    setShowDetailModal(true);
  };

  // Employee Overrides
  const handleSelectOverrideUser = async (user: EmployeeInfo) => {
    setOverrideUser(user);
    const result = await dispatch(fetchEmployeeOverrides(user.id));
    if (fetchEmployeeOverrides.fulfilled.match(result)) {
      const components = result.payload?.components;
      setOverrideComponents(Array.isArray(components) ? components : []);
    }
  };

  const handleSaveOverrides = async () => {
    if (!overrideUser) return;
    await dispatch(saveEmployeeOverrides({ userId: overrideUser.id, components: overrideComponents }));
  };

  const overrideFilteredEmployees = allEmployees.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(overrideSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage salaries, structures, and payroll processing</p>
        </div>
        <button onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0445AD] hover:bg-[#033080] text-white rounded-xl text-sm font-semibold transition shadow-sm">
          <Plus className="w-4 h-4" /> Generate Payroll
        </button>
      </div>

      {/* Alerts */}
      {localMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${localMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {localMsg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{localMsg.text}</span>
          <button onClick={() => setLocalMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {([
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'components', label: 'Components' },
            { key: 'structures', label: 'Structures' },
            { key: 'overrides', label: 'Overrides' },
            { key: 'listing', label: 'All Payrolls' },
          ] as { key: AdminTab; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === key ? 'border-[#0445AD] text-[#0445AD]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD TAB ─────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: DollarSign, label: 'Total Payroll', value: `₹${fmt(kpis?.totalPayroll)}`, bg: 'bg-[#0445AD]', sub: `${filteredRecords.length} records` },
              { icon: CheckCircle, label: 'Processed', value: kpis?.processedCount ?? 0, bg: 'bg-green-500', sub: 'employees' },
              { icon: Clock, label: 'Pending', value: kpis?.pendingCount ?? 0, bg: 'bg-yellow-500', sub: 'drafts' },
              { icon: AlertCircle, label: 'Failed', value: kpis?.failedCount ?? 0, bg: 'bg-red-500', sub: 'records' },
              { icon: Users, label: 'Avg. Salary', value: `₹${fmt(kpis?.averageSalary)}`, bg: 'bg-purple-500', sub: 'per employee' },
            ].map(({ icon: Icon, label, value, bg, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
                  <span className="text-xs text-gray-400">{sub}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => { setEditingComponent(null); setShowComponentModal(true); }}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#0445AD] transition">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-blue-600" /></div>
              <div className="text-left"><p className="text-sm font-semibold text-gray-800">Create Component</p><p className="text-xs text-gray-400">Add salary component master</p></div>
            </button>
            <button onClick={() => { setEditingStructure(null); setShowStructureModal(true); }}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#0445AD] transition">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>
              <div className="text-left"><p className="text-sm font-semibold text-gray-800">Create Structure</p><p className="text-xs text-gray-400">Define pay structure template</p></div>
            </button>
            <button onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#0445AD] transition">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-amber-600" /></div>
              <div className="text-left"><p className="text-sm font-semibold text-gray-800">Generate Payroll</p><p className="text-xs text-gray-400">Run monthly payroll</p></div>
            </button>
          </div>

          {/* Recent Payrolls */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Recent Payroll Records</h3>
              <button onClick={() => setActiveTab('listing')} className="text-xs text-[#0445AD] font-semibold hover:underline">View All →</button>
            </div>
            {payrollRecords.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No payroll records yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {payrollRecords.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="w-8 h-8 bg-[#0445AD]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#0445AD]">
                      {(r.user?.name || r.employeeName || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.user?.name || r.employeeName}</p>
                      <p className="text-xs text-gray-400">{formatMonth(r.month, r.year)}</p>
                    </div>
                    {/* <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-gray-800">₹{fmt(r.netSalary)}</p>
                      <p className="text-xs text-gray-400">net salary</p>
                    </div> */}
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPONENTS TAB ────────────────────────────────── */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <SectionHeader
            title="Component Masters"
            subtitle="Define reusable salary components like Basic, HRA, Allowances, Deductions, Tax, Bonus"
            action={
              <button onClick={() => { setEditingComponent(null); setShowComponentModal(true); }}
                className="px-4 py-2 bg-[#0445AD] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#033080]">
                <Plus className="w-4 h-4" /> Add Component
              </button>
            }
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : componentMasters.length === 0 ? (
            <EmptyState icon={Settings} title="No component masters" subtitle="Create your first salary component" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {componentMasters.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ITEM_TYPE_COLORS[c.type as PayrollItemType] || 'bg-gray-100 text-gray-600'}`}>
                      <span className="text-xs font-bold">{c.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => { setEditingComponent(c); setShowComponentModal(true); }} className="p-1 text-gray-400 hover:text-[#0445AD] rounded hover:bg-gray-100">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">{c.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{c.type}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{VALUE_TYPE_LABELS[c.valueType] || c.valueType}</span>
                    {c.defaultValue != null && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">Default: ₹{c.defaultValue.toLocaleString('en-IN')}</span>
                    )}
                    {c.isTaxable && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs">Taxable</span>}
                    {c.isOptional && <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">Optional</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STRUCTURES TAB ────────────────────────────────── */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <SectionHeader
            title="Pay Structures"
            subtitle="Define company-wide or department/designation-wise salary templates"
            action={
              <button onClick={() => { setEditingStructure(null); setShowStructureModal(true); }}
                className="px-4 py-2 bg-[#0445AD] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#033080]">
                <Plus className="w-4 h-4" /> Add Structure
              </button>
            }
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : payStructures.length === 0 ? (
            <EmptyState icon={FileText} title="No pay structures configured" subtitle="Create your first structure" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {payStructures.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">{s.name}</h3>
                      {s.departmentName && <p className="text-xs text-gray-400">{s.departmentName}</p>}
                      {s.designationName && <p className="text-xs text-gray-400">{s.designationName}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditingStructure(s); setShowStructureModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-[#0445AD] rounded hover:bg-blue-50" title="Edit">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteStructureId(s.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {s.isDefault && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">Default</span>}
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{s.components?.length ?? 0} components</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(s.components || []).slice(0, 3).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">{c.payrollMasterComponent?.name || c.componentMaster?.name || c.payrollMasterComponentId?.slice(0, 8)}</span>
                    ))}
                    {(s.components || []).length > 3 && <span className="text-xs text-gray-400">+{s.components.length - 3} more</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── OVERRIDES TAB ─────────────────────────────────── */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          <SectionHeader
            title="Employee Payroll Overrides"
            subtitle="Set employee-specific salary component values that override the default pay structure"
          />

          {overrideUser ? (
            /* Override Panel — shown when an employee is selected */
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {/* Selected employee header */}
              <div className="flex items-center gap-3 p-3 bg-[#0445AD]/5 border border-[#0445AD]/20 rounded-xl mb-4">
                <div className="w-10 h-10 bg-[#0445AD]/20 rounded-full flex items-center justify-center text-sm font-bold text-[#0445AD]">
                  {(overrideUser.name || 'U').charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{overrideUser.name}</p>
                  <p className="text-xs text-gray-400">{overrideUser.email}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{overrideUser.employeeProfile?.employeeCode || '—'}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{overrideUser.department?.name || '—'}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{overrideUser.designation?.name || '—'}</span>
                  </div>
                </div>
                <button onClick={() => { setOverrideUser(null); setOverrideComponents([]); setOverrideSearch(''); }}
                  className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>

              {/* Component chips — click to add */}
              {componentMasters.length === 0 ? (
                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 mb-4">
                  No component masters available. Create them first.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {componentMasters.map(cm => {
                    const isAdded = overrideComponents.some(c => (c.payrollMasterComponentId || c.payrollComponentMasterId) === cm.id);
                    const isCompanyFixed = cm.valueType === 'COMPANY_FIXED';
                    const hasDefault = cm.defaultValue != null;
                    return (
                      <button
                        key={cm.id}
                        type="button"
                        onClick={() => {
                          if (!isAdded) {
                            setOverrideComponents([...overrideComponents, {
                              payrollMasterComponentId: cm.id!,
                              payrollMasterComponent: cm,
                              valueType: cm.valueType,
                              value: hasDefault ? cm.defaultValue! : 0,
                              isActive: true,
                              remarks: '',
                            }]);
                          }
                        }}
                        disabled={isAdded}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          isAdded
                            ? 'bg-[#0445AD]/10 text-[#0445AD] opacity-60 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-[#0445AD]/10 hover:text-[#0445AD]'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-[#0445AD]" /> : <Plus className="w-3.5 h-3.5" />}
                        {cm.name}
                        {isCompanyFixed && hasDefault && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">uses default</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected overrides — set values */}
              {overrideComponents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Override Values</p>
                  {overrideComponents.map((c, i) => {
                    const cm = componentMasters.find(m => m.id === (c.payrollMasterComponentId || c.payrollComponentMasterId));
                    const componentValueType = cm?.valueType || c.valueType;
                    const isCompanyFixed = componentValueType === 'COMPANY_FIXED';
                    const hasDefault = cm?.defaultValue != null;
                    const isEditable = !isCompanyFixed || !hasDefault;
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-xl items-center">
                        <div className="col-span-4">
                          <p className="text-xs font-semibold text-gray-800 truncate">{cm?.name || '—'}</p>
                          <p className="text-[10px] text-gray-400">{VALUE_TYPE_LABELS[componentValueType as PayStructureValueType] || componentValueType}</p>
                        </div>
                        {isEditable ? (
                          <input
                            type="number"
                            value={c.value ?? ''}
                            onChange={(e) => {
                              const updated = [...overrideComponents];
                              updated[i] = { ...updated[i], value: parseFloat(e.target.value) || 0 };
                              setOverrideComponents(updated);
                            }}
                            placeholder={isCompanyFixed ? 'Set amount' : 'Amount / %'}
                            className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0445AD]"
                          />
                        ) : (
                          <div className="col-span-4 flex items-center gap-1 px-2">
                            <span className="text-xs text-blue-600 font-semibold">₹{cm.defaultValue!.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-gray-400">(default)</span>
                          </div>
                        )}
                        <label className="col-span-1 flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={c.isActive}
                            onChange={(e) => {
                              const updated = [...overrideComponents];
                              updated[i] = { ...updated[i], isActive: e.target.checked };
                              setOverrideComponents(updated);
                            }}
                            className="w-4 h-4 text-[#0445AD] border-gray-300 rounded"
                          />
                        </label>
                        <button onClick={() => setOverrideComponents(overrideComponents.filter((_, idx) => idx !== i))}
                          className="col-span-1 p-1.5 text-red-400 hover:text-red-600 flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                        <p className="col-span-1 text-[10px] text-gray-400 text-center">Active</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveOverrides} disabled={loading}
                  className="px-4 py-2 bg-[#0445AD] text-white rounded-xl text-sm font-semibold hover:bg-[#033080] disabled:opacity-50 flex items-center gap-2">
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}Save Overrides
                </button>
              </div>
            </div>
          ) : (
            /* Employee Table — shown when no employee is selected */
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={overrideSearch} onChange={(e) => setOverrideSearch(e.target.value)}
                    placeholder="Search by name, email, code..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]" />
                </div>
              </div>

              {loading && allEmployees.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading employees...</div>
              ) : overrideFilteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No employees found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Employee', 'Code', 'Department', 'Designation', 'Salary', 'Bank', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {overrideFilteredEmployees.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#0445AD]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#0445AD]">
                                {(u.name || 'U').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{u.name || '—'}</p>
                                <p className="text-xs text-gray-400">{u.email || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                              {u.employeeProfile?.employeeCode || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{u.department?.name || '—'}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{u.designation?.name || '—'}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                            {u.employeeProfile?.salary ? `₹${u.employeeProfile.salary.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            {u.bankAccount?.isVerified ? (
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">Verified</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => handleSelectOverrideUser(u)}
                              className="px-3 py-1.5 bg-[#0445AD]/10 text-[#0445AD] rounded-lg text-xs font-semibold hover:bg-[#0445AD]/20 transition flex items-center gap-1">
                              <Settings className="w-3.5 h-3.5" /> Override
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LISTING TAB ───────────────────────────────────── */}
      {activeTab === 'listing' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap bg-white rounded-2xl border border-gray-200 p-4">
            <select value={listMonth} onChange={(e) => setListMonth(Number(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={listYear} onChange={(e) => setListYear(Number(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
              <option value="">All Years</option>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={listStatus} onChange={(e) => setListStatus(e.target.value as PayrollStatus | '')}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]">
              <option value="">All Statuses</option>
              {(['DRAFT', 'PROCESSED', 'DISBURSING', 'PAID', 'FAILED', 'CANCELLED'] as PayrollStatus[]).map(s => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search employee..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0445AD]" />
            </div>
            <button onClick={() => dispatch(fetchAllPayrolls({}))}
              className="p-2.5 text-gray-500 hover:text-[#0445AD] border border-gray-200 rounded-xl hover:bg-blue-50" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3"><div className="h-14 bg-gray-100 rounded-xl animate-pulse" /><div className="h-14 bg-gray-100 rounded-xl animate-pulse" /></div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState icon={DollarSign} title="No payroll records found" subtitle="Try adjusting filters or generate payroll" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-50 border-b border-gray-200">
                    {['Employee', 'Pay Structure', 'Month', 'Base Salary', 'Items', 'Net Salary', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0445AD]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#0445AD]">
                              {(r.user?.name || r.employeeName || 'U').charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{r.user?.name || r.employeeName || '—'}</p>
                              <p className="text-xs text-gray-400">{r.user?.email || r.employeeEmail || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{r.payStructure?.name || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatMonth(r.month, r.year)}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">₹{fmt(r.baseSalary)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            {r.items?.slice(0, 2).map(item => (
                              <div key={item.id} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${item.type === 'EARNING' || item.type === 'ALLOWANCE' ? 'bg-green-400' : item.type === 'DEDUCTION' || item.type === 'TAX' ? 'bg-red-400' : 'bg-purple-400'}`} />
                                <span className="text-xs text-gray-600 truncate max-w-[100px]">{item.label}</span>
                                <span className={`text-xs font-semibold ${item.type === 'DEDUCTION' || item.type === 'TAX' ? 'text-red-500' : 'text-green-600'}`}>
                                  {item.type === 'DEDUCTION' || item.type === 'TAX' ? '-' : '+'}₹{fmt(item.amount)}
                                </span>
                              </div>
                            ))}
                            {(r.items?.length ?? 0) > 2 && (
                              <span className="text-[10px] text-gray-400">+{(r.items?.length ?? 0) - 2} more</span>
                            )}
                            {(r.items?.length ?? 0) === 0 && <span className="text-xs text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-bold text-green-700">₹{fmt(r.netSalary)}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3.5 flex gap-1">
                            <button onClick={() => handleViewDetail(r)}
                              className="p-1.5 text-gray-400 hover:text-[#0445AD] border border-gray-200 rounded-lg hover:bg-blue-50" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            {r.status === 'DRAFT' && (
                              <button onClick={() => { setAdjustRecord(r); setShowAdjustModal(true); }}
                                className="p-1.5 text-gray-400 hover:text-yellow-600 border border-gray-200 rounded-lg hover:bg-yellow-50" title="Adjust">
                                <Settings className="w-4 h-4" />
                              </button>
                            )}
                            {(r.status === 'DRAFT') && (
                              <button onClick={() => { setProcessRecord(r); setShowProcessModal(true); }}
                                className="px-2.5 py-1 bg-[#0445AD] text-white rounded-lg text-xs font-semibold hover:bg-[#033080]" title="Process">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {r.status === 'PROCESSED' && (
                              <button onClick={() => handleAction('disbursing', r.id)}
                                className="px-2.5 py-1 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600">Disburse</button>
                            )}
                            {r.status === 'DISBURSING' && (
                              <button onClick={() => handleAction('paid', r.id)}
                                className="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">Paid</button>
                            )}
                            {r.status !== 'PAID' && r.status !== 'CANCELLED' && (
                              <button onClick={() => handleAction('failed', r.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50" title="Failed">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
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

      {/* ── MODALS ────────────────────────────────────────── */}
      <ComponentMasterModal
        open={showComponentModal} editing={editingComponent}
        onClose={() => { setShowComponentModal(false); setEditingComponent(null); }}
        onSave={handleSaveComponent} loading={loading}
      />

      <PayStructureModal
        open={showStructureModal} editing={editingStructure}
        departments={departments}
        components={componentMasters}
        onClose={() => { setShowStructureModal(false); setEditingStructure(null); }}
        onSave={handleSaveStructure} loading={loading}
      />

      <GeneratePayrollModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerate} loading={generating}
      />

      <ProcessPayrollModal
        open={showProcessModal} record={processRecord}
        onClose={() => { setShowProcessModal(false); setProcessRecord(null); }}
        onProcess={handleProcess} loading={processing}
      />

      <AdjustUserModal
        open={showAdjustModal} record={adjustRecord}
        onClose={() => { setShowAdjustModal(false); setAdjustRecord(null); }}
        onAdjust={handleAdjustUser} loading={processing}
      />

      <PayrollDetailModal
        open={showDetailModal} record={detailRecord}
        onClose={() => { setShowDetailModal(false); setDetailRecord(null); }}
        onAction={handleAction} loading={processing}
      />

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.label || 'Confirm Action'}
        message="Are you sure you want to perform this action? This will update the payroll status."
        confirmLabel={confirmAction?.label || 'Confirm'}
        confirmVariant={confirmAction?.variant}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={!!deleteStructureId}
        title="Delete Pay Structure"
        message="Are you sure you want to delete this pay structure? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleDeleteStructure}
        onCancel={() => setDeleteStructureId(null)}
      />
    </div>
  );
}
