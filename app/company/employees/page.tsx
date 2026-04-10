'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCheck,
  X,
  Edit,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDepartments,
} from '@/store/actions/departmentActions';
import {
  fetchDesignations,
} from '@/store/actions/designationActions';
import {
  createEmployeeAndInvite,
  fetchPendingInvitations,
  resendInvitation,
  clearOnboardingError,
} from '@/store/actions/onboardingActions';
import {
  fetchUserSelectOptions,
  updateUser,
  UserSelectOption,
  UpdateUserPayload,
  EmploymentType,
} from '@/store/actions/leaveActions';

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'TRAINEE', label: 'Trainee' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'OTHER', label: 'Other' },
];

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HR', label: 'HR Manager' },
  { value: 'MANAGER', label: 'Manager' },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = '', ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  );
}

function Select({ className = '', children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function Modal({ open, onClose, title, children, size = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${size} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />;
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector((state) => state.departments);
  const { designations } = useAppSelector((state) => state.designations);
  const { pendingInvitations, inviting, resending, error } = useAppSelector(
    (state) => state.onboarding
  );
  const { submitting } = useAppSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'pending'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState('');

  // Employee list state
  const [employees, setEmployees] = useState<UserSelectOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserSelectOption | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Update form state
  const [updateForm, setUpdateForm] = useState<UpdateUserPayload>({});

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    roleId: '',
    employeeCode: '',
    joiningDate: '',
    proposedSalary: '',
  });

  // Fetch employees
  const fetchEmployees = () => {
    setLoadingEmployees(true);
    dispatch(fetchUserSelectOptions()).then((result) => {
      setLoadingEmployees(false);
      if (fetchUserSelectOptions.fulfilled.match(result)) {
        setEmployees(result.payload);
      }
    });
  };

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
    dispatch(fetchPendingInvitations());
    if (activeTab === 'list') {
      fetchEmployees();
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (activeTab === 'list') fetchEmployees();
  }, [activeTab]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.employee-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showAddForm]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openUpdateModal = (emp: UserSelectOption) => {
    setSelectedEmployee(emp);
    setUpdateForm({
      name: emp.name,
      phone: emp.phone || '',
      departmentId: emp.department?.id || '',
      designationId: emp.designation?.id || '',
      managerId: emp.managerId || '',
      isActive: emp.isActive ?? true,
      employeeCode: emp.employeeCode || '',
      employmentType: (emp.employmentType as EmploymentType) || 'FULL_TIME',
      joiningDate: emp.joiningDate || '',
      probationMonths: emp.probationMonths || 0,
      salary: emp.salary || 0,
      dateOfBirth: emp.dateOfBirth || '',
      addressLine1: emp.addressLine1 || '',
      addressLine2: emp.addressLine2 || '',
      city: emp.city || '',
      state: emp.state || '',
      country: emp.country || '',
      pinCode: emp.pinCode || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const result = await dispatch(updateUser({ userId: selectedEmployee.id, payload: updateForm }));
    if (updateUser.fulfilled.match(result)) {
      setShowUpdateModal(false);
      setToast({ msg: 'Employee updated successfully', type: 'success' });
      fetchEmployees();
    } else {
      setToast({ msg: 'Failed to update employee', type: 'error' });
    }
  };

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      designationId: '',
      roleId: '',
      employeeCode: '',
      joiningDate: '',
      proposedSalary: '',
    });
    setFormError('');
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
    setActiveTab('add');
  };

  const closeForm = () => {
    setShowAddForm(false);
    resetForm();
    dispatch(clearOnboardingError());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!form.firstName.trim()) { setFormError('First name is required'); return; }
    if (!form.lastName.trim()) { setFormError('Last name is required'); return; }
    if (!form.email.trim()) { setFormError('Email is required'); return; }

    const result = await dispatch(
      createEmployeeAndInvite({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
        roleId: form.roleId || undefined,
        employeeCode: form.employeeCode || undefined,
        joiningDate: form.joiningDate || undefined,
        proposedSalary: form.proposedSalary ? Number(form.proposedSalary) : undefined,
      })
    );

    if (createEmployeeAndInvite.fulfilled.match(result)) {
      closeForm();
      setActiveTab('pending');
      dispatch(fetchPendingInvitations());
    }
  };

  const handleResend = async (inviteId: string) => {
    await dispatch(resendInvitation(inviteId));
  };

  const filteredEmployees = employees.filter((emp) =>
    !employeeSearch ||
    emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.department?.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.designation?.name?.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const filteredInvitations = pendingInvitations.filter(
    (inv) =>
      inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Toast = () => toast ? (
    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border flex items-center gap-2 ${
      toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      {toast.msg}
      <button onClick={() => setToast(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
    </div>
  ) : null;

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
            onClick={openAddForm}
            className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Toast */}
        <Toast />

        {/* Error Message */}
        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error || formError}
          </div>
        )}

        {/* Add Employee Form */}
        {showAddForm && (
          <div className="mb-8 employee-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <h2 className="text-2xl font-bold mb-6 font-['Montserrat']">
                Add New Employee
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="First Name" required>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Enter first name" required />
                  </Field>
                  <Field label="Last Name" required>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Enter last name" required />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" required />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Phone">
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
                  </Field>
                  <Field label="Department">
                    <Select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value, designationId: '' })}>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Designation">
                    <Select value={form.designationId} onChange={(e) => setForm({ ...form, designationId: e.target.value })} disabled={!form.departmentId}>
                      <option value="">Select Designation</option>
                      {designations
                        .filter((d) => d.departmentId === form.departmentId)
                        .map((desig) => (
                          <option key={desig.id} value={desig.id}>{desig.name}</option>
                        ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Role">
                    <Select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                      <option value="">Select Role</option>
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="Employee Code">
                    <Input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} placeholder="e.g., EMP001" />
                  </Field>
                  <Field label="Joining Date">
                    <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Proposed Salary">
                    <Input type="number" value={form.proposedSalary} onChange={(e) => setForm({ ...form, proposedSalary: e.target.value })} placeholder="Enter salary" />
                  </Field>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    {inviting ? 'Adding...' : 'Add Employee'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
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
                activeTab === 'list' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Employee List
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'add' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'pending' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Mail className="w-4 h-4" />
              Pending Invitations
              {pendingInvitations.length > 0 && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  {pendingInvitations.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Employee List Tab */}
        {activeTab === 'list' && (
          <div className="employee-item space-y-5">
            {/* Search + Count */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={fetchEmployees}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Employee Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Employees', value: employees.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active', value: employees.filter((e) => e.isActive !== false).length, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Inactive', value: employees.filter((e) => e.isActive === false).length, color: 'text-gray-600', bg: 'bg-gray-50' },
                { label: 'Departments', value: [...new Set(employees.map((e) => e.department?.id).filter(Boolean))].length, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl border border-transparent p-4 text-center`}>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Employee Table */}
            {loadingEmployees ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400 text-sm mt-3">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No employees found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add new employees</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Employee', 'Department', 'Designation', 'Status', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {getInitials(emp.name || '')}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{emp.name || '—'}</p>
                                <p className="text-xs text-gray-400">{emp.email || '—'}</p>
                                {emp.employeeCode && <p className="text-[10px] text-gray-400 font-mono">{emp.employeeCode}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{emp.department?.name || '—'}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{emp.designation?.name || '—'}</td>
                          {/* <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                              {emp.employmentType?.replace('_', ' ') || 'FULL_TIME'}
                            </span>
                          </td> */}
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${emp.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {emp.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-400 whitespace-nowrap">{formatDate(emp.joiningDate)}</td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => openUpdateModal(emp)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="employee-item space-y-4">
            {/* Search */}
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                />
              </div>
            </div>

            {pendingInvitations.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'No invitations found matching your search' : 'No pending invitations. Add an employee to send an invitation.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvitations.map((inv) => (
                  <div key={inv.id} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-[#0445AD] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {inv.firstName[0]}{inv.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{inv.firstName} {inv.lastName}</p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Mail className="w-4 h-4" /> {inv.email}
                          </p>
                          {(inv.department?.name || inv.designation?.name) && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              {inv.department?.name}{inv.designation?.name && ` / ${inv.designation?.name}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {inv.status.toUpperCase() === 'PENDING' && (
                          <button
                            onClick={() => handleResend(inv.id)}
                            disabled={resending}
                            className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                          >
                            <UserCheck className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                            Reinvite
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Employee Tab (without form) */}
        {activeTab === 'add' && !showAddForm && (
          <div className="employee-item">
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <Plus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">Click the &quot;Add Employee&quot; button above to add a new employee.</p>
              <button
                onClick={openAddForm}
                className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Employee
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Employee Modal */}
      <Modal open={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Employee" size="max-w-3xl">
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Info */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Basic Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <Input value={updateForm.name || ''} onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} placeholder="Full name" required />
              </Field>
              <Field label="Phone">
                <Input type="tel" value={updateForm.phone || ''} onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })} placeholder="Phone number" />
              </Field>
              <Field label="Employee Code">
                <Input value={updateForm.employeeCode || ''} onChange={(e) => setUpdateForm({ ...updateForm, employeeCode: e.target.value })} placeholder="e.g., EMP001" />
              </Field>
              {/* <Field label="Employment Type">
                <Select value={updateForm.employmentType || 'FULL_TIME'} onChange={(e) => setUpdateForm({ ...updateForm, employmentType: e.target.value as EmploymentType })}>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </Field> */}
            </div>
          </div>

          {/* Department & Designation */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Department &amp; Role</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Department">
                <Select value={updateForm.departmentId || ''} onChange={(e) => setUpdateForm({ ...updateForm, departmentId: e.target.value, designationId: '' })}>
                  <option value="">Select Department</option>
                  {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </Select>
              </Field>
              <Field label="Designation">
                <Select value={updateForm.designationId || ''} onChange={(e) => setUpdateForm({ ...updateForm, designationId: e.target.value })}>
                  <option value="">Select Designation</option>
                  {designations
                    .filter((d) => d.departmentId === updateForm.departmentId)
                    .map((desig) => <option key={desig.id} value={desig.id}>{desig.name}</option>)}
                  </Select>
              </Field>
              <Field label="Manager ID">
                <Input value={updateForm.managerId || ''} onChange={(e) => setUpdateForm({ ...updateForm, managerId: e.target.value })} placeholder="Manager user ID" />
              </Field>
              <Field label="Probation (Months)">
                <Input type="number" min={0} value={updateForm.probationMonths || 0} onChange={(e) => setUpdateForm({ ...updateForm, probationMonths: +e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Dates & Salary */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Joining &amp; Salary</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Joining Date">
                <Input type="date" value={updateForm.joiningDate || ''} onChange={(e) => setUpdateForm({ ...updateForm, joiningDate: e.target.value })} />
              </Field>
              <Field label="Date of Birth">
                <Input type="date" value={updateForm.dateOfBirth || ''} onChange={(e) => setUpdateForm({ ...updateForm, dateOfBirth: e.target.value })} />
              </Field>
              <Field label="Salary">
                <Input type="number" value={updateForm.salary || ''} onChange={(e) => setUpdateForm({ ...updateForm, salary: +e.target.value })} placeholder="Monthly salary" />
              </Field>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Address Line 1">
                <Input value={updateForm.addressLine1 || ''} onChange={(e) => setUpdateForm({ ...updateForm, addressLine1: e.target.value })} placeholder="Street address" />
              </Field>
              <Field label="Address Line 2">
                <Input value={updateForm.addressLine2 || ''} onChange={(e) => setUpdateForm({ ...updateForm, addressLine2: e.target.value })} placeholder="Apt, suite, etc." />
              </Field>
              <Field label="City">
                <Input value={updateForm.city || ''} onChange={(e) => setUpdateForm({ ...updateForm, city: e.target.value })} placeholder="City" />
              </Field>
              <Field label="State">
                <Input value={updateForm.state || ''} onChange={(e) => setUpdateForm({ ...updateForm, state: e.target.value })} placeholder="State" />
              </Field>
              <Field label="Country">
                <Input value={updateForm.country || ''} onChange={(e) => setUpdateForm({ ...updateForm, country: e.target.value })} placeholder="Country" />
              </Field>
              <Field label="Pin Code">
                <Input value={updateForm.pinCode || ''} onChange={(e) => setUpdateForm({ ...updateForm, pinCode: e.target.value })} placeholder="Postal code" />
              </Field>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-800">Account Status</p>
              <p className="text-xs text-gray-500">Disable to deactivate this employee's account</p>
            </div>
            <Toggle
              checked={updateForm.isActive ?? true}
              onChange={(v) => setUpdateForm({ ...updateForm, isActive: v })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !updateForm.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Spinner /> : <CheckCircle className="w-4 h-4" />} Update Employee
            </button>
            <button type="button" onClick={() => setShowUpdateModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
