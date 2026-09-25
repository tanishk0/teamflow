import { useState } from "react";
import Button from "../Button.jsx";
import { FolderPlus, X } from "lucide-react";

export default function AddProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    setNameError("");
    setDescriptionError("");
    setGeneralError("");

    if (!trimmedName) {
      setNameError("Project name is required");
      return;
    }

    if (trimmedName.length > 120) {
      setNameError("Project name cannot exceed 120 characters");
      return;
    }

    if (trimmedDescription.length > 500) {
      setDescriptionError("Description cannot exceed 500 characters");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(trimmedName, trimmedDescription);
    } catch (err) {
      setGeneralError(
        err.response?.data?.message || err.message || "Failed to create project"
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
              <FolderPlus size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Create Project
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Add a new project to your workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-muted cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 bg-danger-light border border-danger/20 text-danger rounded-xl text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Project Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="e.g. Website Redesign"
              maxLength={120}
              autoFocus
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
                nameError
                  ? "border-danger focus:ring-danger/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              }`}
            />
            {nameError && (
              <p className="mt-1.5 text-xs text-danger font-medium">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError("");
              }}
              rows={3}
              maxLength={500}
              placeholder="Brief description of what this project is about..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all resize-none ${
                descriptionError
                  ? "border-danger focus:ring-danger/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {descriptionError ? (
                <p className="text-xs text-danger font-medium">{descriptionError}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-text-muted">
                {description.length}/500
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              text={submitting ? "Creating..." : "Create Project"}
              type="submit"
              variant="primary"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
