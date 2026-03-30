"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearDepartmentError,
  Department,
} from "@/store/actions/departmentActions";

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();
  const { departments, loading, saving, deleting, error } = useAppSelector(
    (state) => state.departments
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const resetForm = () => {
    setDepartmentName("");
    setEditingDepartment(null);
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleOpenModal = (department?: Department) => {
    dispatch(clearDepartmentError());
    if (department) {
      setEditingDepartment(department);
      setDepartmentName(department.name);
    } else {
      setEditingDepartment(null);
      setDepartmentName("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) return;

    setSuccessMessage("");

    let result;
    if (editingDepartment) {
      result = await dispatch(
        updateDepartment({ id: editingDepartment.id, name: departmentName })
      );
      if (updateDepartment.fulfilled.match(result)) {
        setSuccessMessage("Department updated successfully!");
      }
    } else {
      result = await dispatch(createDepartment({ name: departmentName }));
      if (createDepartment.fulfilled.match(result)) {
        setSuccessMessage("Department created successfully!");
      }
    }

    if (result && (createDepartment.fulfilled.match(result) || updateDepartment.fulfilled.match(result))) {
      resetForm();
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    setSuccessMessage("");
    const result = await dispatch(deleteDepartment(id));
    if (deleteDepartment.fulfilled.match(result)) {
      setSuccessMessage("Department deleted successfully!");
      setDeleteConfirm(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800 tracking-tight">
            Departments
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 text-sm font-bold text-white bg-[#1a3a8f] rounded-lg hover:bg-[#122d75] transition-colors shadow-sm"
          >
            + Add Department
          </button>
        </div>

        {(error || successMessage) && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              error
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-green-50 border border-green-200 text-green-600"
            }`}
          >
            {error || successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-[#1a3a8f] border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading departments...
            </div>
          ) : departments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No departments found</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Department" to create one</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="p-2 text-gray-400 hover:text-[#1a3a8f] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {deleteConfirm === dept.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(dept.id)}
                              disabled={deleting}
                              className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deleting ? "Deleting..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(dept.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0445AD]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editingDepartment ? "Edit Department" : "Add Department"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Department Name <span className="text-[#1a3a8f]">*</span>
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Enter department name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition"
                autoFocus
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !departmentName.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-[#1a3a8f] rounded-lg hover:bg-[#122d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingDepartment ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
