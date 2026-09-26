import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Loader2,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDueDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TaskList({
  tasks = [],
  members = [],
  canManageTasks = false,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
  onEditTask,
  onNewTask,
  loading = false,
}) {
  const [collapsedSections, setCollapsedSections] = useState({});
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const [openStatusTaskId, setOpenStatusTaskId] = useState(null);
  const [inlineAddingSection, setInlineAddingSection] = useState(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineSubmitting, setInlineSubmitting] = useState(false);

  const menuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuTaskId(null);
        setOpenStatusTaskId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleSection(sec) {
    setCollapsedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  }

  // Derive unique sections strictly from existing tasks (no hardcoded defaults)
  const taskSections = Array.from(
    new Set(tasks.map((t) => t.section?.trim()).filter(Boolean))
  );
  const hasUnsectioned = tasks.some((t) => !t.section?.trim());
  const allSections = hasUnsectioned
    ? [...taskSections, "General"]
    : taskSections;

  async function handleToggleStatus(task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    await onUpdateTask(task._id, { status: newStatus });
  }

  async function handleSelectStatus(taskId, newStatus) {
    setOpenStatusTaskId(null);
    await onUpdateTask(taskId, { status: newStatus });
  }

  async function handleInlineSubmit(sectionName) {
    const trimmed = inlineTitle.trim();
    if (!trimmed) {
      setInlineAddingSection(null);
      setInlineTitle("");
      return;
    }
    setInlineSubmitting(true);
    try {
      await onCreateTask({
        title: trimmed,
        section: sectionName,
        status: "todo",
      });
      setInlineTitle("");
      setInlineAddingSection(null);
    } catch (err) {
      console.error(err);
    } finally {
      setInlineSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-muted text-sm gap-2">
        <Loader2 className="animate-spin text-primary" size={20} />
        <span>Loading tasks...</span>
      </div>
    );
  }

  // Empty state when there are no tasks yet
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-dashed border-border text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
          <CheckSquare size={28} />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          No tasks yet
        </h3>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          {canManageTasks
            ? "Get started by adding your first task and creating a section for your project."
            : "No tasks have been added to this project yet."}
        </p>
        {canManageTasks && (
          <button
            type="button"
            onClick={() => onNewTask("")}
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="w-full bg-white rounded-2xl border border-border shadow-xs overflow-visible"
    >
      {/* Table Header Row */}
      <div className="grid grid-cols-[1fr_170px_140px_120px_48px] px-6 py-3.5 border-b border-border bg-gray-50/50 text-xs font-semibold text-text-secondary select-none">
        <div className="pl-8">Task</div>
        <div>Assignee</div>
        <div>Status</div>
        <div>Due Date</div>
        <div className="text-right"></div>
      </div>

      {/* Sections and Tasks */}
      <div className="divide-y divide-border/60">
        {allSections.map((sec) => {
          const sectionTasks = tasks.filter(
            (t) => (t.section?.trim() || "General") === sec
          );
          const isCollapsed = Boolean(collapsedSections[sec]);

          return (
            <div key={sec} className="bg-white">
              {/* Section Header */}
              <div
                onClick={() => toggleSection(sec)}
                className="flex items-center gap-2.5 px-6 py-3.5 hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
              >
                <button
                  type="button"
                  className="text-text-muted hover:text-text-primary transition-colors p-0.5"
                >
                  {isCollapsed ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                <h3 className="text-sm font-bold text-text-primary tracking-tight">
                  {sec}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-text-secondary">
                  {sectionTasks.length}
                </span>
              </div>

              {/* Task Rows inside Section */}
              {!isCollapsed && (
                <div className="divide-y divide-border/40">
                  {sectionTasks.map((task) => {
                    const isDone = task.status === "done";
                    const assignee = task.assigneeId;
                    const assigneeName =
                      assignee?.name || assignee?.email || "Member";
                    const initial = assigneeName.charAt(0).toUpperCase();
                    const avatarColor = getAvatarColor(assigneeName);

                    return (
                      <div
                        key={task._id}
                        className="grid grid-cols-[1fr_170px_140px_120px_48px] items-center px-6 py-3 hover:bg-gray-50/60 transition-colors group relative"
                      >
                        {/* Task Title & Checkbox */}
                        <div className="flex items-center gap-3 pr-4 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(task)}
                            className="text-gray-300 hover:text-primary transition-colors cursor-pointer shrink-0"
                            title={
                              isDone ? "Mark incomplete" : "Mark complete"
                            }
                          >
                            {isDone ? (
                              <CheckCircle2
                                size={19}
                                className="text-emerald-500 fill-emerald-50"
                              />
                            ) : (
                              <Circle size={19} />
                            )}
                          </button>
                          <span
                            onClick={() => onEditTask(task)}
                            className={`text-sm font-medium truncate cursor-pointer transition-colors ${
                              isDone
                                ? "line-through text-text-muted"
                                : "text-text-primary hover:text-primary"
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {/* Assignee */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
                          >
                            {initial}
                          </div>
                          <span className="text-sm text-text-primary font-medium truncate">
                            {assigneeName}
                          </span>
                        </div>

                        {/* Status Badge with quick dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenStatusTaskId(
                                openStatusTaskId === task._id ? null : task._id
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                              task.status === "done"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {task.status === "done"
                              ? "Done"
                              : task.status === "in_progress"
                              ? "In Progress"
                              : "Todo"}
                          </button>

                          {/* Quick Status Select Popover */}
                          {openStatusTaskId === task._id && (
                            <div className="absolute top-8 left-0 z-30 w-36 bg-white rounded-xl shadow-lg border border-border py-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectStatus(task._id, "todo")
                                }
                                className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Todo</span>
                                {task.status === "todo" && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectStatus(task._id, "in_progress")
                                }
                                className="w-full text-left px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>In Progress</span>
                                {task.status === "in_progress" && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectStatus(task._id, "done")
                                }
                                className="w-full text-left px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Done</span>
                                {task.status === "done" && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Due Date */}
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              isDone
                                ? "text-emerald-600"
                                : "text-text-secondary"
                            }`}
                          >
                            {formatDueDate(task.dueDate)}
                          </span>
                        </div>

                        {/* Actions Ellipsis Menu */}
                        <div className="relative text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuTaskId(
                                openMenuTaskId === task._id ? null : task._id
                              )
                            }
                            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuTaskId === task._id && (
                            <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-border py-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuTaskId(null);
                                  onEditTask(task);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                <Edit2 size={14} className="text-text-muted" />
                                <span>Edit Task</span>
                              </button>
                              {canManageTasks && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuTaskId(null);
                                    onDeleteTask(task._id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger-light transition-colors cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Task</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Inline Quick-Add Task Input Row - only for managers and owners */}
                  {canManageTasks &&
                    (inlineAddingSection === sec ? (
                      <div className="px-6 py-2.5 bg-primary/5 flex items-center gap-3">
                        <Circle size={19} className="text-primary/40 shrink-0" />
                        <input
                          type="text"
                          value={inlineTitle}
                          onChange={(e) => setInlineTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineSubmit(sec);
                            if (e.key === "Escape") {
                              setInlineAddingSection(null);
                              setInlineTitle("");
                            }
                          }}
                          placeholder="Task name... (Press Enter to save)"
                          className="flex-1 bg-transparent text-sm text-text-primary outline-hidden placeholder:text-text-muted font-medium"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleInlineSubmit(sec)}
                            disabled={inlineSubmitting || !inlineTitle.trim()}
                            className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {inlineSubmitting ? "Adding..." : "Add"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInlineAddingSection(null);
                              setInlineTitle("");
                            }}
                            className="px-2 py-1 text-xs text-text-muted hover:text-text-primary cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* + Add Task Button Row */
                      <div className="px-6 py-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInlineAddingSection(sec);
                            setInlineTitle("");
                          }}
                          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer group"
                        >
                          <Plus
                            size={16}
                            className="transition-transform group-hover:scale-110"
                          />
                          <span>Add Task</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table Footer: Button to create a new section - only for managers and owners */}
      {canManageTasks && (
        <div className="p-4 border-t border-border bg-gray-50/30 flex items-center justify-start">
          <button
            type="button"
            onClick={() => onNewTask("")}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <Plus size={14} />
            <span>Add Section</span>
          </button>
        </div>
      )}
    </div>
  );
}
