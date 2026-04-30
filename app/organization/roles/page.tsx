"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Shield, Plus, Check, X, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, CheckCircle2, UserCog, Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllRoles,
  fetchAllPermissions,
  assignPermissionsToRole,
  assignRoleToUser,
  unassignRoleFromUser,
  transferRole,
  fetchUserSelectOptions,
  fetchAssignedUsers,
  createRole,
  RoleSummary,
  PermissionItem,
  RoleAssignedUsers,
} from "@/store/actions/authActions";
import { clearRbacError, clearRbacSuccess } from "@/store/slices/authSlice";

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupPermissions(perms: PermissionItem[]): Record<string, PermissionItem[]> {
  if (!Array.isArray(perms)) return {};
  return perms.reduce<Record<string, PermissionItem[]>>((acc, p) => {
    const key = p.module || "GENERAL";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}

// ── Sub-components ───────────────────────────────────────────────────────────────

function AlertBanner({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
      type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
    }`}>
      {type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const dispatch = useAppDispatch();
  const { allRoles, allPermissions, userSelectOptions, assignedUsers, rbacLoading, rbacError, rbacSuccess } = useAppSelector(
    (state) => state.auth
  );

  const [searchRole, setSearchRole] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleId, setAssignRoleId] = useState("");
  const [unassignUserId, setUnassignUserId] = useState("");
  const [unassignRoleId, setUnassignRoleId] = useState("");
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [transferRoleId, setTransferRoleId] = useState("");
  const [activeSection, setActiveSection] = useState<"roles" | "assign" | "transfer">("roles");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [pendingUnassign, setPendingUnassign] = useState<{ userId: string; roleId: string; userName: string; roleName: string } | null>(null);

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchAllPermissions());
    dispatch(fetchUserSelectOptions());
    dispatch(fetchAssignedUsers());
  }, [dispatch]);

  useEffect(() => {
    if (rbacError) {
      const t = setTimeout(() => dispatch(clearRbacError()), 4000);
      return () => clearTimeout(t);
    }
  }, [dispatch, rbacError]);

  useEffect(() => {
    if (rbacSuccess) {
      const t = setTimeout(() => dispatch(clearRbacSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [dispatch, rbacSuccess]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const filteredRoles = useMemo(() => {
    if (!Array.isArray(allRoles)) return [];
    return allRoles.filter((r) =>
      r.name.toLowerCase().includes(searchRole.toLowerCase())
    );
  }, [allRoles, searchRole]);

  const selectedRole = useMemo(() =>
    allRoles.find((r) => r.id === selectedRoleId) ?? null,
    [allRoles, selectedRoleId]
  );

  // Permissions already assigned to the selected role (from rolePermissions array)
  const assignedPermIds = useMemo(() => {
    if (!selectedRole?.rolePermissions) return new Set<string>();
    return new Set(selectedRole.rolePermissions.map((rp) => rp.permissionId));
  }, [selectedRole]);

  // Permissions NOT yet assigned — from the permissions list
  const availablePerms = useMemo(() => {
    if (!Array.isArray(allPermissions)) return [];
    return allPermissions.filter((p) => !assignedPermIds.has(p.id));
  }, [allPermissions, assignedPermIds]);

  const groupedAssigned = useMemo(() => groupPermissions(
    selectedRole?.rolePermissions?.map((rp) => rp.permission) ?? []
  ), [selectedRole]);

  const groupedAvailable = useMemo(() => groupPermissions(availablePerms), [availablePerms]);

  // ── Handlers ─────────────────────────────────────────────────────────────────────
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    const result = await dispatch(createRole({ name: newRoleName.trim() }));
    if (createRole.fulfilled.match(result)) {
      setNewRoleName("");
      setShowCreateModal(false);
      setSelectedRoleId(result.payload.id);
    }
  };

  const handleAssignPermissions = async (permId: string) => {
    if (!selectedRoleId) return;
    // Check if already assigned — if so, just return (toggle off is handled by backend or future unassign)
    if (assignedPermIds.has(permId)) return;
    // Assign one by one using the assignPermissionsToRole thunk
    await dispatch(assignPermissionsToRole({ roleId: selectedRoleId, permissionIds: [permId] }));
    // Re-fetch roles to get updated rolePermissions
    await dispatch(fetchAllRoles());
  };

  const handleUnassignPermission = async (permId: string) => {
    if (!selectedRoleId) return;
    // The backend should support unassign-permission endpoint
    // For now we just re-fetch — if no unassign endpoint exists, this is a placeholder
    await dispatch(fetchAllRoles());
  };

  const handleAssignRole = async () => {
    if (!assignUserId || !assignRoleId) return;
    await dispatch(assignRoleToUser({ userId: assignUserId, roleId: assignRoleId }));
    setAssignUserId(""); setAssignRoleId("");
  };

  const handleUnassignRole = async () => {
    if (!unassignUserId || !unassignRoleId) return;
    await dispatch(unassignRoleFromUser({ userId: unassignUserId, roleId: unassignRoleId }));
    setUnassignUserId(""); setUnassignRoleId("");
  };

  const handleTransferRole = async () => {
    if (!fromUserId || !toUserId || !transferRoleId) return;
    await dispatch(transferRole({ fromUserId, toUserId, roleId: transferRoleId }));
    setFromUserId(""); setToUserId(""); setTransferRoleId("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage roles, assign permissions, and control user access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { dispatch(fetchAllRoles()); dispatch(fetchAllPermissions()); dispatch(fetchUserSelectOptions()); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${rbacLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0445AD] hover:bg-[#033591] rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>
      </div>

      {/* Alerts */}
      {rbacError && (
        <AlertBanner message={rbacError} type="error" onDismiss={() => dispatch(clearRbacError())} />
      )}
      {rbacSuccess && (
        <AlertBanner message={rbacSuccess} type="success" onDismiss={() => dispatch(clearRbacSuccess())} />
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "roles", label: "Roles", icon: Users },
          { id: "assign", label: "Assign / Unassign Role", icon: UserCog },
          { id: "transfer", label: "Transfer Role", icon: RefreshCw },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeSection === tab.id
                ? "border-[#0445AD] text-[#0445AD]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ROLES SECTION ─────────────────────────────────────────────────────── */}
      {activeSection === "roles" && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Role List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Roles</p>
              <div className="relative">
                <input
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]"
                />
                <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {!filteredRoles.length ? (
                <div className="p-6 text-center text-sm text-gray-400">No roles found</div>
              ) : (
                filteredRoles.map((role) => {
                  const permCount = role.rolePermissions?.length ?? 0;
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition ${
                        isSelected ? "bg-[#0445AD]/5" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{role.name}</p>
                          {!role.isActive && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{role.type} • {permCount} permission{permCount !== 1 ? "s" : ""}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0445AD] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Permission Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {!selectedRole ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Shield className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-base font-semibold text-gray-400">Select a role</p>
                <p className="text-sm text-gray-400 mt-1">Choose a role from the left panel to manage its permissions</p>
              </div>
            ) : (
              <div>
                {/* Role header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#0445AD]/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-[#0445AD]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedRole.name}</p>
                      <p className="text-xs text-gray-400">{selectedRole.type} • {assignedPermIds.size} assigned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${selectedRole.isActive ? "bg-green-400" : "bg-red-400"}`} />
                    {selectedRole.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="max-h-[480px] overflow-y-auto">
                  {/* Assigned Permissions */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-4 h-4 text-green-500" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Assigned Permissions ({assignedPermIds.size})
                      </p>
                    </div>
                    {assignedPermIds.size === 0 ? (
                      <p className="text-xs text-gray-400 italic">No permissions assigned yet</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedAssigned).sort().map(([module, perms]) => (
                          <div key={module}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                                {module}
                              </span>
                              <span className="text-[10px] text-gray-400">{perms.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((perm) => (
                                <div
                                  key={perm.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700"
                                >
                                  <span>{perm.action}</span>
                                  {perm.name && <span className="text-green-500/60">· {perm.name}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Permissions to Assign */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Available to Assign ({availablePerms.length})
                      </p>
                    </div>
                    {availablePerms.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">All permissions assigned</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedAvailable).sort().map(([module, perms]) => (
                          <div key={module}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                                {module}
                              </span>
                              <span className="text-[10px] text-gray-400">{perms.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((perm) => (
                                <button
                                  key={perm.id}
                                  onClick={() => handleAssignPermissions(perm.id)}
                                  disabled={rbacLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 disabled:opacity-50 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{perm.action}</span>
                                  {perm.name && <span className="text-gray-400/60">· {perm.name}</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ASSIGN / UNASSIGN ROLE ──────────────────────────────────────────── */}
      {activeSection === "assign" && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Role list with assigned user counts */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-[#0445AD]" />
                <p className="text-sm font-bold text-gray-800">Users with Roles</p>
              </div>
              <button
                onClick={() => dispatch(fetchAssignedUsers())}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${rbacLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
              {assignedUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No role assignments found</p>
                </div>
              ) : (
                assignedUsers.map((roleEntry) => {
                  const role = allRoles.find((r) => r.id === roleEntry.roleId);
                  return (
                    <div key={roleEntry.roleId} className="px-5 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{roleEntry.roleName}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{roleEntry.roleType}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#0445AD] bg-[#0445AD]/10 px-2 py-0.5 rounded-full">
                          {roleEntry.totalAssigned} user{roleEntry.totalAssigned !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {roleEntry.assignedUsers.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No users assigned</p>
                      ) : (
                        <div className="space-y-1.5">
                          {roleEntry.assignedUsers.map((user) => (
                            <div key={user.userId} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg">
                              <div className="w-7 h-7 bg-[#0445AD]/10 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0445AD] shrink-0">
                                {(user.userName || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-700 truncate">{user.userName}</p>
                                <p className="text-[10px] text-gray-400 truncate">{user.userEmail}</p>
                              </div>
                              <button
                                onClick={() => setPendingUnassign({ userId: user.userId, roleId: roleEntry.roleId, userName: user.userName, roleName: roleEntry.roleName })}
                                disabled={rbacLoading}
                                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-40 transition"
                                title="Remove role"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Assign new role to user */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Plus className="w-5 h-5 text-[#0445AD]" />
              <h2 className="text-base font-bold text-gray-800">Assign Role to User</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select User</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]"
                >
                  <option value="">— Choose a user —</option>
                  {userSelectOptions.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Role</label>
                <select
                  value={assignRoleId}
                  onChange={(e) => setAssignRoleId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]"
                >
                  <option value="">— Choose a role —</option>
                  {(allRoles ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={async () => {
                  if (!assignUserId || !assignRoleId) return;
                  await dispatch(assignRoleToUser({ userId: assignUserId, roleId: assignRoleId }));
                  setAssignUserId(""); setAssignRoleId("");
                  dispatch(fetchAssignedUsers());
                }}
                disabled={rbacLoading || !assignUserId || !assignRoleId}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033591] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
              >
                {rbacLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSFER ROLE ───────────────────────────────────────────────────── */}
      {activeSection === "transfer" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <RefreshCw className="w-5 h-5 text-[#0445AD]" />
            <h2 className="text-base font-bold text-gray-800">Transfer Role Between Users</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Transfers the selected role from one user to another. The role will be removed from the source user and assigned to the destination user.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">From User</label>
              <select value={fromUserId} onChange={(e) => setFromUserId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]">
                <option value="">— From user —</option>
                {userSelectOptions.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">To User</label>
              <select value={toUserId} onChange={(e) => setToUserId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]">
                <option value="">— To user —</option>
                {userSelectOptions.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
              <select value={transferRoleId} onChange={(e) => setTransferRoleId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]">
                <option value="">— Select role —</option>
                {(allRoles ?? []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleTransferRole}
            disabled={rbacLoading || !fromUserId || !toUserId || !transferRoleId}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#0445AD] hover:bg-[#033591] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
          >
            {rbacLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Transfer Role
          </button>
        </div>
      )}

      {/* ── CREATE ROLE MODAL ───────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0445AD]" />
                <h2 className="text-lg font-bold text-gray-900">Create New Role</h2>
              </div>
              <button onClick={() => { setShowCreateModal(false); setNewRoleName(""); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role Name</label>
              <input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
                placeholder="e.g. PAYROLL_MANAGER"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD] uppercase placeholder:normal-case"
                autoFocus
              />
              <p className="text-[10px] text-gray-400 mt-1.5">Use UPPERCASE_WITH_UNDERSCORES naming</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateRole}
                disabled={rbacLoading || !newRoleName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0445AD] hover:bg-[#033591] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition"
              >
                {rbacLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Role
              </button>
              <button
                onClick={() => { setShowCreateModal(false); setNewRoleName(""); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UNASSIGN CONFIRMATION POPUP ──────────────────────────────────────── */}
      {pendingUnassign && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Remove Role?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-700">{pendingUnassign.userName}</span> from the role <span className="font-semibold text-gray-700">{pendingUnassign.roleName}</span>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await dispatch(unassignRoleFromUser({ userId: pendingUnassign.userId, roleId: pendingUnassign.roleId }));
                  setPendingUnassign(null);
                  dispatch(fetchAssignedUsers());
                }}
                disabled={rbacLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setPendingUnassign(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
