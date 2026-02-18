"use client";

import { useEffect, useState, useCallback } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastData } from "@/components/admin/toast";
import { CustomSelect } from "@/components/admin/custom-select";
import { useAuth } from "@/lib/auth-context";
import { Shield, UserCheck, UserX, ArrowRightLeft, Trash2 } from "lucide-react";
import type { UserProfile, UserRole } from "@/types/firebase";
import { ROLE_LABELS } from "@/lib/roles";

/** Get a readable display name for a user, never returns empty/undefined */
function displayName(u: UserProfile): string {
  if (u.name && u.name.trim()) return u.name;
  if (u.email) return u.email.split("@")[0];
  return "Unknown user";
}

const ALL_ROLE_OPTIONS: UserRole[] = ["member", "editor", "admin", "super_admin"];
const ADMIN_ROLE_OPTIONS: UserRole[] = ["member", "editor"];

const allRoleSelectOptions = ALL_ROLE_OPTIONS.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

const adminRoleSelectOptions = ADMIN_ROLE_OPTIONS.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

export function UsersPage() {
  const { user, role: myRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{
    user: UserProfile;
    action: "role" | "toggle" | "transfer" | "delete";
    newRole?: UserRole;
  } | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      showToast("Could not load users.", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const canChangeRole = myRole === "super_admin" || myRole === "admin";

  const getRoleOptions = () => {
    if (myRole === "super_admin") return allRoleSelectOptions;
    if (myRole === "admin") return adminRoleSelectOptions;
    return [];
  };

  const handleRoleChange = (targetUser: UserProfile, newRole: UserRole) => {
    if (!canChangeRole) {
      showToast("Only Admins and Super Admins can change roles.", "error");
      return;
    }
    if (myRole === "admin" && (targetUser.role === "admin" || targetUser.role === "super_admin")) {
      showToast("You cannot change the role of Admins or Super Admins.", "error");
      return;
    }
    if (newRole === targetUser.role) return;
    setActionTarget({ user: targetUser, action: "role", newRole });
  };

  const handleToggleActive = (targetUser: UserProfile) => {
    setActionTarget({ user: targetUser, action: "toggle" });
  };

  const handleDeleteUser = (targetUser: UserProfile) => {
    setActionTarget({ user: targetUser, action: "delete" });
  };

  const confirmAction = async () => {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === "role" && actionTarget.newRole) {
        const res = await fetch("/api/users/update-role", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: actionTarget.user.uid,
            newRole: actionTarget.newRole,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(
          `${displayName(actionTarget.user)} is now ${ROLE_LABELS[actionTarget.newRole]}.`,
          "success"
        );
      } else if (actionTarget.action === "toggle") {
        const newActive = !actionTarget.user.active;
        const res = await fetch("/api/users/update-role", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: actionTarget.user.uid,
            active: newActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(
          `${displayName(actionTarget.user)} has been ${newActive ? "activated" : "deactivated"}.`,
          "success"
        );
      } else if (actionTarget.action === "transfer") {
        const res = await fetch("/api/users/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUid: actionTarget.user.uid }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(data.message, "success");
      } else if (actionTarget.action === "delete") {
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: actionTarget.user.uid }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(
          `${displayName(actionTarget.user)} has been permanently deleted.`,
          "success"
        );
      }
      fetchUsers();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
      );
    }
    setActionTarget(null);
  };

  const getConfirmMessage = () => {
    if (!actionTarget) return "";
    const name = displayName(actionTarget.user);
    if (actionTarget.action === "role") {
      return `Change ${name}'s role to ${ROLE_LABELS[actionTarget.newRole!]}?`;
    }
    if (actionTarget.action === "transfer") {
      return `Transfer Super Admin ownership to ${name}? You will be demoted to Admin.`;
    }
    if (actionTarget.action === "delete") {
      return `Permanently delete ${name}? This will remove them from both the database and authentication system. This action CANNOT be undone.`;
    }
    return `${actionTarget.user.active ? "Deactivate" : "Activate"} ${name}'s account?`;
  };

  const getConfirmLabel = () => {
    if (!actionTarget) return "Confirm";
    if (actionTarget.action === "role") return "Yes, Change Role";
    if (actionTarget.action === "transfer") return "Yes, Transfer";
    if (actionTarget.action === "delete") return "Yes, Delete Permanently";
    return actionTarget.user.active ? "Yes, Deactivate" : "Yes, Activate";
  };

  const isDangerAction = () => {
    if (!actionTarget) return false;
    if (actionTarget.action === "toggle") return actionTarget.user.active;
    if (actionTarget.action === "transfer") return true;
    if (actionTarget.action === "delete") return true;
    return false;
  };

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Users
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage user accounts, roles, and access.
        </p>
      </div>

      {/* Role legend */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-light" /> Role Guide
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_ROLE_OPTIONS.map((r) => (
            <div key={r} className="p-3 rounded-lg bg-white/[0.02]">
              <p className="text-sm font-medium text-foreground">
                {ROLE_LABELS[r]}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {r === "super_admin"
                  ? "Full access, manage all roles"
                  : r === "admin"
                    ? "Manage content and users"
                    : r === "editor"
                      ? "Add and edit content"
                      : "Website member, no admin access"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.uid === user?.uid;
                  return (
                    <tr
                      key={u.uid}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-teal-light">
                                {displayName(u).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <p className="text-sm font-medium text-foreground">
                            {displayName(u)}
                            {isMe && (
                              <span className="ml-1.5 text-[10px] text-teal-light">
                                (you)
                              </span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {canChangeRole && !isMe && !(myRole === "admin" && (u.role === "admin" || u.role === "super_admin")) ? (
                          <CustomSelect
                            value={u.role}
                            options={getRoleOptions()}
                            onChange={(val) =>
                              handleRoleChange(u, val as UserRole)
                            }
                            size="sm"
                            className="w-[140px]"
                          />
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                              u.role === "super_admin"
                                ? "text-gold/90 bg-gold/[0.06] border-gold/[0.1]"
                                : u.role === "admin"
                                  ? "text-teal-light/90 bg-teal/[0.06] border-teal/[0.1]"
                                  : "text-muted-foreground bg-white/[0.03] border-white/[0.06]"
                            }`}
                          >
                            {ROLE_LABELS[u.role]}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${
                            u.active ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-green-400" : "bg-red-400"}`}
                          />
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isMe &&
                            myRole === "super_admin" &&
                            u.role !== "super_admin" &&
                            u.active && (
                              <button
                                onClick={() =>
                                  setActionTarget({
                                    user: u,
                                    action: "transfer",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gold/70 hover:text-gold hover:bg-gold/[0.06] border border-white/[0.06] transition-all duration-200"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                Transfer
                              </button>
                            )}
                          {!isMe &&
                            myRole === "super_admin" && (
                              <button
                                onClick={() => handleToggleActive(u)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                                  u.active
                                    ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border-white/[0.06]"
                                    : "text-green-400/70 hover:text-green-400 hover:bg-green-500/[0.06] border-white/[0.06]"
                                }`}
                              >
                                {u.active ? (
                                  <>
                                    <UserX className="w-3 h-3" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" /> Activate
                                  </>
                                )}
                              </button>
                            )}
                          {!isMe &&
                            myRole === "super_admin" && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {users.map((u) => {
              const isMe = u.uid === user?.uid;
              return (
                <div key={u.uid} className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-light">
                          {displayName(u).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {displayName(u)}{" "}
                        {isMe && (
                          <span className="text-[10px] text-teal-light">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          u.role === "super_admin"
                            ? "text-gold/90 bg-gold/[0.06] border-gold/[0.1]"
                            : u.role === "admin"
                              ? "text-teal-light/90 bg-teal/[0.06] border-teal/[0.1]"
                              : "text-muted-foreground bg-white/[0.03] border-white/[0.06]"
                        }`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${u.active ? "text-green-400" : "text-red-400"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-green-400" : "bg-red-400"}`}
                        />
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {!isMe &&
                      myRole === "super_admin" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            {u.active ? "Deactivate" : "Activate"}
                          </button>
                          <span className="text-white/10">|</span>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="text-xs text-red-400/70 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                  {canChangeRole && !isMe && !(myRole === "admin" && (u.role === "admin" || u.role === "super_admin")) && (
                    <CustomSelect
                      value={u.role}
                      options={getRoleOptions()}
                      onChange={(val) =>
                        handleRoleChange(u, val as UserRole)
                      }
                      size="sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!actionTarget}
        title={
          actionTarget?.action === "role"
            ? "Change Role"
            : actionTarget?.action === "transfer"
              ? "Transfer Super Admin"
              : actionTarget?.action === "delete"
                ? "Delete User Permanently"
                : actionTarget?.user.active
                  ? "Deactivate User"
                  : "Activate User"
        }
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        danger={isDangerAction()}
        onConfirm={confirmAction}
        onCancel={() => setActionTarget(null)}
      />
    </div>
  );
}
