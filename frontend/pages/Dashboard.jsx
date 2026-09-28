import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspaces,
  createWorkspace,
} from "../src/services/workspaceService.js";
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../src/services/invitationService.js";
import {
  getMyTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
} from "../src/services/teamInvitationService.js";
import { getMyTasks, updateTask } from "../src/services/taskService.js";
import { getUserActivityFeed } from "../src/services/activityService.js";
import api from "../src/api/axios.js";
import { addTeamsToWorkspace } from "../src/services/workspaceTeamService.js";
import { createInvitation } from "../src/services/invitationService.js";
import WorkspaceModal from "../components/modals/AddWorkspaceModal.jsx";
import {
  Plus,
  ArrowRight,
  ChevronRight,
  Circle,
  CheckCircle2,
  CheckSquare,
  Users,
  FileText,
  Mail,
  Loader2,
} from "lucide-react";

const WORKSPACE_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
  "bg-indigo-50 text-indigo-600",
];

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDueDate(dateInput) {
  if (!dateInput) return { text: "-", isUrgent: false };
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return { text: "-", isUrgent: false };
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return { text: "Today", isUrgent: true };

  const isPast = date < now;
  return {
    text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isUrgent: isPast,
  };
}

function getActivityDisplay(activity, currentUserId) {
  const isYou = activity.actorId?._id?.toString() === currentUserId?.toString();
  const actorName = isYou ? "You" : activity.actorId?.name || "A member";

  let actionTitle = `${actorName} performed an action`;
  let details = activity.description || "";
  let iconType = "file";
  let iconColor = "bg-blue-50 text-blue-600";

  switch (activity.action) {
    case "task_created":
      actionTitle = `${actorName} created a task`;
      details = `${activity.entityName || "Task"}${
        activity.details?.projectName ? ` • ${activity.details.projectName}` : ""
      }`;
      iconType = "plus";
      iconColor = "bg-emerald-50 text-emerald-600";
      break;
    case "task_status_changed":
      actionTitle = `${actorName} updated a task`;
      const statusLabel =
        activity.details?.newStatus === "done"
          ? "Done"
          : activity.details?.newStatus === "in_progress"
          ? "In Progress"
          : "Todo";
      details = `Changed status to ${statusLabel}${
        activity.details?.projectName ? ` • ${activity.details.projectName}` : ""
      }`;
      iconType = "file";
      iconColor = "bg-blue-50 text-blue-600";
      break;
    case "task_assigned":
      actionTitle = `${actorName} assigned a task`;
      details = `${activity.entityName || "Task"}${
        activity.details?.projectName ? ` • ${activity.details.projectName}` : ""
      }`;
      iconType = "file";
      iconColor = "bg-blue-50 text-blue-600";
      break;
    case "task_updated":
      actionTitle = `${actorName} updated a task`;
      details = `${activity.entityName || "Task"}${
        activity.details?.projectName ? ` • ${activity.details.projectName}` : ""
      }`;
      iconType = "file";
      iconColor = "bg-blue-50 text-blue-600";
      break;
    case "project_created":
      actionTitle = `${actorName} created a project`;
      details = `${activity.entityName || "Project"}`;
      iconType = "plus";
      iconColor = "bg-emerald-50 text-emerald-600";
      break;
    case "member_joined":
      actionTitle = `${actorName} joined the workspace`;
      details = activity.workspaceId?.name || "Workspace";
      iconType = "users";
      iconColor = "bg-purple-50 text-purple-600";
      break;
    case "member_invited":
      actionTitle = `${actorName} invited a member`;
      details = `${activity.entityName || "Member"} • ${
        activity.workspaceId?.name || "Workspace"
      }`;
      iconType = "users";
      iconColor = "bg-purple-50 text-purple-600";
      break;
    case "team_added":
      actionTitle = `${actorName} added a team`;
      details = activity.workspaceId?.name || "Workspace";
      iconType = "users";
      iconColor = "bg-indigo-50 text-indigo-600";
      break;
    case "workspace_created":
      actionTitle = `${actorName} created a workspace`;
      details = activity.entityName || "Workspace";
      iconType = "plus";
      iconColor = "bg-emerald-50 text-emerald-600";
      break;
    case "workspace_renamed":
      actionTitle = `${actorName} renamed workspace`;
      details = activity.entityName || "Workspace";
      iconType = "file";
      iconColor = "bg-amber-50 text-amber-700";
      break;
    default:
      actionTitle = `${actorName} updated an item`;
      details = activity.description || "";
      iconType = "file";
      iconColor = "bg-blue-50 text-blue-600";
      break;
  }

  return { actionTitle, details, iconType, iconColor, isYou };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];

  async function fetchDashboardData() {
    try {
      const [
        meRes,
        workspacesRes,
        tasksRes,
        wsInvites,
        teamInvites,
        activitiesRes,
      ] = await Promise.allSettled([
        api.get("/auth/me"),
        getWorkspaces(),
        getMyTasks(),
        getMyInvitations(),
        getMyTeamInvites(),
        getUserActivityFeed(),
      ]);

      if (meRes.status === "fulfilled") {
        setUser(meRes.value.data.user);
      }
      if (workspacesRes.status === "fulfilled") {
        setWorkspaces(workspacesRes.value || []);
      }
      if (tasksRes.status === "fulfilled") {
        setMyTasks(tasksRes.value || []);
      }
      const combinedInvites = [];
      if (wsInvites.status === "fulfilled" && Array.isArray(wsInvites.value)) {
        combinedInvites.push(
          ...wsInvites.value.map((inv) => ({ ...inv, type: "workspace" }))
        );
      }
      if (teamInvites.status === "fulfilled" && Array.isArray(teamInvites.value)) {
        combinedInvites.push(
          ...teamInvites.value.map((inv) => ({ ...inv, type: "team" }))
        );
      }
      setInvitations(combinedInvites);

      if (activitiesRes.status === "fulfilled") {
        setActivities(activitiesRes.value || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleToggleTask(task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await updateTask(task._id, { status: newStatus });
      setMyTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to toggle task status:", err);
    }
  }

  async function handleAcceptInvite(invite) {
    try {
      if (invite.type === "team") {
        await acceptTeamInvite(invite._id);
      } else {
        await acceptInvitation(invite._id);
      }
      setInvitations((prev) => prev.filter((item) => item._id !== invite._id));
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  }

  async function handleDeclineInvite(invite) {
    try {
      if (invite.type === "team") {
        await rejectTeamInvite(invite._id);
      } else {
        await rejectInvitation(invite._id);
      }
      setInvitations((prev) => prev.filter((item) => item._id !== invite._id));
    } catch (err) {
      console.error("Failed to decline invite:", err);
    }
  }

  async function handleCreateWorkspace(name, members, teamIds) {
    try {
      const workspace = await createWorkspace(name);

      if (teamIds?.length > 0) {
        await addTeamsToWorkspace(workspace._id, teamIds);
      }

      for (const member of members) {
        try {
          await createInvitation(workspace._id, member);
        } catch (inviteError) {
          console.warn("Failed to invite member:", member, inviteError);
        }
      }

      setWorkspaces((prev) => [workspace, ...prev]);
      setShowModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const firstWorkspaceId = workspaces[0]?._id;

  return (
    <div className="flex min-h-screen bg-gray-50/60 font-sans">
      <Sidebar items={items} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                Dashboard
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Welcome back, {user?.name || "there"}. Here's what's happening
                across your work.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all duration-150 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add workspace</span>
            </button>
          </div>

          {loading ? (
            <div className="py-32 flex items-center justify-center text-text-muted text-sm gap-2">
              <Loader2 className="animate-spin text-primary" size={20} />
              <span>Loading dashboard...</span>
            </div>
          ) : (
            /* 2x2 Grid of Dashboard Cards */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Card 1: My work */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between pb-4 border-b border-border/70">
                  <div>
                    <h2 className="text-base font-bold text-text-primary tracking-tight">
                      My work
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Tasks assigned to you across all workspaces
                    </p>
                  </div>
                  <Link
                    to={firstWorkspaceId ? `/workspace/${firstWorkspaceId}` : "/workspaces"}
                    className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>

                <div className="divide-y divide-border/60 flex-1">
                  {myTasks.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-text-muted">
                      <CheckSquare size={32} className="text-primary/30 mb-2" />
                      <p className="text-sm font-medium text-text-secondary">
                        No tasks assigned to you right now
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Tasks assigned to you across projects will appear here
                      </p>
                    </div>
                  ) : (
                    myTasks.slice(0, 5).map((task) => {
                      const isDone = task.status === "done";
                      const { text: dueText, isUrgent } = formatDueDate(
                        task.dueDate
                      );

                      const priority = (task.priority || "low").toLowerCase();
                      const priorityColor =
                        priority === "high"
                          ? "bg-rose-100/70 text-rose-700"
                          : priority === "medium"
                          ? "bg-amber-100/70 text-amber-800"
                          : "bg-blue-100/70 text-blue-700";

                      const projectName = task.projectId?.name || "Project";
                      const workspaceName =
                        task.projectId?.workspaceId?.name || "Workspace";

                      return (
                        <div
                          key={task._id}
                          className="py-3 flex items-center justify-between gap-3 group"
                        >
                          {/* Task Checkbox & Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className="cursor-pointer shrink-0 transition-transform active:scale-95"
                              title={
                                isDone ? "Mark incomplete" : "Mark complete"
                              }
                            >
                              {isDone ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-500 fill-emerald-50"
                                />
                              ) : (
                                <Circle
                                  size={18}
                                  className="text-gray-300 hover:text-primary transition-colors"
                                />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <span
                                onClick={() => {
                                  const targetId =
                                    task.projectId?._id || task.projectId;
                                  if (targetId) navigate(`/${targetId}`);
                                }}
                                className={`text-sm font-medium block truncate cursor-pointer transition-colors ${
                                  isDone
                                    ? "line-through text-text-muted"
                                    : "text-text-primary hover:text-primary"
                                }`}
                              >
                                {task.title}
                              </span>
                              <p className="text-xs text-text-muted truncate mt-0.5">
                                {projectName} &middot; {workspaceName}
                              </p>
                            </div>
                          </div>

                          {/* Priority & Due Date */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${priorityColor}`}
                            >
                              {task.priority || "Low"}
                            </span>

                            <span
                              className={`text-xs w-14 text-right ${
                                isUrgent
                                  ? "text-rose-600 font-semibold"
                                  : "text-text-secondary font-medium"
                              }`}
                            >
                              {dueText}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card 2: Invitations */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between pb-4 border-b border-border/70">
                  <div>
                    <h2 className="text-base font-bold text-text-primary tracking-tight">
                      Invitations
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Pending invitations to join workspaces or teams
                    </p>
                  </div>
                  <Link
                    to="/invitations"
                    className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>

                <div className="divide-y divide-border/60 flex-1">
                  {invitations.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-text-muted">
                      <Mail size={32} className="text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-text-secondary">
                        No pending invitations
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        When someone invites you to a workspace or team, it will
                        appear here
                      </p>
                    </div>
                  ) : (
                    invitations.slice(0, 4).map((invite) => {
                      const name =
                        invite.workspaceId?.name ||
                        invite.teamId?.name ||
                        "Workspace";
                      const inviter =
                        invite.inviterId?.name ||
                        invite.inviterId?.email ||
                        "A teammate";
                      const initial = name.charAt(0).toUpperCase() || "I";

                      return (
                        <div
                          key={invite._id}
                          className="py-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-text-primary truncate">
                                {name}
                              </h4>
                              <p className="text-xs text-text-muted truncate mt-0.5">
                                Invited by {inviter}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAcceptInvite(invite)}
                              className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeclineInvite(invite)}
                              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-text-secondary text-xs font-semibold rounded-xl transition cursor-pointer active:scale-95"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card 3: Recent workspaces */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between pb-4 border-b border-border/70">
                  <div>
                    <h2 className="text-base font-bold text-text-primary tracking-tight">
                      Recent workspaces
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Your workspaces and latest activity
                    </p>
                  </div>
                  <Link
                    to="/workspaces"
                    className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>

                <div className="divide-y divide-border/60 flex-1">
                  {workspaces.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-text-muted">
                      <p className="text-sm font-medium text-text-secondary">
                        No workspaces yet
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        + Create your first workspace
                      </button>
                    </div>
                  ) : (
                    workspaces.slice(0, 4).map((workspace, idx) => {
                      const initial =
                        workspace.name?.charAt(0).toUpperCase() || "W";
                      const colorClass =
                        WORKSPACE_COLORS[idx % WORKSPACE_COLORS.length];
                      const projectsCount = workspace.projectsCount ?? 0;

                      return (
                        <div
                          key={workspace._id}
                          onClick={() =>
                            navigate(`/workspace/${workspace._id}`)
                          }
                          className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-gray-50/60 rounded-xl px-2 -mx-2 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                {workspace.name}
                              </h4>
                              <p className="text-xs text-text-muted truncate mt-0.5">
                                {projectsCount}{" "}
                                {projectsCount === 1 ? "project" : "projects"} &middot;{" "}
                                Updated{" "}
                                {formatRelativeTime(
                                  workspace.updatedAt || workspace.createdAt
                                )}
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            size={16}
                            className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card 4: Recent activity */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between pb-4 border-b border-border/70">
                  <div>
                    <h2 className="text-base font-bold text-text-primary tracking-tight">
                      Recent activity
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Latest updates across your workspaces
                    </p>
                  </div>
                  <Link
                    to={
                      firstWorkspaceId
                        ? `/workspace/${firstWorkspaceId}/activity`
                        : "/workspaces"
                    }
                    className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>

                <div className="divide-y divide-border/60 flex-1">
                  {activities.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-text-muted">
                      <p className="text-sm font-medium text-text-secondary">
                        No recent activity yet
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Activities across your workspaces and projects will show
                        up here
                      </p>
                    </div>
                  ) : (
                    activities.slice(0, 5).map((act) => {
                      const {
                        actionTitle,
                        details,
                        iconType,
                        iconColor,
                      } = getActivityDisplay(act, user?._id);

                      const actorName = act.actorId?.name || act.actorId?.email || "U";
                      const actorInitial = actorName.charAt(0).toUpperCase();

                      return (
                        <div
                          key={act._id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Action Icon Badge */}
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${iconColor}`}
                            >
                              {iconType === "plus" ? (
                                <Plus size={14} />
                              ) : iconType === "users" ? (
                                <Users size={14} />
                              ) : (
                                <FileText size={14} />
                              )}
                            </div>

                            {/* Mini Actor Avatar */}
                            <div className="w-6 h-6 rounded-full bg-gray-200/80 text-gray-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {actorInitial}
                            </div>

                            {/* Text Info */}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-medium text-text-primary truncate">
                                {actionTitle}
                              </h4>
                              <p className="text-[11px] text-text-muted truncate mt-0.5">
                                {details}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <span className="text-[11px] text-text-muted shrink-0 font-medium ml-2">
                            {formatRelativeTime(act.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for creating a workspace */}
      {showModal && (
        <WorkspaceModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateWorkspace}
        />
      )}
    </div>
  );
}
