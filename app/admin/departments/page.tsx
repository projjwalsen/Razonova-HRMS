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
import Tooltip from '@/components/Tooltip';

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.department-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showAddForm]);

  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Engineering',
      head: 'Sarah Johnson',
      employeeCount: 45,
      budget: 4500000,
      location: 'Building A, Floor 3',
      description: 'Software development and IT infrastructure',
    },
    {
      id: 2,
      name: 'Marketing',
      head: 'Mike Johnson',
      employeeCount: 20,
      budget: 1200000,
      location: 'Building B, Floor 2',
      description: 'Digital marketing, branding, and communications',
    },
    {
      id: 3,
      name: 'Human Resources',
      head: 'David Brown',
      employeeCount: 8,
      budget: 400000,
      location: 'Building A, Floor 1',
      description: 'Recruitment, employee relations, and payroll',
    },
    {
      id: 4,
      name: 'Finance',
      head: 'Lisa Anderson',
      employeeCount: 12,
      budget: 800000,
      location: 'Building C, Floor 1',
      description: 'Financial planning, accounting, and reporting',
    },
    {
      id: 5,
      name: 'Sales',
      head: 'Jennifer Martinez',
      employeeCount: 35,
      budget: 2100000,
      location: 'Building B, Floor 3',
      description: 'Sales operations and client relationships',
    },
  ]);

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    head: '',
    employeeCount: 0,
    budget: '',
    location: '',
    description: '',
  });

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const department = {
      id: departments.length + 1,
      ...newDepartment,
      budget: Number(newDepartment.budget),
    };
    setDepartments([...departments, department]);
    setShowAddForm(false);
    setNewDepartment({
      name: '',
      head: '',
      employeeCount: 0,
      budget: '',
      location: '',
      description: '',
    });
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setShowAddForm(true);
  };

  const handleDeleteDepartment = (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(dept => dept.id !== id));
    }
  };

  const handleUpdateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    setDepartments(departments.map(dept =>
      dept.id === editingDepartment.id ? { ...editingDepartment } : dept
    ));
    setShowAddForm(false);
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 department-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Department Management</h1>
            <p className="text-gray-600 mt-1">Manage your company departments</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingDepartment(null);
            }}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        {/* Add/Edit Department Form */}
        {showAddForm && (
          <div className="mb-8 department-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <h2 className="text-2xl font-bold mb-6 font-['Montserrat']">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <form onSubmit={editingDepartment ? handleUpdateDepartment : handleAddDepartment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Department Name *</label>
                    <input
                      type="text"
                      value={editingDepartment ? editingDepartment.name : newDepartment.name}
                      onChange={(e) => editingDepartment
                        ? setEditingDepartment({ ...editingDepartment, name: e.target.value })
                        : setNewDepartment({ ...newDepartment, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Department Head *</label>
                    <input
                      type="text"
                      value={editingDepartment ? editingDepartment.head : newDepartment.head}
                      onChange={(e) => editingDepartment
                        ? setEditingDepartment({ ...editingDepartment, head: e.target.value })
                        : setNewDepartment({ ...newDepartment, head: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Employee Count</label>
                    <input
                      type="number"
                      value={editingDepartment ? editingDepartment.employeeCount : newDepartment.employeeCount}
                      onChange={(e) => editingDepartment
                        ? setEditingDepartment({ ...editingDepartment, employeeCount: Number(e.target.value) })
                        : setNewDepartment({ ...newDepartment, employeeCount: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Budget *</label>
                    <input
                      type="number"
                      value={editingDepartment ? editingDepartment.budget : newDepartment.budget}
                      onChange={(e) => editingDepartment
                        ? setEditingDepartment({ ...editingDepartment, budget: Number(e.target.value) })
                        : setNewDepartment({ ...newDepartment, budget: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    value={editingDepartment ? editingDepartment.location : newDepartment.location}
                    onChange={(e) => editingDepartment
                      ? setEditingDepartment({ ...editingDepartment, location: e.target.value })
                      : setNewDepartment({ ...newDepartment, location: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Building and floor information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={editingDepartment ? editingDepartment.description : newDepartment.description}
                    onChange={(e) => editingDepartment
                      ? setEditingDepartment({ ...editingDepartment, description: e.target.value })
                      : setNewDepartment({ ...newDepartment, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                    placeholder="Brief description of the department's function"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                  >
                    {editingDepartment ? 'Update Department' : 'Add Department'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDepartment(null);
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

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div key={department.id} className="department-item p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <Tooltip content="Edit">
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 font-['Montserrat']">{department.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{department.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Head:</span>
                  <span className="font-semibold">{department.head}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Employees:</span>
                  <span className="font-semibold">{department.employeeCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold">{formatBudget(department.budget)}</span>
                </div>
                {department.location && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{department.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 department-item">
          <div className="p-6 bg-black text-white rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Departments</p>
                <p className="text-3xl font-bold mt-1 font-['Montserrat']">{departments.length}</p>
              </div>
              <Building className="w-12 h-12 text-white/20" />
            </div>
          </div>
          <div className="p-6 bg-black text-white rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Employees</p>
                <p className="text-3xl font-bold mt-1 font-['Montserrat']">
                  {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-white/20" />
            </div>
          </div>
          <div className="p-6 bg-black text-white rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Budget</p>
                <p className="text-3xl font-bold mt-1 font-['Montserrat']">
                  {formatBudget(departments.reduce((sum, dept) => sum + dept.budget, 0))}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
