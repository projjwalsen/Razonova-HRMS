'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
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

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector((state) => state.departments);
  const { designations } = useAppSelector((state) => state.designations);
  const { pendingInvitations, inviting, resending, error } = useAppSelector(
    (state) => state.onboarding
  );

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'pending'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    // managerId: '',
    roleId: '',
    employeeCode: '',
    joiningDate: '',
    proposedSalary: '',
  });

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
    dispatch(fetchPendingInvitations());
  }, [dispatch]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.employee-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showAddForm]);

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      designationId: '',
      // managerId: '',
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

    if (!form.firstName.trim()) {
      setFormError('First name is required');
      return;
    }
    if (!form.lastName.trim()) {
      setFormError('Last name is required');
      return;
    }
    if (!form.email.trim()) {
      setFormError('Email is required');
      return;
    }

    const result = await dispatch(
      createEmployeeAndInvite({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
        // managerId: form.managerId || undefined,
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

  const filteredInvitations = pendingInvitations.filter(
    (inv) =>
      inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EXPIRED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'EXPIRED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            onClick={openAddForm}
            className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

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
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Department</label>
                    <select
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
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
                      value={form.designationId}
                      onChange={(e) => setForm({ ...form, designationId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      disabled={!form.departmentId}
                    >
                      <option value="">Select Designation</option>
                      {designations
                        .filter((d) => d.departmentId === form.departmentId)
                        .map((desig) => (
                          <option key={desig.id} value={desig.id}>
                            {desig.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* <div>
                    <label className="block text-sm font-semibold mb-2">Manager</label>
                    <input
                      type="text"
                      value={form.managerId}
                      onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Manager ID"
                    />
                  </div> */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Role</label>
                    <select
                      value={form.roleId}
                      onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                    >
                      <option value="">Select Role</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                      <option value="HR">HR Manager</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Employee Code</label>
                    <input
                      type="text"
                      value={form.employeeCode}
                      onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="e.g., EMP001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Joining Date</label>
                    <input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Proposed Salary</label>
                    <input
                      type="number"
                      value={form.proposedSalary}
                      onChange={(e) => setForm({ ...form, proposedSalary: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
                      placeholder="Enter salary"
                    />
                  </div>
                </div>

                {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      An invitation email will be sent to the employee&apos;s email address
                    </p>
                  </div>
                </div> */}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    {inviting ? 'Adding Employee...' : 'Add Employee'}
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
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
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
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === 'list'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Employee List
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="employee-item">
            {/* Search */}
            <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-100">
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

            {/* Pending Invitations List */}
            {pendingInvitations.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {searchTerm
                    ? 'No invitations found matching your search'
                    : 'No pending invitations. Add an employee to send an invitation.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-[#0445AD] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {inv.firstName[0]}{inv.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {inv.firstName} {inv.lastName}
                          </p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {inv.email}
                          </p>
                          {(inv.department?.name || inv.designation?.name) && (
                            <p className="text-gray-400 text-xs mt-1">
                              {inv.department?.name}
                              {inv.designation?.name && ` / ${inv.designation?.name}`}
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
                            Invite
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

        {/* Employee List Tab */}
        {activeTab === 'list' && (
          <div className="employee-item">
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <p className="text-gray-500">
                Employee list will appear here once invitations are accepted.
              </p>
            </div>
          </div>
        )}

        {/* Add Employee Tab (without form - just a prompt) */}
        {activeTab === 'add' && !showAddForm && (
          <div className="employee-item">
            <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
              <Plus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">
                Click the &quot;Add Employee&quot; button above to add a new employee and send invitation.
              </p>
              <button
                onClick={openAddForm}
                className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Employee
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
