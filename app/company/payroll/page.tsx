'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DollarSign,
  Users,
  Clock,
  BarChart3,
  Download,
  FileText,
  Check,
  X,
  Calendar,
  Plus,
  Eye,
  Settings,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPayStructure,
  savePayStructure,
  fetchAllPayrolls,
  generatePayroll,
  processPayroll,
  fetchMyPayslips,
  setCurrentPayroll,
  updatePayrollItem,
  addPayrollItem,
  removePayrollItem,
  clearPayrollError,
  clearPayrollSuccess,
  PayStructure,
  PayrollRecord,
  PayrollItem,
} from '@/store/actions/payrollActions';
import { fetchDepartments } from '@/store/actions/departmentActions';
import { fetchDesignations } from '@/store/actions/designationActions';

export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const {
    payStructures,
    payrollRecords,
    myPayslips,
    currentPayroll,
    loading,
    processing,
    generating,
    error,
    successMessage,
  } = useAppSelector((state) => state.payroll);
  const { departments } = useAppSelector((state) => state.departments);
  const { designations } = useAppSelector((state) => state.designations);

  const [activeTab, setActiveTab] = useState<'overview' | 'payslips' | 'generate' | 'structure'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [editingStructure, setEditingStructure] = useState<PayStructure | null>(null);
  const [newItem, setNewItem] = useState<PayrollItem>({
    label: '',
    type: 'EARNING',
    amount: 0,
    description: '',
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // Structure form state
  const [structureForm, setStructureForm] = useState<PayStructure>({
    name: '',
    departmentId: '',
    designationId: '',
    isDefault: false,
    components: [],
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchPayStructure());
    dispatch(fetchAllPayrolls());
    dispatch(fetchMyPayslips());
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  // Fetch departments and designations when structure modal opens
  useEffect(() => {
    if (showStructureModal) {
      dispatch(fetchDepartments());
      dispatch(fetchDesignations());
    }
  }, [showStructureModal, dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearPayrollError());
        dispatch(clearPayrollSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.payroll-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const handleGeneratePayroll = async () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const result = await dispatch(generatePayroll({ month, year }));
    if (generatePayroll.fulfilled.match(result)) {
      dispatch(fetchAllPayrolls());
    }
  };

  const handleProcessPayroll = async () => {
    if (!currentPayroll?.components || currentPayroll.components.length === 0) {
      alert('Please add at least one item before processing');
      return;
    }
    const result = await dispatch(
      processPayroll({
        payrollId: currentPayroll.id,
        items: currentPayroll.components,
      })
    );
    if (processPayroll.fulfilled.match(result)) {
      setShowProcessModal(false);
      dispatch(fetchAllPayrolls());
      dispatch(fetchMyPayslips());
    }
  };

  const handleOpenProcessModal = (payroll: PayrollRecord) => {
    dispatch(setCurrentPayroll(payroll));
    setShowProcessModal(true);
  };

  const handleAddItem = () => {
    if (!newItem.label || newItem.amount <= 0) {
      alert('Please enter label and amount');
      return;
    }
    if (currentPayroll) {
      dispatch(addPayrollItem(newItem));
    }
    setNewItem({ label: '', type: 'EARNING', amount: 0, description: '' });
  };

  const handleRemoveItem = (index: number) => {
    dispatch(removePayrollItem(index));
  };

  const handleDownloadPayslip = (payslip: any) => {
    setSelectedPayslip(payslip);
    setShowPayslipModal(true);
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(savePayStructure(structureForm));
    setShowStructureModal(false);
    setEditingStructure(null);
    setStructureForm({
      name: '',
      departmentId: '',
      designationId: '',
      isDefault: false,
      components: [],
    });
    dispatch(fetchPayStructure());
  };

  const handleEditStructure = (structure: PayStructure) => {
    setEditingStructure(structure);
    setStructureForm(structure);
    setShowStructureModal(true);
  };

  const handleAddNewStructure = () => {
    setEditingStructure(null);
    setStructureForm({
      name: '',
      departmentId: '',
      designationId: '',
      isDefault: false,
      components: [],
    });
    setShowStructureModal(true);
  };

  const handleAddStructureComponent = () => {
    setStructureForm({
      ...structureForm,
      components: [
        ...structureForm.components,
        {
          label: '',
          componentType: 'BASIC',
          valueType: 'PERCENTAGE',
          value: 0,
          isTaxable: false,
          attachmentRequired: false,
        },
      ],
    });
  };

  const handleRemoveStructureComponent = (index: number) => {
    setStructureForm({
      ...structureForm,
      components: structureForm.components.filter((_, i) => i !== index),
    });
  };

  const handleUpdateStructureComponent = (index: number, field: string, value: any) => {
    const updated = [...structureForm.components];
    updated[index] = { ...updated[index], [field]: value };
    setStructureForm({ ...structureForm, components: updated });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'PROCESSED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getMonthName = (month: number) => {
    const date = new Date(2026, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Calculate summary
  const totalPayroll = payrollRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const processedCount = payrollRecords.filter((p) => p.status === 'PROCESSED' || p.status === 'PAID').length;
  const pendingCount = payrollRecords.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 payroll-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Payroll Management</h1>
            <p className="text-gray-600 mt-1">Manage salaries, payslips, and compensation</p>
          </div>
          <button
            onClick={() => setActiveTab('structure')}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Structure
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearPayrollError())} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 payroll-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">{payrollRecords.length} employees</span>
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">
              ₹{totalPayroll.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Payroll</div>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat'] text-green-600">{processedCount}</div>
            <div className="text-sm text-gray-600">Processed</div>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat'] text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">
              ₹{payrollRecords.length > 0 ? Math.round(totalPayroll / payrollRecords.length).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Avg. Salary</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 payroll-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              All Payrolls
            </button>
            <button
              onClick={() => setActiveTab('payslips')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'payslips'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              My Payslips
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'generate'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Generate Payroll
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'structure'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Pay Structure
            </button>
          </div>
        </div>

        {/* All Payrolls */}
        {activeTab === 'overview' && (
          <div className="payroll-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                </div>
              ) : payrollRecords.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No payroll records found</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="mt-4 px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                  >
                    Generate Payroll
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Month</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Basic</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Gross</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Deductions</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Net Salary</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="font-semibold">{record.employeeName}</div>
                            <div className="text-xs text-gray-500">{record.employeeEmail}</div>
                          </td>
                          <td className="py-3 px-4">{formatMonth(record.month, record.year)}</td>
                          <td className="py-3 px-4">₹{record.basicSalary?.toLocaleString() || 0}</td>
                          <td className="py-3 px-4">₹{record.grossSalary?.toLocaleString() || 0}</td>
                          <td className="py-3 px-4 text-red-600">
                            ₹{(record.totalDeductions || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-green-600">
                            ₹{record.netSalary?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {formatStatus(record.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {record.status === 'DRAFT' && (
                              <button
                                onClick={() => handleOpenProcessModal(record)}
                                className="px-3 py-1 bg-[#0445AD] text-white rounded text-xs font-semibold hover:bg-blue-700"
                              >
                                Process
                              </button>
                            )}
                            {record.status !== 'DRAFT' && (
                              <button
                                onClick={() => handleDownloadPayslip(record)}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                              >
                                View
                              </button>
                            )}
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

        {/* My Payslips */}
        {activeTab === 'payslips' && (
          <div className="payroll-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
                </div>
              ) : myPayslips.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No payslips available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Month</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Pay Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Basic Salary</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Earnings</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Deductions</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Net Salary</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayslips.map((payslip) => (
                        <tr key={payslip.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{payslip.monthName || formatMonth(payslip.month, payslip.year)}</td>
                          <td className="py-3 px-4">{formatDate(payslip.payDate || " ")}</td>
                          <td className="py-3 px-4">₹{payslip.basicSalary?.toLocaleString() || 0}</td>
                          <td className="py-3 px-4 text-green-600">₹{payslip.allowances?.toLocaleString() || 0}</td>
                          <td className="py-3 px-4 text-red-600">₹{payslip.deductions?.toLocaleString() || 0}</td>
                          <td className="py-3 px-4 font-bold text-green-600">
                            ₹{payslip.netSalary?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payslip.status)}`}>
                              {formatStatus(payslip.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDownloadPayslip(payslip)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                            >
                              View
                            </button>
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

        {/* Generate Payroll */}
        {activeTab === 'generate' && (
          <div className="payroll-item">
            <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-['Montserrat']">Generate Payroll</h3>
                  <p className="text-gray-600 mt-1">Select month to generate payroll for all employees</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                  <button
                    onClick={handleGeneratePayroll}
                    disabled={generating}
                    className="px-6 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Generate Payroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {payrollRecords.length > 0 && (
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">
                  Payroll for {formatMonth(parseInt(selectedMonth.split('-')[1]), parseInt(selectedMonth.split('-')[0]))}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Basic</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Gross</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Deductions</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Net</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRecords
                        .filter((p) => {
                          const [year, month] = selectedMonth.split('-').map(Number);
                          return p.year === year && p.month === month;
                        })
                        .map((record) => (
                          <tr key={record.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium">{record.employeeName}</td>
                            <td className="py-3 px-4">₹{record.basicSalary?.toLocaleString() || 0}</td>
                            <td className="py-3 px-4">₹{record.grossSalary?.toLocaleString() || 0}</td>
                            <td className="py-3 px-4 text-red-600">₹{(record.totalDeductions || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-green-600">₹{record.netSalary?.toLocaleString() || 0}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                {formatStatus(record.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {record.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleOpenProcessModal(record)}
                                  className="px-3 py-1 bg-[#0445AD] text-white rounded text-xs font-semibold hover:bg-blue-700"
                                >
                                  Process
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

        {/* Pay Structure */}
        {activeTab === 'structure' && (
          <div className="payroll-item">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-['Montserrat']">Pay Structure Configuration</h2>
              <button
                onClick={handleAddNewStructure}
                className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
              </div>
            ) : payStructures.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No pay structures configured</p>
                <button
                  onClick={handleAddNewStructure}
                  className="mt-4 px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                >
                  Add First Structure
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payStructures.map((structure) => {
                  const deptName = departments.find(d => d.id === structure.departmentId)?.name;
                  const desName = designations.find(d => d.id === structure.designationId)?.name;
                  return (
                    <div key={structure.id} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold font-['Montserrat']">{structure.name}</h3>
                        <button
                          onClick={() => handleEditStructure(structure)}
                          className="p-2 text-gray-400 hover:text-[#0445AD] transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                      {deptName && (
                        <p className="text-sm text-gray-600 mb-1">Dept: {deptName}</p>
                      )}
                      {desName && (
                        <p className="text-sm text-gray-600 mb-2">Designation: {desName}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Components:</span>
                          <span className="font-semibold">{structure.components?.length || 0}</span>
                        </div>
                      </div>
                      {structure.isDefault && (
                        <span className="mt-3 inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && currentPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Process Payroll - {currentPayroll.employeeName}</h3>
              <button onClick={() => setShowProcessModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Basic Salary:</span>
                    <span className="ml-2 font-semibold">₹{currentPayroll.basicSalary?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gross:</span>
                    <span className="ml-2 font-semibold">₹{currentPayroll.grossSalary?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Net Salary:</span>
                    <span className="ml-2 font-semibold text-green-600">₹{currentPayroll.netSalary?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Add Additional Items</h4>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Label"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                />
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'EARNING' | 'DEDUCTION' })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                >
                  <option value="EARNING">Earning</option>
                  <option value="DEDUCTION">Deduction</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newItem.amount || ''}
                  onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                />
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              {currentPayroll.components && currentPayroll.components.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Items</h4>
                  {currentPayroll.components.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded ${item.type === 'EARNING' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.type === 'EARNING' ? '+' : '-'}
                        </span>
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={item.type === 'EARNING' ? 'text-green-600' : 'text-red-600'}>
                          ₹{item.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleProcessPayroll}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process Payroll'}
                </button>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Payslip - {formatMonth(selectedPayslip.month, selectedPayslip.year)}</h3>
              <button onClick={() => setShowPayslipModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-600">Employee</p>
                <p className="text-lg font-bold">{selectedPayslip.employeeName || 'You'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-semibold">₹{selectedPayslip.basicSalary?.toLocaleString() || 0}</span>
                </div>
                {selectedPayslip.components?.map((item: PayrollItem, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={item.type === 'EARNING' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {item.type === 'EARNING' ? '+' : '-'}₹{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gross Salary</span>
                  <span className="font-semibold">₹{selectedPayslip.grossSalary?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                  <span>Deductions</span>
                  <span className="font-semibold">-₹{(selectedPayslip.totalDeductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg">
                  <span className="font-bold text-green-700">Net Salary</span>
                  <span className="font-bold text-green-700">₹{selectedPayslip.netSalary?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingStructure ? 'Edit Pay Structure' : 'Add New Pay Structure'}
              </h3>
              <button onClick={() => setShowStructureModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStructure} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Structure Name</label>
                  <input
                    type="text"
                    value={structureForm.name}
                    onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                    placeholder="e.g., Engineering Structure"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Department</label>
                  <select
                    value={structureForm.departmentId}
                    onChange={(e) => setStructureForm({ ...structureForm, departmentId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Designation</label>
                  <select
                    value={structureForm.designationId}
                    onChange={(e) => setStructureForm({ ...structureForm, designationId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des.id} value={des.id}>
                        {des.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={structureForm.isDefault}
                      onChange={(e) => setStructureForm({ ...structureForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                    />
                    <span className="text-sm font-semibold">Set as Default</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Components</h4>
                  <button
                    type="button"
                    onClick={handleAddStructureComponent}
                    className="px-3 py-1 bg-[#0445AD] text-white rounded text-sm font-semibold hover:bg-blue-700"
                  >
                    + Add Component
                  </button>
                </div>

                {structureForm.components.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No components added yet</p>
                )}

                {structureForm.components.map((component, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Component {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStructureComponent(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Label (e.g., Basic Pay)"
                        value={component.label}
                        onChange={(e) => handleUpdateStructureComponent(index, 'label', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                        required
                      />
                      <select
                        value={component.componentType}
                        onChange={(e) => handleUpdateStructureComponent(index, 'componentType', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      >
                        <option value="BASIC">Basic</option>
                        <option value="HRA">HRA</option>
                        <option value="DA">DA</option>
                        <option value="ALLOWANCE">Allowance</option>
                        <option value="BONUS">Bonus</option>
                        <option value="DEDUCTION">Deduction</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <select
                        value={component.valueType}
                        onChange={(e) => handleUpdateStructureComponent(index, 'valueType', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      >
                        <option value="FLAT">Fixed Amount</option>
                        <option value="PERCENTAGE">Percentage</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Value"
                        value={component.value}
                        onChange={(e) => handleUpdateStructureComponent(index, 'value', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                        required
                      />
                      <div className="col-span-2 flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={component.isTaxable}
                            onChange={(e) => handleUpdateStructureComponent(index, 'isTaxable', e.target.checked)}
                            className="w-4 h-4 text-[#0445AD] border-gray-300 rounded focus:ring-[#0445AD]"
                          />
                          <span className="text-sm">Taxable</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Structure'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
