"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDepartments,
  Department,
} from "@/store/actions/departmentActions";
import {
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  Designation,
  clearDesignationError,
} from "@/store/actions/designationActions";

interface DesignationFormData {
  name: string;
  
}

export default function DesignationsPage() {
  const dispatch = useAppDispatch();
  const { departments, loading: deptLoading } = useAppSelector(
    (state) => state.departments
  );
  const { designations, loading: desigLoading, saving, error } = useAppSelector(
    (state) => state.designations
  );

  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DesignationFormData>({ name: "" });
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  const getDesignationsByDepartment = (deptId: string) => {
    return designations.filter((d) => d.departmentId === deptId);
  };

  const openAddModal = (deptId: string) => {
    setSelectedDeptId(deptId);
    setEditingDesignation(null);
    setFormData({ name: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (designation: Designation) => {
    setSelectedDeptId(designation.departmentId);
    setEditingDesignation(designation);
    setFormData({ name: designation.name });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ name: "" });
    setFormError("");
    dispatch(clearDesignationError());
  };

  const handleSubmit = async () => {
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Designation name is required");
      return;
    }
    
    if (!selectedDeptId) {
      setFormError("Department is required");
      return;
    }

    if (editingDesignation) {
      await dispatch(
        updateDesignation({
          id: editingDesignation.id,
          name: formData.name,
          departmentId: selectedDeptId,
          
        })
      );
    } else {
      await dispatch(
        createDesignation({
          name: formData.name,
          departmentId: selectedDeptId,
          
        })
      );
    }

    closeModal();
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteDesignation(id));
    setDeleteConfirm(null);
  };

  const loading = deptLoading || desigLoading;

  return (
    <div className="h-full p-6">
      <div className="w-full">
        <h2 className="text-base font-bold text-gray-800 mb-5 tracking-tight">
          Designations
        </h2>

        {(error || formError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error || formError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a8f]"></div>
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-sm text-gray-500">No departments found</p>
            <p className="text-xs text-gray-400 mt-1">
              Create a department first to add designations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {departments.map((dept) => {
              const deptDesignations = getDesignationsByDepartment(dept.id);
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Department Header */}
                  <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1a3a8f]/10 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#1a3a8f]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {dept.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-[#1a3a8f]/10 text-[#1a3a8f] text-xs font-medium rounded-full">
                        {deptDesignations.length}{" "}
                        {deptDesignations.length === 1 ? "designation" : "designations"}
                      </span>
                    </div>
                    <button
                      onClick={() => openAddModal(dept.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a3a8f] bg-white border border-[#1a3a8f]/20 rounded-lg hover:bg-[#1a3a8f]/5 transition"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Designation
                    </button>
                  </div>

                  {/* Designations List */}
                  {deptDesignations.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-sm text-gray-400">
                        No designations in this department
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {deptDesignations.map((desig) => (
                        <div
                          key={desig.id}
                          className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                              <svg
                                className="w-3.5 h-3.5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {desig.name}
                              </p>
                              
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(desig)}
                              className="p-1.5 text-gray-400 hover:text-[#1a3a8f] hover:bg-[#1a3a8f]/5 rounded-md transition"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            {deleteConfirm === desig.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(desig.id)}
                                  className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(desig.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                                title="Delete"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0445AD]/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                {editingDesignation ? "Edit Designation" : "Add Designation"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDeptId || ""}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 cursor-not-allowed"
                >
                  <option value="">
                    {departments.find((d) => d.id === selectedDeptId)?.name}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Designation Name <span className="text-[#1a3a8f]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Software Engineer"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition"
                />
              </div>

              
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white bg-[#1a3a8f] rounded-lg hover:bg-[#122d75] transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editingDesignation ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
