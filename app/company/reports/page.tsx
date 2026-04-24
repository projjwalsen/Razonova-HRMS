'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  HandCoins,
  CalendarDays,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll' | 'leave' | 'recruitment'>('attendance');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.reports-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0'; // Start hidden
    });
  }, [activeTab]);

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Reports', icon: FileText, description: 'Employee attendance and time tracking' },
    { id: 'payroll', name: 'Payroll Reports', icon: HandCoins, description: 'Salary, deductions, and compensation' },
    { id: 'leave', name: 'Leave Reports', icon: CalendarDays, description: 'Leave balances and usage' },
    { id: 'recruitment', name: 'Recruitment Reports', icon: Users, description: 'Hiring and candidate metrics' },
  ];

  const attendanceData = {
    summary: [
      { label: 'Average Attendance', value: '94.5%', change: '+2.3%' },
      { label: 'On Time Arrival', value: '89.2%', change: '+1.5%' },
      { label: 'Overtime Hours', value: '124 hrs', change: '-8.5%' },
      { label: 'Absenteeism', value: '5.5%', change: '-1.2%' },
    ],
    byDepartment: [
      { department: 'Engineering', present: 42, total: 45, percentage: 93 },
      { department: 'Marketing', present: 18, total: 20, percentage: 90 },
      { department: 'HR', present: 8, total: 8, percentage: 100 },
      { department: 'Sales', present: 32, total: 35, percentage: 91 },
    ],
  };

  const payrollData = {
    summary: [
      { label: 'Total Payroll', value: '$284,700', change: '+2.5%' },
      { label: 'Average Salary', value: '$6,327', change: '+1.2%' },
      { label: 'Overtime Cost', value: '$8,450', change: '-5.8%' },
      { label: 'Benefits Cost', value: '$42,300', change: '+3.1%' },
    ],
    byDepartment: [
      { department: 'Engineering', amount: 125000, percentage: 44 },
      { department: 'Marketing', amount: 52000, percentage: 18 },
      { department: 'HR', amount: 38000, percentage: 13 },
      { department: 'Sales', amount: 69700, percentage: 25 },
    ],
  };

  const leaveData = {
    summary: [
      { label: 'Total Leave Days', value: '127', change: '+8' },
      { label: 'Annual Leave', value: '45 days', change: '35%' },
      { label: 'Sick Leave', value: '32 days', change: '25%' },
      { label: 'Casual Leave', value: '28 days', change: '22%' },
    ],
    byType: [
      { type: 'Annual Leave', used: 45, balance: 155 },
      { type: 'Sick Leave', used: 32, balance: 68 },
      { type: 'Casual Leave', used: 28, balance: 42 },
      { type: 'Maternity/Paternity', used: 0, balance: 90 },
    ],
  };

  const recruitmentData = {
    summary: [
      { label: 'Open Positions', value: '12', change: '+3' },
      { label: 'Total Applications', value: '156', change: '+24' },
      { label: 'Interviews Scheduled', value: '8', change: '+2' },
      { label: 'Time to Hire', value: '28 days', change: '-5 days' },
    ],
    pipeline: [
      { stage: 'Applied', count: 156, percentage: 100 },
      { stage: 'Screening', count: 48, percentage: 31 },
      { stage: 'Interview', count: 18, percentage: 12 },
      { stage: 'Offer', count: 5, percentage: 3 },
      { stage: 'Hired', count: 3, percentage: 2 },
    ],
  };

  const handleGenerateReport = () => {
    alert('Generating report...');
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 reports-item">
          <h1 className="text-3xl font-bold font-['Montserrat']">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and export HR reports</p>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 reports-item">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id as any)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  activeTab === type.id
                    ? 'bg-[#0445AD] text-white border-black'
                    : 'bg-white text-gray-900 border-gray-100 hover:border-black'
                }`}
              >
                <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${activeTab === type.id ? 'text-white' : 'text-white'}`} />
                </div>
                <h3 className="text-lg font-bold mb-1 font-['Montserrat']">{type.name}</h3>
                <p className={`text-sm ${activeTab === type.id ? 'text-gray-300' : 'text-gray-600'}`}>
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Period Selector */}
        <div className="mb-6 reports-item">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">Report Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                Generate Report
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                className="px-6 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-black"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="px-6 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-black"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Report */}
        {activeTab === 'attendance' && (
          <div className="reports-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {attendanceData.summary.map((item, index) => (
                <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-500">{item.change}</span>
                  </div>
                  <div className="text-2xl font-bold font-['Montserrat']">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Attendance by Department</h3>
                <div className="space-y-4">
                  {attendanceData.byDepartment.map((dept, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{dept.department}</span>
                        <span className="text-gray-600">{dept.present}/{dept.total} ({dept.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0445AD] h-2 rounded-full" style={{ width: `${dept.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Attendance Trends</h3>
                <div className="space-y-4">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{week}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#0445AD] h-2 rounded-full" style={{ width: `${90 + index * 2}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{90 + index * 2}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payroll Report */}
        {activeTab === 'payroll' && (
          <div className="reports-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {payrollData.summary.map((item, index) => (
                <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-500">{item.change}</span>
                  </div>
                  <div className="text-2xl font-bold font-['Montserrat']">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Payroll by Department</h3>
              <div className="space-y-4">
                {payrollData.byDepartment.map((dept, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-gray-600">${dept.amount.toLocaleString()} ({dept.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0445AD] h-2 rounded-full" style={{ width: `${dept.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leave Report */}
        {activeTab === 'leave' && (
          <div className="reports-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {leaveData.summary.map((item, index) => (
                <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-500">{item.change}</span>
                  </div>
                  <div className="text-2xl font-bold font-['Montserrat']">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Leave Usage by Type</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Leave Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Used</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.byType.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{item.type}</td>
                        <td className="py-3 px-4">{item.used} days</td>
                        <td className="py-3 px-4">{item.balance} days</td>
                        <td className="py-3 px-4">{item.used + item.balance} days</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#0445AD] h-2 rounded-full"
                                style={{ width: `${(item.used / (item.used + item.balance)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{Math.round((item.used / (item.used + item.balance)) * 100)}%</span>
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

        {/* Recruitment Report */}
        {activeTab === 'recruitment' && (
          <div className="reports-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {recruitmentData.summary.map((item, index) => (
                <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-500">{item.change}</span>
                  </div>
                  <div className="text-2xl font-bold font-['Montserrat']">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Recruitment Pipeline</h3>
              <div className="space-y-4">
                {recruitmentData.pipeline.map((stage, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-gray-600">{stage.count} candidates ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#0445AD] h-3 rounded-full transition-all duration-300" style={{ width: `${stage.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
