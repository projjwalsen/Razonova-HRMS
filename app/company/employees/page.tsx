'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface SalaryConfig {
  baseSalary: number;
  currency: string;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    pension: number;
    insurance: number;
    other: number;
  };
  effectiveDate: string;
}

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'departments' | 'salary'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState<any>(null);
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig>({
    baseSalary: 0,
    currency: 'USD',
    paymentFrequency: 'monthly',
    allowances: {
      housing: 0,
      transport: 0,
      medical: 0,
      other: 0,
    },
    deductions: {
      tax: 0,
      pension: 0,
      insurance: 0,
      other: 0,
    },
    effectiveDate: '',
  });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.employee-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0'; // Start hidden
    });
  }, [activeTab, showAddForm]);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1 (234) 567-8901',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      employeeId: 'EMP001',
      joinDate: '2020-03-15',
      status: 'Active',
      salary: 95000,
      manager: 'Sarah Johnson',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (234) 567-8902',
      department: 'Marketing',
      position: 'Marketing Manager',
      employeeId: 'EMP002',
      joinDate: '2019-06-20',
      status: 'Active',
      salary: 85000,
      manager: 'Mike Johnson',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 (234) 567-8903',
      department: 'Engineering',
      position: 'Tech Lead',
      employeeId: 'EMP003',
      joinDate: '2018-01-10',
      status: 'Active',
      salary: 110000,
      manager: 'Sarah Johnson',
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@company.com',
      phone: '+1 (234) 567-8904',
      department: 'HR',
      position: 'HR Manager',
      employeeId: 'EMP004',
      joinDate: '2017-05-15',
      status: 'Active',
      salary: 80000,
      manager: 'David Brown',
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      phone: '+1 (234) 567-8905',
      department: 'Finance',
      position: 'Financial Analyst',
      employeeId: 'EMP005',
      joinDate: '2021-09-01',
      status: 'On Leave',
      salary: 75000,
      manager: 'Lisa Anderson',
    },
  ]);

  const departments = [
    { name: 'Engineering', head: 'Sarah Johnson', employees: 45, budget: '$4,500,000' },
    { name: 'Marketing', head: 'Mike Johnson', employees: 20, budget: '$1,200,000' },
    { name: 'HR', head: 'David Brown', employees: 8, budget: '$400,000' },
    { name: 'Finance', head: 'Lisa Anderson', employees: 12, budget: '$800,000' },
    { name: 'Sales', head: 'Jennifer Martinez', employees: 35, budget: '$2,100,000' },
  ];

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    employeeId: '',
    joinDate: '',
    status: 'Active',
    salary: '',
    manager: '',
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = {
      id: employees.length + 1,
      ...newEmployee,
      salary: Number(newEmployee.salary),
    };
    setEmployees([...employees, employee]);
    setShowAddForm(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      position: '',
      employeeId: '',
      joinDate: '',
      status: 'Active',
      salary: '',
      manager: '',
    });
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployees(employees.map(emp =>
      emp.id === editingEmployee.id ? { ...editingEmployee } : emp
    ));
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 employee-item">
              <div>
                <h1 className="text-3xl font-bold font-['Montserrat']">Employee Management</h1>
                <p className="text-gray-600 mt-1">Manage your workforce efficiently</p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingEmployee(null);
                }}
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
              >
                + Add Employee
              </button>
            </div>

            {/* Add/Edit Employee Form */}
            {showAddForm && (
              <div className="mb-8 employee-item">
                <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 font-['Montserrat']">
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h2>
                  <form onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">First Name *</label>
                        <input
                          type="text"
                          value={editingEmployee ? editingEmployee.firstName : newEmployee.firstName}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                            : setNewEmployee({ ...newEmployee, firstName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={editingEmployee ? editingEmployee.lastName : newEmployee.lastName}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                            : setNewEmployee({ ...newEmployee, lastName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email *</label>
                        <input
                          type="email"
                          value={editingEmployee ? editingEmployee.email : newEmployee.email}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, email: e.target.value })
                            : setNewEmployee({ ...newEmployee, email: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input
                          type="tel"
                          value={editingEmployee ? editingEmployee.phone : newEmployee.phone}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                            : setNewEmployee({ ...newEmployee, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Department *</label>
                        <select
                          value={editingEmployee ? editingEmployee.department : newEmployee.department}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, department: e.target.value })
                            : setNewEmployee({ ...newEmployee, department: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Position *</label>
                        <input
                          type="text"
                          value={editingEmployee ? editingEmployee.position : newEmployee.position}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, position: e.target.value })
                            : setNewEmployee({ ...newEmployee, position: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Employee ID *</label>
                        <input
                          type="text"
                          value={editingEmployee ? editingEmployee.employeeId : newEmployee.employeeId}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, employeeId: e.target.value })
                            : setNewEmployee({ ...newEmployee, employeeId: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Join Date *</label>
                        <input
                          type="date"
                          value={editingEmployee ? editingEmployee.joinDate : newEmployee.joinDate}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })
                            : setNewEmployee({ ...newEmployee, joinDate: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Status</label>
                        <select
                          value={editingEmployee ? editingEmployee.status : newEmployee.status}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, status: e.target.value })
                            : setNewEmployee({ ...newEmployee, status: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Salary *</label>
                        <input
                          type="number"
                          value={editingEmployee ? editingEmployee.salary : newEmployee.salary}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })
                            : setNewEmployee({ ...newEmployee, salary: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Manager</label>
                        <input
                          type="text"
                          value={editingEmployee ? editingEmployee.manager : newEmployee.manager}
                          onChange={(e) => editingEmployee
                            ? setEditingEmployee({ ...editingEmployee, manager: e.target.value })
                            : setNewEmployee({ ...newEmployee, manager: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                      >
                        {editingEmployee ? 'Update Employee' : 'Add Employee'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingEmployee(null);
                        }}
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
            <div className="mb-6 employee-item">
              <div className="flex gap-4 border-b-2 border-gray-200">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === 'list'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Employee List
                </button>
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === 'salary'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Salary Setup
                </button>
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === 'departments'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Departments
                </button>
              </div>
            </div>

            {/* Employee List */}
            {activeTab === 'list' && (
              <div className="employee-item">
                {/* Filters */}
                <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option value="all">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="text-gray-600">
                        Showing {filteredEmployees.length} of {employees.length} employees
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Table */}
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Employee ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Position</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Join Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{employee.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{employee.employeeId}</td>
                            <td className="py-3 px-4">{employee.department}</td>
                            <td className="py-3 px-4">{employee.position}</td>
                            <td className="py-3 px-4">{employee.joinDate}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Tooltip content="Edit Employee">
                                  <button
                                    onClick={() => handleEditEmployee(employee)}
                                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Delete Employee">
                                  <button
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </Tooltip>
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

            {/* Salary Setup */}
            {activeTab === 'salary' && (
              <div className="employee-item">
                {!selectedEmployeeForSalary ? (
                  /* Employee Selection for Salary */
                  <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                    <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Select Employee for Salary Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employees.map((employee) => (
                        <div
                          key={employee.id}
                          onClick={() => {
                            setSelectedEmployeeForSalary(employee);
                            setSalaryConfig({
                              baseSalary: employee.salary || 0,
                              currency: 'USD',
                              paymentFrequency: 'monthly',
                              allowances: {
                                housing: 0,
                                transport: 0,
                                medical: 0,
                                other: 0,
                              },
                              deductions: {
                                tax: 0,
                                pension: 0,
                                insurance: 0,
                                other: 0,
                              },
                              effectiveDate: new Date().toISOString().split('T')[0],
                            });
                          }}
                          className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-black cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                              <p className="text-xs text-gray-600">{employee.position}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{employee.department}</p>
                          <p className="text-lg font-bold text-green-600 mt-2">
                            ${employee.salary?.toLocaleString() || '0'}/year
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Salary Configuration Form */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration Form */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                              <DollarSign className="w-5 h-5" />
                              Salary Configuration
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedEmployeeForSalary.firstName} {selectedEmployeeForSalary.lastName} - {selectedEmployeeForSalary.position}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedEmployeeForSalary(null)}
                            className="text-gray-400 hover:text-black"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Base Salary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Base Salary (Annual) *</label>
                            <input
                              type="number"
                              value={salaryConfig.baseSalary}
                              onChange={(e) => setSalaryConfig({ ...salaryConfig, baseSalary: Number(e.target.value) })}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Currency *</label>
                            <select
                              value={salaryConfig.currency}
                              onChange={(e) => setSalaryConfig({ ...salaryConfig, currency: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="INR">INR (₹)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Payment Frequency *</label>
                            <select
                              value={salaryConfig.paymentFrequency}
                              onChange={(e) => setSalaryConfig({ ...salaryConfig, paymentFrequency: e.target.value as any })}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="bi-weekly">Bi-Weekly</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>
                        </div>

                        {/* Allowances */}
                        <div className="mb-6">
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Allowances
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Housing</label>
                              <input
                                type="number"
                                value={salaryConfig.allowances.housing}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  allowances: { ...salaryConfig.allowances, housing: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Transport</label>
                              <input
                                type="number"
                                value={salaryConfig.allowances.transport}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  allowances: { ...salaryConfig.allowances, transport: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Medical</label>
                              <input
                                type="number"
                                value={salaryConfig.allowances.medical}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  allowances: { ...salaryConfig.allowances, medical: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Other</label>
                              <input
                                type="number"
                                value={salaryConfig.allowances.other}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  allowances: { ...salaryConfig.allowances, other: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Deductions */}
                        <div className="mb-6">
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Percent className="w-4 h-4 text-red-600" />
                            Deductions
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Income Tax (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={salaryConfig.deductions.tax}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  deductions: { ...salaryConfig.deductions, tax: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Pension (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={salaryConfig.deductions.pension}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  deductions: { ...salaryConfig.deductions, pension: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Insurance (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={salaryConfig.deductions.insurance}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  deductions: { ...salaryConfig.deductions, insurance: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Other (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={salaryConfig.deductions.other}
                                onChange={(e) => setSalaryConfig({
                                  ...salaryConfig,
                                  deductions: { ...salaryConfig.deductions, other: Number(e.target.value) }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Effective Date */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Effective Date *
                          </label>
                          <input
                            type="date"
                            value={salaryConfig.effectiveDate}
                            onChange={(e) => setSalaryConfig({ ...salaryConfig, effectiveDate: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                            required
                          />
                        </div>

                        <div className="flex gap-4">
                          <button className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                            Save Salary Configuration
                          </button>
                          <button
                            onClick={() => setSelectedEmployeeForSalary(null)}
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Salary Summary */}
                    <div className="lg:col-span-1">
                      <div className="p-6 bg-white rounded-xl border-2 border-gray-100 sticky top-8">
                        <h3 className="text-lg font-bold mb-6 font-['Montserrat']">Salary Summary</h3>

                        <div className="space-y-4">
                          {/* Base Salary */}
                          <div className="pb-4 border-b border-gray-200">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Base Salary (Annual)</span>
                              <span className="font-bold">${salaryConfig.baseSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Per Month</span>
                              <span className="font-semibold">${(salaryConfig.baseSalary / 12).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Total Allowances */}
                          <div className="pb-4 border-b border-gray-200">
                            <div className="text-sm text-green-600 mb-2">Total Allowances (Annual)</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Housing</span>
                                <span>${salaryConfig.allowances.housing * 12}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transport</span>
                                <span>${salaryConfig.allowances.transport * 12}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Medical</span>
                                <span>${salaryConfig.allowances.medical * 12}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Other</span>
                                <span>${salaryConfig.allowances.other * 12}</span>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                              <span className="font-semibold text-green-600">Total</span>
                              <span className="font-bold text-green-600">
                                ${((salaryConfig.allowances.housing + salaryConfig.allowances.transport + salaryConfig.allowances.medical + salaryConfig.allowances.other) * 12).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Total Deductions */}
                          <div className="pb-4 border-b border-gray-200">
                            <div className="text-sm text-red-600 mb-2">Total Deductions</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Tax ({salaryConfig.deductions.tax}%)</span>
                                <span>${((salaryConfig.baseSalary * salaryConfig.deductions.tax) / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pension ({salaryConfig.deductions.pension}%)</span>
                                <span>${((salaryConfig.baseSalary * salaryConfig.deductions.pension) / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Insurance ({salaryConfig.deductions.insurance}%)</span>
                                <span>${((salaryConfig.baseSalary * salaryConfig.deductions.insurance) / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Other ({salaryConfig.deductions.other}%)</span>
                                <span>${((salaryConfig.baseSalary * salaryConfig.deductions.other) / 100).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                              <span className="font-semibold text-red-600">Total</span>
                              <span className="font-bold text-red-600">
                                -${((salaryConfig.baseSalary * (salaryConfig.deductions.tax + salaryConfig.deductions.pension + salaryConfig.deductions.insurance + salaryConfig.deductions.other)) / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Net Salary */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Annual Net Salary</div>
                            <div className="text-2xl font-bold text-green-700 mb-2">
                              ${(
                                salaryConfig.baseSalary +
                                ((salaryConfig.allowances.housing + salaryConfig.allowances.transport + salaryConfig.allowances.medical + salaryConfig.allowances.other) * 12) -
                                ((salaryConfig.baseSalary * (salaryConfig.deductions.tax + salaryConfig.deductions.pension + salaryConfig.deductions.insurance + salaryConfig.deductions.other)) / 100)
                              ).toLocaleString()}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Monthly Net</span>
                              <span className="font-bold text-green-700">
                                ${(
                                  (salaryConfig.baseSalary +
                                  ((salaryConfig.allowances.housing + salaryConfig.allowances.transport + salaryConfig.allowances.medical + salaryConfig.allowances.other) * 12) -
                                  ((salaryConfig.baseSalary * (salaryConfig.deductions.tax + salaryConfig.deductions.pension + salaryConfig.deductions.insurance + salaryConfig.deductions.other)) / 100)
                                  ) / 12
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Departments */}
            {activeTab === 'departments' && (
              <div className="employee-item">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map((dept, index) => (
                    <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold font-['Montserrat']">{dept.name}</h3>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white">
                          <Building className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department Head:</span>
                          <span className="font-semibold">{dept.head}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-semibold">{dept.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-semibold">{dept.budget}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
