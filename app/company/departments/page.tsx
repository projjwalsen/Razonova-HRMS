'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearDepartmentError,
  Department,
} from '@/store/actions/departmentActions';

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();
  const { departments, loading, saving, error } = useAppSelector(
    (state) => state.departments
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: '',
    head: '',
    employeeCount: 0,
    budget: '',
    location: '',
    description: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll('.department-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [showAddForm]);

  const resetForm = () => {
    setForm({
      name: '',
      head: '',
      employeeCount: 0,
      budget: '',
      location: '',
      description: '',
    });
    setFormError('');
  };

  const openAddForm = () => {
    setEditingDepartment(null);
    resetForm();
    setShowAddForm(true);
  };

  const openEditForm = (dept: Department) => {
    setEditingDepartment(dept);
    setForm({
      name: dept.name || '',
      head: dept.head || '',
      employeeCount: dept.employeeCount || 0,
      budget: dept.budget || '',
      location: dept.location || '',
      description: dept.description || '',
    });
    setFormError('');
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingDepartment(null);
    resetForm();
    dispatch(clearDepartmentError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Department name is required');
      return;
    }

    const payload = {
      name: form.name,
      head: form.head,
      employeeCount: form.employeeCount,
      budget: form.budget,
      location: form.location,
      description: form.description,
    };

    if (editingDepartment) {
      await dispatch(
        updateDepartment({ id: editingDepartment.id, name: form.name })
      );
    } else {
      await dispatch(createDepartment({ name: form.name }));
    }

    closeForm();
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteDepartment(id));
    setDeleteConfirm(null);
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.head && dept.head.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 department-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">
              Department Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your company departments
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        {/* Error Message */}
        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error || formError}
          </div>
        )}

        {/* Add/Edit Department Form */}
        {showAddForm && (
          <div className="mb-8 department-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <h2 className="text-2xl font-bold mb-6 font-['Montserrat']">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Department Head
                    </label>
                    <input
                      type="text"
                      value={form.head}
                      onChange={(e) =>
                        setForm({ ...form, head: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Enter head name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      value={form.employeeCount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          employeeCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Budget
                    </label>
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Enter budget"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Building and floor information"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                    placeholder="Brief description of the department's function"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                  >
                    {saving
                      ? 'Saving...'
                      : editingDepartment
                        ? 'Update Department'
                        : 'Add Department'}
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

        {/* Search */}
        <div className="mb-6 department-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
            <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? 'No departments found matching your search'
                : 'No departments found. Add your first department to get started.'}
            </p>
          </div>
        ) : (
          /* Department Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="department-item p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(dept)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {deleteConfirm === dept.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(dept.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 font-['Montserrat']">
                  {dept.name}
                </h3>
                {dept.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {dept.description}
                  </p>
                )}

                <div className="space-y-3">
                  {dept.head && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Head:</span>
                      <span className="font-semibold">{dept.head}</span>
                    </div>
                  )}
                  {dept.employeeCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-semibold">{dept.employeeCount}</span>
                    </div>
                  )}
                  {dept.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold">{dept.budget}</span>
                    </div>
                  )}
                  {dept.location && (
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{dept.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && departments.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 department-item">
            <div className="p-6 bg-[#0445AD] text-white rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Departments</p>
                  <p className="text-3xl font-bold mt-1 font-['Montserrat']">
                    {departments.length}
                  </p>
                </div>
                <Building className="w-12 h-12 text-white/20" />
              </div>
            </div>
            <div className="p-6 bg-[#0445AD] text-white rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Employees</p>
                  <p className="text-3xl font-bold mt-1 font-['Montserrat']">
                    {departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)}
                  </p>
                </div>
                <Users className="w-12 h-12 text-white/20" />
              </div>
            </div>
            <div className="p-6 bg-[#0445AD] text-white rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Budget</p>
                  <p className="text-3xl font-bold mt-1 font-['Montserrat']">
                    {departments.reduce((sum, dept) => {
                      const budget = parseFloat(String(dept.budget || 0));
                      return sum + (isNaN(budget) ? 0 : budget);
                    }, 0).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-white/20" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
