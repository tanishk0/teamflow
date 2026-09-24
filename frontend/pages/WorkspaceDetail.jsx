import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspace,
  getWorkspaceMembers,
} from "../src/services/workspaceService.js";
import { getWorkspaceInvitations } from "../src/services/invitationService.js";
import {
  Settings as SettingsIcon,
  UserPlus,
  Clock,
  Building2,
  Shield,
  User,
} from "lucide-react";
import InviteWorkspaceModal from "../components/modals/InviteWorkspaceModal.jsx";

export default function WorkspaceDetail() {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const items = [
    { label: "Overview", path: `/workspace/${id}` },
    { label: "Invitations", path: "/invitations" },
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
      // Non-owner might get 403 or error, ignore silently
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
  }, [id]);

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
    workspace.isOwner || workspace.role === "owner" || workspace.role === "manager";

  return (
    <section className="min-h-screen w-full flex bg-gray-50">
      <Sidebar items={items} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Workspace</p>

              <h1 className="text-3xl font-semibold text-gray-900">
                {workspace.name}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/workspace/${id}/settings`}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700
                           text-sm font-medium hover:bg-gray-50
                           transition flex items-center gap-2 shadow-xs"
              >
                <SettingsIcon size={16} className="text-gray-500" />
                Settings
              </Link>

              {isOwnerOrManager && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white
                             text-sm font-medium hover:bg-blue-700
                             transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <UserPlus size={16} />
                  Invite members / Add team
                </button>
              )}
            </div>
          </div>

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
                      workspace.owner._id === user._id);

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

                      <div className="flex items-center gap-2">
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
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-xs text-gray-500">
                          Role: <span className="capitalize">{invite.role}</span> • Invited{" "}
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

      {/* Invite Modal */}
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
    </section>
  );
}