import { useState } from "react";
import Button from "../Button.jsx";
import { CheckSquare, X, Calendar, User, Flag, Layers } from "lucide-react";

export default function TaskModal({
  isOpen = true,
  onClose,
  onSave,
  taskToEdit = null,
  initialSection = "",
  existingSections = [],
  members = [],
  canManageTasks = false,
}) {
  const [title, setTitle] = useState(taskToEdit?.title || "");

  // Determine whether to start in "Add New Section" mode
  const initialSec = taskToEdit?.section || initialSection || "";
  const shouldStartInAddMode =
    existingSections.length === 0 ||
    Boolean(initialSec && !existingSections.includes(initialSec));

  const [isAddingNewSection, setIsAddingNewSection] =
    useState(shouldStartInAddMode);
  const [section, setSection] = useState(
    initialSec || (existingSections[0] || "")
  );
  const [newSectionName, setNewSectionName] = useState(
    shouldStartInAddMode ? initialSec : ""
  );

  const [status, setStatus] = useState(taskToEdit?.status || "todo");
  const [priority, setPriority] = useState(taskToEdit?.priority || "low");
  const [assigneeId, setAssigneeId] = useState(
    taskToEdit?.assigneeId?._id ||
      taskToEdit?.assigneeId ||
      members[0]?.userId?._id ||
      members[0]?.userId ||
      ""
  );

  const initialDateStr = taskToEdit?.dueDate
    ? new Date(taskToEdit.dueDate).toISOString().split("T")[0]
    : "";
  const [dueDate, setDueDate] = useState(initialDateStr);

  const [titleError, setTitleError] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setTitleError("");
    setSectionError("");
    setGeneralError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Task title is required");
      return;
    }

    if (trimmedTitle.length > 200) {
      setTitleError("Title cannot exceed 200 characters");
      return;
    }

    const finalSection = (
      isAddingNewSection ? newSectionName : section
    ).trim();

    if (!finalSection) {
      setSectionError("Please select or enter a section name");
      return;
    }

    if (!canManageTasks && !taskToEdit) {
      setGeneralError("Only managers and owners can create tasks");
      return;
    }

    const payload = {
      title: trimmedTitle,
      section: finalSection,
      status,
      priority,
      ...(canManageTasks ? { assigneeId: assigneeId || undefined } : {}),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    setSubmitting(true);
    try {
      await onSave(payload, taskToEdit?._id);
      onClose();
    } catch (err) {
      setGeneralError(
        err.response?.data?.message || err.message || "Failed to save task"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 animate-in fade-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-light text-primary rounded-xl">
              <CheckSquare size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {taskToEdit ? "Edit Task" : "New Task"}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {taskToEdit
                  ? "Update task details and assignments"
                  : "Create a new task for this project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="mb-5 p-3 rounded-xl bg-danger-light text-danger text-sm font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Task Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="e.g. Design homepage layout"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden
                ${
                  titleError
                    ? "border-danger bg-danger/5"
                    : "border-border hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                }`}
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-danger mt-1 font-medium">
                {titleError}
              </p>
            )}
          </div>

          {/* Section Selection / Creation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-text-muted" />
                Section <span className="text-danger">*</span>
              </label>

              {existingSections.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewSection((prev) => !prev);
                    setSectionError("");
                  }}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  {isAddingNewSection
                    ? "Choose existing section"
                    : "+ Add new section"}
                </button>
              )}
            </div>

            {isAddingNewSection || existingSections.length === 0 ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => {
                    setNewSectionName(e.target.value);
                    if (sectionError) setSectionError("");
                  }}
                  placeholder="Enter section name (e.g. Planning, Design, QA)..."
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-hidden transition-all bg-white
                    ${
                      sectionError
                        ? "border-danger bg-danger/5"
                        : "border-border hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    }`}
                  autoFocus={isAddingNewSection && existingSections.length > 0}
                />
                {existingSections.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewSection(false);
                      setSectionError("");
                      if (!section && existingSections.length > 0) {
                        setSection(existingSections[0]);
                      }
                    }}
                    className="px-3 py-2 text-xs text-text-muted hover:text-text-primary rounded-xl border border-border hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={section}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setIsAddingNewSection(true);
                      setNewSectionName("");
                    } else {
                      setSection(e.target.value);
                      if (sectionError) setSectionError("");
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-hidden transition-all bg-white cursor-pointer
                    ${
                      sectionError
                        ? "border-danger"
                        : "border-border hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    }`}
                >
                  <option value="" disabled>
                    Select a section...
                  </option>
                  {existingSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                  <option
                    value="__add_new__"
                    className="text-primary font-semibold"
                  >
                    + Add new section...
                  </option>
                </select>
              </div>
            )}
            {sectionError && (
              <p className="text-xs text-danger mt-1 font-medium">
                {sectionError}
              </p>
            )}
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-hidden hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Flag size={13} className="text-text-muted" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-hidden hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-text-muted" />
                  Assignee
                </span>
                {!canManageTasks && (
                  <span className="text-[10px] text-text-muted font-normal lowercase italic">
                    (manager/owner only)
                  </span>
                )}
              </label>
              <select
                disabled={!canManageTasks}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-hidden transition-all ${
                  !canManageTasks
                    ? "bg-gray-100 text-text-secondary cursor-not-allowed border-border opacity-75"
                    : "bg-white border-border hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                }`}
                title={
                  !canManageTasks
                    ? "Only workspace managers and owners can assign or reassign tasks"
                    : undefined
                }
              >
                {members.length === 0 ? (
                  <option value="">Current User</option>
                ) : (
                  members.map((m) => {
                    const u = m.userId || m;
                    return (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name || u.email || "Member"}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-text-muted" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-hidden hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              text={
                submitting
                  ? "Saving..."
                  : taskToEdit
                  ? "Save Changes"
                  : "Create Task"
              }
              type="submit"
              disabled={submitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
