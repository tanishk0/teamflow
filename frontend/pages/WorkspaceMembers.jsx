import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspace,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "../src/services/workspaceService.js";
import { getWorkspaceInvitations } from "../src/services/invitationService.js";
import {
  UserPlus,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  Loader2,
  Users,
  MoreVertical,
  Check,
  User,
} from "lucide-react";
import api from "../src/api/axios.js";
import InviteWorkspaceModal from "../components/modals/InviteWorkspaceModal.jsx";

export default function WorkspaceMembers() {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);

  // 3-dots menu & Role / Remove member
  const [openMenuId, setOpenMenuId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [actionError, setActionError] = useState("");

  const items = [
    { label: "Projects", path: `/workspace/${id}` },
    { label: "Activity Log", path: `/workspace/${id}/activity` },
    { label: "Members", path: `/workspace/${id}/members` },
    { label: "Settings", path: `/workspace/${id}/settings` },
  ];

  async function fetchWorkspaceData() {
    try {
      const data = await getWorkspace(id);
      setWorkspace(data);
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
    }
  }

  async function fetchMembersData() {
    try {
      const data = await getWorkspaceMembers(id);
      setMembers(data || []);
    } catch (error) {
      console.error("Failed to fetch workspace members:", error);
    }
  }

  async function fetchInvitesData() {
    try {
      const data = await getWorkspaceInvitations(id);
      const pending = (data || []).filter((inv) => inv.status === "pending");
      setPendingInvites(pending);
    } catch (error) {
      setPendingInvites([]);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        fetchWorkspaceData(),
        fetchMembersData(),
        fetchInvitesData(),
      ]);
      setLoading(false);
    }

    if (id) {
      init();
    }

    api
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data?.user))
      .catch(() => {});
  }, [id]);

  async function handleRoleChange(member, newRole) {
    if (!workspace || !member) return;
    if (member.role === newRole) {
      setOpenMenuId(null);
      return;
    }

    const targetUserId = member.userId?._id || member.userId;
    setUpdatingRoleId(member._id);
    setActionError("");

    try {
      await updateWorkspaceMemberRole(workspace._id, targetUserId, newRole);
      setMembers((prev) =>
        prev.map((m) =>
          m._id === member._id ? { ...m, role: newRole } : m
        )
      );
      setOpenMenuId(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update member role"
      );
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function confirmRemoveMember() {
    if (!memberToRemove || !workspace) return;

    setRemoving(true);
    setActionError("");

    try {
      const targetUserId =
        memberToRemove.userId?._id || memberToRemove.userId;
      await removeWorkspaceMember(workspace._id, targetUserId);

      setMembers((prev) =>
        prev.filter((m) => {
          const mUserId = m.userId?._id || m.userId;
          return mUserId !== targetUserId;
        })
      );

      setMemberToRemove(null);
      fetchWorkspaceData();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to remove member from workspace"
      );
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen w-full flex bg-gray-50">
        <Sidebar items={items} />

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="mt-8 h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
          </div>
        </main>
      </section>
    );
  }

  if (!workspace) {
    return (
      <section className="min-h-screen w-full flex bg-gray-50">
        <Sidebar items={items} />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Workspace not found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              This workspace may have been deleted or you may not have access.
            </p>
          </div>
        </main>
      </section>
    );
  }

  const isOwnerOrManager =
    workspace.isOwner ||
    workspace.role === "owner" ||
    workspace.role === "manager";

  return (
    <section className="min-h-screen w-full flex bg-gray-50">
      <Sidebar items={items} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Workspace Members
              </p>

              <h1 className="text-3xl font-semibold text-gray-900">
                {workspace.name}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isOwnerOrManager && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 text-white
                             text-sm font-medium hover:bg-blue-700
                             transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <UserPlus size={16} />
                  Invite members / Add team
                </button>
              )}
            </div>
          </div>

          {/* Action Error Alert */}
          {actionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
              <span>{actionError}</span>
              <button
                onClick={() => setActionError("")}
                className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                <p className="mt-1 text-sm text-gray-500">
                  People and team members who belong to this workspace.
                </p>
              </div>

              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {members.length} active
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No members found in this workspace.
                </div>
              ) : (
                members.map((member) => {
                  const user = member.userId || {};
                  const isWorkspaceOwner =
                    member.role === "owner" ||
                    (workspace.owner?._id &&
                      user._id &&
                      workspace.owner._id.toString() === user._id.toString()) ||
                    (workspace.owner &&
                      user._id &&
                      workspace.owner.toString() === user._id.toString());

                  const isCurrentUser =
                    currentUser?._id &&
                    user._id &&
                    currentUser._id.toString() === user._id.toString();

                  const canManage =
                    isOwnerOrManager && !isWorkspaceOwner && !isCurrentUser;

                  return (
                    <div
                      key={member._id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || "Workspace Member"}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isWorkspaceOwner ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-1">
                            <Shield size={12} />
                            Owner
                          </span>
                        ) : member.role === "manager" ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                            Manager
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            Member
                          </span>
                        )}

                        {/* 3-dots Menu for Role & Remove */}
                        {canManage && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === member._id ? null : member._id
                                )
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                              title="Member options"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenuId === member._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                    Role
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleChange(member, "manager")
                                    }
                                    disabled={updatingRoleId === member._id}
                                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                                      member.role === "manager"
                                        ? "text-purple-700 bg-purple-50 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <Shield
                                        size={14}
                                        className={
                                          member.role === "manager"
                                            ? "text-purple-600"
                                            : "text-gray-400"
                                        }
                                      />
                                      Manager
                                    </span>
                                    {updatingRoleId === member._id ? (
                                      <Loader2
                                        size={13}
                                        className="animate-spin text-purple-600"
                                      />
                                    ) : member.role === "manager" ? (
                                      <Check
                                        size={14}
                                        className="text-purple-600"
                                      />
                                    ) : null}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleChange(member, "member")
                                    }
                                    disabled={updatingRoleId === member._id}
                                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                                      member.role === "member"
                                        ? "text-blue-700 bg-blue-50 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <User
                                        size={14}
                                        className={
                                          member.role === "member"
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                        }
                                      />
                                      Member
                                    </span>
                                    {updatingRoleId === member._id ? (
                                      <Loader2
                                        size={13}
                                        className="animate-spin text-blue-600"
                                      />
                                    ) : member.role === "member" ? (
                                      <Check
                                        size={14}
                                        className="text-blue-600"
                                      />
                                    ) : null}
                                  </button>

                                  <div className="my-1 border-t border-gray-100" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMemberToRemove(member);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                    Remove member
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs mt-6">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    Pending Invitations
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Invitations waiting to be accepted by recipients.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                  {pendingInvites.length} pending
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-semibold">
                        {invite.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Role:{" "}
                          <span className="capitalize">{invite.role}</span> •
                          Invited{" "}
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                      Invited
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invite Member / Add Team Modal */}
      {showInviteModal && (
        <InviteWorkspaceModal
          workspace={workspace}
          existingMembers={members}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            fetchWorkspaceData();
            fetchMembersData();
            fetchInvitesData();
          }}
        />
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Remove Member
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                {memberToRemove.userId?.name || memberToRemove.userId?.email || "this user"}
              </span>{" "}
              from this workspace? They will lose access to all workspace projects.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={removing}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRemoveMember}
                disabled={removing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-2"
              >
                {removing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
