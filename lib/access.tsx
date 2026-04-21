"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";

// =============================================
// TYPES
// =============================================

export type Permission = string; // format: "MODULE:ACTION"
export type Role = string;       // e.g. "COMPANY_ADMIN", "EMPLOYEE"

export interface AccessCheckOptions {
  requireAll?: boolean; // if true, require ALL permissions; if false, require ANY
}

// =============================================
// useAccess() — THE CORE HOOK
// =============================================

/**
 * useAccess()
 * Returns the current user's RBAC access data from Redux.
 * Provides helper methods: hasPermission, hasRole, hasModule, isSuperAdmin
 *
 * Usage:
 *   const { hasPermission, hasRole, access } = useAccess();
 *   if (hasPermission("PAYROLL:READ")) { ... }
 */
export function useAccess() {
  const access = useAppSelector((state) => state.auth.access);

  /**
   * Check if user has a specific permission.
   * Supports single string: "PAYROLL:READ"
   * Supports array: ["PAYROLL:READ", "PAYROLL:WRITE"]
   */
  function hasPermission(
    permission: Permission | Permission[],
    options: AccessCheckOptions = {}
  ): boolean {
    if (!access) return false;
    const { requireAll = false } = options;
    const perms = access.permissions;

    const permList = Array.isArray(permission) ? permission : [permission];

    if (requireAll) {
      return permList.every((p) => perms.includes(p));
    }
    return permList.some((p) => perms.includes(p));
  }

  /**
   * Check if user has a specific role (or any of the given roles).
   */
  function hasRole(role: Role | Role[]): boolean {
    if (!access) return false;
    const roleList = Array.isArray(role) ? role : [role];
    return roleList.some((r) => access.roles.includes(r));
  }

  /**
   * Check if user has any action on a given module.
   * e.g. hasModule("PAYROLL") → true if any PAYROLL:* permission exists
   */
  function hasModule(module: string): boolean {
    if (!access) return false;
    const prefix = `${module.toUpperCase()}:`;
    return access.permissions.some((p) => p.startsWith(prefix));
  }

  /**
   * Check if user is a super admin (all permissions).
   */
  function isSuperAdmin(): boolean {
    if (!access) return false;
    return hasRole("SUPER_ADMIN") || access.permissions.includes("*");
  }

  /**
   * Get actions available for a module.
   * e.g. getModuleActions("PAYROLL") → ["READ", "WRITE", "DELETE"]
   */
  function getModuleActions(module: string): string[] {
    if (!access) return [];
    const prefix = `${module.toUpperCase()}:`;
    return access.permissions
      .filter((p) => p.startsWith(prefix))
      .map((p) => p.replace(prefix, ""));
  }

  return {
    access,
    hasPermission,
    hasRole,
    hasModule,
    isSuperAdmin,
    getModuleActions,
    roles: access?.roles ?? [],
    permissions: access?.permissions ?? [],
    groupedPermissions: access?.groupedPermissions ?? {},
  };
}

// =============================================
// PermissionGate — WRAPPER COMPONENT
// =============================================

interface PermissionGateProps {
  /** Required permission(s). Renders children if user has them. */
  permission?: Permission | Permission[];
  /** Required role(s). Renders children if user has any of them. */
  role?: Role | Role[];
  /** How to evaluate multiple permissions. Default: ANY (require at least one) */
  requireAll?: boolean;
  /** Fallback shown when user lacks permission. Default: null (hide) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGate
 * Wraps children — renders them only if the current user passes the check.
 * Optionally renders `fallback` when access is denied.
 *
 * Usage:
 *   <PermissionGate permission="PAYROLL:READ">
 *     <PayrollButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permission={["PAYROLL:READ", "PAYROLL:WRITE"]} requireAll>
 *     <AdminPanel />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasRole } = useAccess();

  let allowed = true;

  if (permission) {
    allowed = hasPermission(permission, { requireAll });
  }
  if (allowed && role) {
    allowed = hasRole(role);
  }

  return <>{allowed ? children : fallback}</>;
}

// =============================================
// withPermission — HOC
// =============================================

type WithPermissionOptions = {
  permission?: Permission | Permission[];
  role?: Role | Role[];
  requireAll?: boolean;
  fallbackComponent?: React.ComponentType<any>;
};

/**
 * withPermission HOC
 * Wraps a component — returns null or fallbackComponent if user lacks access.
 *
 * Usage:
 *   const ProtectedPayrollButton = withPermission({
 *     permission: "PAYROLL:READ",
 *     fallbackComponent: null,
 *   })(PayrollButton);
 *
 *   <ProtectedPayrollButton />
 */
export function withPermission<P extends object>(
  options: WithPermissionOptions
) {
  return function Wrapper<P extends object>(Component: React.ComponentType<P>) {
    return function WithPermissionComponent(props: P) {
      const { permission, role, requireAll } = options;
      const { hasPermission, hasRole } = useAccess();

      let allowed = true;
      if (permission) allowed = hasPermission(permission, { requireAll });
      if (allowed && role) allowed = hasRole(role);

      if (!allowed) {
        const Fallback = options.fallbackComponent;
        return Fallback ? <Fallback {...props} /> : null;
      }
      return <Component {...props} />;
    };
  };
}

// =============================================
// RoleGate — role-only variant
// =============================================

interface RoleGateProps {
  role: Role | Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGate
 * Shorthand for role-only gating.
 *
 * Usage:
 *   <RoleGate role="COMPANY_ADMIN">
 *     <AdminSettings />
 *   </RoleGate>
 */
export function RoleGate({ role, fallback = null, children }: RoleGateProps) {
  const { hasRole } = useAccess();
  return <>{hasRole(role) ? children : fallback}</>;
}

// =============================================
// ModuleGate — module-level gating
// =============================================

interface ModuleGateProps {
  module: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * ModuleGate
 * Renders children only if user has at least one permission on the module.
 *
 * Usage:
 *   <ModuleGate module="PAYROLL">
 *     <PayrollTab />
 *   </ModuleGate>
 */
export function ModuleGate({ module, fallback = null, children }: ModuleGateProps) {
  const { hasModule } = useAccess();
  return <>{hasModule(module) ? children : fallback}</>;
}
