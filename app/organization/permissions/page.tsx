"use client";

import React, { useEffect, useState } from "react";
import {
  Shield, Search, RefreshCw, Lock, Unlock, Eye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllPermissions, PermissionItem } from "@/store/actions/authActions";

// ── Module badge colors ─────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  PAYROLL:             { bg: "bg-blue-50",    text: "text-blue-600" },
  PAY_STRUCTURE:        { bg: "bg-blue-50",    text: "text-blue-700" },
  ATTENDANCE:          { bg: "bg-green-50",   text: "text-green-600" },
  LEAVE:                { bg: "bg-purple-50",  text: "text-purple-600" },
  LEAVE_TYPE:           { bg: "bg-purple-50",  text: "text-purple-700" },
  LEAVE_POLICY:         { bg: "bg-purple-50",  text: "text-purple-800" },
  LEAVE_APPROVAL_POLICY:{ bg: "bg-violet-50",  text: "text-violet-600" },
  ROLE:                 { bg: "bg-gray-100",   text: "text-gray-600" },
  HOLIDAY:              { bg: "bg-orange-50",  text: "text-orange-600" },
  HOLIDAY_CALENDAR:     { bg: "bg-orange-50",  text: "text-orange-700" },
  WORK_WEEK:           { bg: "bg-cyan-50",    text: "text-cyan-600" },
  EMPLOYEE_PAYROLL:     { bg: "bg-pink-50",    text: "text-pink-600" },
};

type GroupedPermissions = Record<string, PermissionItem[]>;

// ── Action icon ────────────────────────────────────────────────────────────────

function ActionIcon({ action }: { action: string }) {
  const lower = action.toLowerCase();
  if (lower === "read" || lower === "read_self") return <Eye className="w-3.5 h-3.5" />;
  if (lower.includes("delete") || lower.includes("reject")) return <Lock className="w-3.5 h-3.5" />;
  return <Unlock className="w-3.5 h-3.5" />;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const dispatch = useAppDispatch();
  const { allPermissions, rbacLoading, rbacError } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    dispatch(fetchAllPermissions());
  }, [dispatch]);

  // Permissions already arrive as a flat array (groupPermissions() no longer needed)
  const flatPerms: PermissionItem[] = Array.isArray(allPermissions) ? allPermissions : [];

  // Group locally for display safety
  const grouped: GroupedPermissions = flatPerms.reduce<GroupedPermissions>((acc, p) => {
    const key = p.module || "GENERAL";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const modules = ["all", ...Object.keys(grouped).sort()];
  const visibleModules = selectedModule === "all"
    ? Object.keys(grouped).sort()
    : [selectedModule];

  const totalPermissions = flatPerms.length;
  const totalModules = Object.keys(grouped).length;

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  // Expand all by default
  useEffect(() => {
    setExpandedModules(new Set(Object.keys(grouped)));
  }, []);

  const filteredPerms = (perms: PermissionItem[]) =>
    perms.filter((p) =>
      search === "" ||
      p.module.toLowerCase().includes(search.toLowerCase()) ||
      p.action.toLowerCase().includes(search.toLowerCase()) ||
      (p.name || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalPermissions} permissions across {totalModules} modules
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAllPermissions())}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${rbacLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {rbacError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {rbacError}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]"
          />
        </div>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0445AD]/20 focus:border-[#0445AD]"
        >
          <option value="all">All Modules</option>
          {Object.keys(grouped).sort().map((mod) => (
            <option key={mod} value={mod}>{mod} ({grouped[mod].length})</option>
          ))}
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {["grid", "list"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as "grid" | "list")}
              className={`px-3 py-2 text-sm transition first-letter:capitalize ${
                viewMode === mode ? "bg-[#0445AD] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Module pills */}
      {selectedModule === "all" && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => {
            const colors = MODULE_COLORS[module] ?? { bg: "bg-gray-50", text: "text-gray-600" };
            return (
              <button
                key={module}
                onClick={() => {
                  setSelectedModule(module);
                  setExpandedModules((prev) => new Set([...prev, module]));
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border border-transparent hover:border-current ${colors.bg} ${colors.text}`}
              >
                {module}
                <span className={`${colors.bg} px-1.5 py-0.5 rounded-full text-[10px]`}>{perms.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {rbacLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-[#0445AD] animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!rbacLoading && flatPerms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Shield className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-sm font-semibold text-gray-400">No permissions found</p>
          <p className="text-xs text-gray-400 mt-1">Permissions appear here once configured on the backend</p>
        </div>
      )}

      {/* ── GRID VIEW ─────────────────────────────────────────────────── */}
      {!rbacLoading && viewMode === "grid" && visibleModules.map((module) => {
        const perms = filteredPerms(grouped[module] ?? []);
        if (perms.length === 0) return null;
        const colors = MODULE_COLORS[module] ?? { bg: "bg-gray-50", text: "text-gray-600" };
        const isExpanded = expandedModules.has(module);

        return (
          <div key={module} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleModule(module)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg}`}>
                  <Shield className={`w-4.5 h-4.5 ${colors.text}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{module}</p>
                  <p className="text-xs text-gray-400">{perms.length} permission{perms.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition ${isExpanded ? "rotate-180" : ""}`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition"
                  >
                    <ActionIcon action={perm.action} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-700 truncate">{perm.action}</p>
                      {perm.name && perm.name !== perm.action && (
                        <p className="text-[10px] text-gray-400 truncate">{perm.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
      {!rbacLoading && viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Module", "Action", "Name", "Scope", "ID"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flatPerms
                .filter((p) => selectedModule === "all" || p.module === selectedModule)
                .filter((p) =>
                  search === "" ||
                  p.module.toLowerCase().includes(search.toLowerCase()) ||
                  p.action.toLowerCase().includes(search.toLowerCase()) ||
                  (p.name || "").toLowerCase().includes(search.toLowerCase())
                )
                .map((perm) => {
                  const colors = MODULE_COLORS[perm.module] ?? { bg: "bg-gray-50", text: "text-gray-600" };
                  return (
                    <tr key={perm.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${colors.bg} ${colors.text}`}>
                          {perm.module}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <ActionIcon action={perm.action} />
                          <span className="text-sm font-medium text-gray-700">{perm.action}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-600">{perm.name || "—"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{perm.scope || "—"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-400 font-mono">{perm.id.slice(0, 8)}…</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
