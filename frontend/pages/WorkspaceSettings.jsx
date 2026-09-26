import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspace,
  renameWorkspace,
  deleteWorkspace,
} from "../src/services/workspaceService.js";
import {
  ArrowLeft,
  Building2,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function WorkspaceSettings() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isOwner = Boolean(workspace?.isOwner || workspace?.role === "owner");

  const sidebarItems = [
    { label: "Projects", path: `/workspace/${id}` },
    { label: "Activity Log", path: `/workspace/${id}/activity` },
    { label: "Members", path: `/workspace/${id}/members` },
    ...(isOwner ? [{ label: "Settings", path: `/workspace/${id}/settings` }] : []),
  ];

  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        const data = await getWorkspace(id);
        setWorkspace(data);
        setName(data.name || "");
      } catch (err) {
        console.error("Failed to load workspace:", err);
        setError("Failed to load workspace details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchWorkspaceData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && workspace && !isOwner) {
      navigate(`/workspace/${id}`, { replace: true });
    }
  }, [loading, workspace, isOwner, id, navigate]);

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Workspace name cannot be empty");
      return;
    }

    if (trimmed.length > 120) {
      setError("Workspace name cannot exceed 120 characters");
      return;
    }

    if (trimmed === workspace?.name) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      await renameWorkspace(id, trimmed);
      setWorkspace((prev) => ({ ...prev, name: trimmed }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update workspace name");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (confirmName.trim() !== workspace?.name) {
      setDeleteError("Confirmation name does not match");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");
      await deleteWorkspace(id);
      navigate("/workspaces");
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete workspace");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen w-full flex bg-background">
        <Sidebar items={sidebarItems} workspaceId={id} />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-white border border-border rounded-2xl animate-pulse" />
            <div className="h-48 bg-white border border-border rounded-2xl animate-pulse" />
          </div>
        </main>
      </section>
    );
  }

  if (!workspace) {
    return (
      <section className="min-h-screen w-full flex bg-background">
        <Sidebar items={sidebarItems} workspaceId={id} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <Building2 className="mx-auto text-text-muted mb-3" size={48} />
            <h1 className="text-2xl font-semibold text-text-primary">
              Workspace not found
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              This workspace may have been deleted or you may not have permission to view it.
            </p>
            <button
              onClick={() => navigate("/workspaces")}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition"
            >
              Back to Workspaces
            </button>
          </div>
        </main>
      </section>
    );
  }

  if (!isOwner) {
    return null;
  }

  const isNameChanged = name.trim() !== workspace.name && name.trim().length > 0;

  return (
    <section className="min-h-screen w-full flex bg-background">
      <Sidebar items={sidebarItems} workspaceId={id} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Top navigation / breadcrumbs */}
          <div>
            <Link
              to={`/workspace/${id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Workspace
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-base">
                {workspace.name ? workspace.name.charAt(0).toUpperCase() : "W"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Workspace Settings
                </h1>
                <p className="text-sm text-text-secondary">
                  Manage configuration and preferences for {workspace.name}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: General (Rename) */}
          <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                General
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Update your workspace identity.
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="workspace-name"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Workspace Name
                  </label>
                  <span
                    className={`text-xs ${
                      name.length > 120
                        ? "text-danger font-medium"
                        : name.length >= 100
                        ? "text-amber-600 font-medium"
                        : "text-text-muted"
                    }`}
                  >
                    {name.length}/120 characters
                  </span>
                </div>
                <input
                  id="workspace-name"
                  type="text"
                  maxLength={120}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter workspace name"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary
                             placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20
                             focus:border-primary transition"
                />
                {error && (
                  <p className="text-sm text-danger mt-2">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <CheckCircle2 size={16} />
                      Changes saved successfully
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isNameChanged || saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium
                             hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                             transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Danger Zone (Delete) */}
          <div className="bg-surface border border-red-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50/40">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-semibold">Danger Zone</h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Irreversible and destructive actions for this workspace.
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Delete this workspace
                </h3>
                <p className="text-sm text-text-secondary mt-1 max-w-lg">
                  Once deleted, all data, teams, and member access associated with{" "}
                  <span className="font-semibold text-text-primary">
                    {workspace.name}
                  </span>{" "}
                  will be permanently removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmName("");
                  setDeleteError("");
                  setShowDeleteModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-danger text-white text-sm font-medium
                           hover:bg-red-700 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Trash2 size={16} />
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-danger-light text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Delete Workspace
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Are you absolutely sure you want to delete{" "}
                  <span className="font-semibold text-text-primary">
                    "{workspace.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-workspace-name"
                className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2"
              >
                Type <span className="text-text-primary lowercase">{workspace.name}</span> to confirm
              </label>
              <input
                id="confirm-workspace-name"
                autoFocus
                type="text"
                value={confirmName}
                onChange={(e) => {
                  setConfirmName(e.target.value);
                  if (deleteError) setDeleteError("");
                }}
                placeholder={workspace.name}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary
                           placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-danger/20
                           focus:border-danger transition"
              />
              {deleteError && (
                <p className="text-sm text-danger mt-2">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-border text-text-primary
                           hover:bg-surface-muted text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmName.trim() !== workspace.name || deleting}
                className="px-5 py-2.5 rounded-xl bg-danger text-white text-sm font-medium
                           hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
