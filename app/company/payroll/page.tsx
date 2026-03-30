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
} from 'lucide-react';

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payslips' | 'generate' | 'tax'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.payroll-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const payrollSummary = [
    { label: 'Total Payroll', value: '$284,700', change: '+2.5%', icon: DollarSign },
    { label: 'Processed This Month', value: '45', change: 'employees', icon: Users },
    { label: 'Pending', value: '3', change: 'reviews', icon: Clock },
    { label: 'Avg. Salary', value: '$6,327', change: '+1.2%', icon: BarChart3 },
  ];

  const myPayslips = [
    {
      id: 1,
      month: 'March 2024',
      payDate: '2024-03-31',
      basicSalary: 5000,
      allowances: 1000,
      deductions: 800,
      netSalary: 5200,
      status: 'Paid',
    },
    {
      id: 2,
      month: 'February 2024',
      payDate: '2024-02-29',
      basicSalary: 5000,
      allowances: 1000,
      deductions: 800,
      netSalary: 5200,
      status: 'Paid',
    },
    {
      id: 3,
      month: 'January 2024',
      payDate: '2024-01-31',
      basicSalary: 5000,
      allowances: 1000,
      deductions: 800,
      netSalary: 5200,
      status: 'Paid',
    },
  ];

  const payrollData = [
    {
      id: 1,
      employee: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      basicSalary: 5000,
      hra: 1500,
      da: 500,
      otherAllowances: 1000,
      grossSalary: 8000,
      pf: 600,
      tax: 800,
      otherDeductions: 200,
      totalDeductions: 1600,
      netSalary: 6400,
      status: 'Processed',
    },
    {
      id: 2,
      employee: 'Jane Smith',
      employeeId: 'EMP002',
      department: 'Marketing',
      basicSalary: 4500,
      hra: 1350,
      da: 450,
      otherAllowances: 800,
      grossSalary: 7100,
      pf: 540,
      tax: 650,
      otherDeductions: 150,
      totalDeductions: 1340,
      netSalary: 5760,
      status: 'Processed',
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      employeeId: 'EMP003',
      department: 'Engineering',
      basicSalary: 6000,
      hra: 1800,
      da: 600,
      otherAllowances: 1200,
      grossSalary: 9600,
      pf: 720,
      tax: 1000,
      otherDeductions: 250,
      totalDeductions: 1970,
      netSalary: 7630,
      status: 'Pending',
    },
  ];

  const taxInfo = [
    { financialYear: '2023-24', taxableIncome: 75000, taxPaid: 12000, refund: 0 },
    { financialYear: '2022-23', taxableIncome: 70000, taxPaid: 10500, refund: 500 },
    { financialYear: '2021-22', taxableIncome: 65000, taxPaid: 9500, refund: 0 },
  ];

  const handleDownloadPayslip = (id: number) => {
    alert(`Downloading payslip for ID: ${id}`);
  };

  const handleViewPayslip = (id: number) => {
    alert(`Viewing payslip details for ID: ${id}`);
  };

  const handleProcessPayroll = () => {
    alert('Processing payroll for selected month...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Processed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
            {/* Header */}
            <div className="mb-8 payroll-item">
              <h1 className="text-3xl font-bold font-['Montserrat']">Payroll Management</h1>
              <p className="text-gray-600 mt-1">Manage salaries, payslips, and compensation</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 payroll-item">
              {payrollSummary.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{item.change}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1 font-['Montserrat']">{item.value}</div>
                    <div className="text-sm text-gray-600">{item.label}</div>
                  </div>
                );
              })}
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
                  onClick={() => setActiveTab('tax')}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === 'tax'
                      ? 'text-[#0445AD] border-b-2 border-black'
                      : 'text-gray-500 hover:text-[#0445AD]'
                  }`}
                >
                  Tax Information
                </button>
              </div>
            </div>

            {/* My Payslips */}
            {activeTab === 'overview' && (
              <div className="payroll-item">
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-sm">Month</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Pay Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Basic Salary</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Allowances</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Deductions</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Net Salary</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myPayslips.map((payslip) => (
                          <tr key={payslip.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium">{payslip.month}</td>
                            <td className="py-3 px-4">{payslip.payDate}</td>
                            <td className="py-3 px-4">${payslip.basicSalary.toLocaleString()}</td>
                            <td className="py-3 px-4">${payslip.allowances.toLocaleString()}</td>
                            <td className="py-3 px-4">${payslip.deductions.toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-green-600">
                              ${payslip.netSalary.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payslip.status)}`}>
                                {payslip.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewPayslip(payslip.id)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadPayslip(payslip.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                                >
                                  Download
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

            {/* Generate Payroll */}
            {activeTab === 'generate' && (
              <div className="payroll-item">
                <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-['Montserrat']">Generate Payroll</h3>
                      <p className="text-gray-600 mt-1">Select month to process payroll</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                      <button
                        onClick={handleProcessPayroll}
                        className="px-6 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                      >
                        Process Payroll
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Payroll Details - {selectedMonth}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Basic</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">HRA</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">DA</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Other</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Gross</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">PF</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Tax</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Deductions</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Net Salary</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.map((data) => (
                          <tr key={data.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium">{data.employee}</td>
                            <td className="py-3 px-4">{data.employeeId}</td>
                            <td className="py-3 px-4">{data.department}</td>
                            <td className="py-3 px-4">${data.basicSalary.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.hra.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.da.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.otherAllowances.toLocaleString()}</td>
                            <td className="py-3 px-4 font-semibold">${data.grossSalary.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.pf.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.tax.toLocaleString()}</td>
                            <td className="py-3 px-4">${data.otherDeductions.toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-green-600">${data.netSalary.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(data.status)}`}>
                                {data.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Total Gross Salary</p>
                        <p className="text-2xl font-bold font-['Montserrat']">${payrollData.reduce((sum, data) => sum + data.grossSalary, 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Deductions</p>
                        <p className="text-2xl font-bold text-red-600 font-['Montserrat']">${payrollData.reduce((sum, data) => sum + data.totalDeductions, 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Net Salary</p>
                        <p className="text-2xl font-bold text-green-600 font-['Montserrat']">${payrollData.reduce((sum, data) => sum + data.netSalary, 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Employees</p>
                        <p className="text-2xl font-bold font-['Montserrat']">{payrollData.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Information */}
            {activeTab === 'tax' && (
              <div className="payroll-item">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Tax History */}
                  <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                    <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Tax History</h3>
                    <div className="space-y-4">
                      {taxInfo.map((tax, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{tax.financialYear}</span>
                            <span className="text-sm bg-gray-200 px-3 py-1 rounded-full font-medium">
                              {tax.refund > 0 ? `Refund: $${tax.refund}` : 'Paid'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Taxable Income:</span>
                              <span className="ml-2 font-semibold">${tax.taxableIncome.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tax Paid:</span>
                              <span className="ml-2 font-semibold">${tax.taxPaid.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tax Documents */}
                  <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                    <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Tax Documents</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-semibold">Form 16 - 2023-24</p>
                            <p className="text-sm text-gray-500">Tax deduction statement</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300">
                          Download
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-semibold">Form 16 - 2022-23</p>
                            <p className="text-sm text-gray-500">Tax deduction statement</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-300">
                          Download
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📊</span>
                          <div>
                            <p className="font-semibold">Tax Declaration - 2024-25</p>
                            <p className="text-sm text-gray-500">Submit your tax investments</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all duration-300">
                          Update
                        </button>
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
