import { useState, useEffect } from "react";
import { UserPlus, X, Mail, Check, Loader2, AlertCircle, Clock } from "lucide-react";
import api from "../../src/api/axios.js";
import { createTeamInvite, getTeamInvites } from "../../src/services/teamInvitationService.js";

export default function InviteTeamMemberModal({ team, onClose, onInvited }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingInvites, setExistingInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  // Fetch existing pending invites for this team
  useEffect(() => {
    async function fetchInvites() {
      try {
        const invites = await getTeamInvites(team._id);
        const pending = (invites || []).filter((inv) => inv.status === "pending");
        setExistingInvites(pending);
      } catch (err) {
        // Non-owner or network error, fail silently
      } finally {
        setLoadingInvites(false);
      }
    }

    if (team?._id) {
      fetchInvites();
    }
  }, [team?._id]);

  function validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleAddEmail() {
    const cleaned = emailInput.trim().toLowerCase();
    if (!cleaned) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmailFormat(cleaned)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emails.includes(cleaned)) {
      setError("This email is already in the list to invite");
      return;
    }

    // Check if already a member
    const alreadyMember = team?.members?.some(
      (m) => m.email?.toLowerCase().trim() === cleaned
    );
    if (alreadyMember) {
      setError("User is already a member of this team");
      return;
    }

    // Check if already invited (pending)
    const alreadyInvited = existingInvites.some(
      (inv) => inv.email?.toLowerCase().trim() === cleaned
    );
    if (alreadyInvited) {
      setError("An invitation is already pending for this user");
      return;
    }

    setCheckingEmail(true);
    setError("");

    try {
      const res = await api.get(`/users/exists?email=${encodeURIComponent(cleaned)}`);
      if (!res.data?.exists) {
        setError("No account found with this email. User must be registered.");
        setCheckingEmail(false);
        return;
      }

      setEmails((prev) => [...prev, cleaned]);
      setEmailInput("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email address");
    } finally {
      setCheckingEmail(false);
    }
  }

  function handleRemoveEmail(emailToRemove) {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  }

  async function handleSendInvites(e) {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const toSend = [...emails];
    const cleanedCurrent = emailInput.trim().toLowerCase();

    // If an email is currently typed, validate and include it
    if (cleanedCurrent) {
      if (!validateEmailFormat(cleanedCurrent)) {
        setError("Please enter a valid email address");
        return;
      }

      const alreadyMember = team?.members?.some(
        (m) => m.email?.toLowerCase().trim() === cleanedCurrent
      );
      if (alreadyMember) {
        setError("User is already a member of this team");
        return;
      }

      const alreadyInvited = existingInvites.some(
        (inv) => inv.email?.toLowerCase().trim() === cleanedCurrent
      );
      if (alreadyInvited) {
        setError("An invitation is already pending for this user");
        return;
      }

      setCheckingEmail(true);
      try {
        const res = await api.get(`/users/exists?email=${encodeURIComponent(cleanedCurrent)}`);
        if (!res.data?.exists) {
          setError("No account found with this email. User must be registered.");
          setCheckingEmail(false);
          return;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to verify email address");
        setCheckingEmail(false);
        return;
      }
      setCheckingEmail(false);

      if (!toSend.includes(cleanedCurrent)) {
        toSend.push(cleanedCurrent);
      }
    }

    if (toSend.length === 0) {
      setError("Please add at least one email address to invite");
      return;
    }

    setLoading(true);
    let sentCount = 0;
    const errors = [];

    for (const email of toSend) {
      try {
        await createTeamInvite(team._id, email);
        sentCount++;
      } catch (err) {
        const msg = err.response?.data?.message || `Failed to invite ${email}`;
        errors.push(`${email}: ${msg}`);
      }
    }

    setLoading(false);

    if (errors.length > 0) {
      setError(errors.join(", "));
    }

    if (sentCount > 0) {
      setSuccessMsg(`Successfully sent ${sentCount} invitation${sentCount > 1 ? "s" : ""}!`);
      setEmails([]);
      setEmailInput("");

      if (onInvited) {
        onInvited();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Invite to {team?.name || "Team"}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Send invitations to add members to this team.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
            <Check size={18} className="shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendInvites} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              User Email Address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  placeholder="colleague@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                onClick={handleAddEmail}
                disabled={checkingEmail || loading || !emailInput.trim()}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {checkingEmail ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Press Enter or click "Add" to queue multiple emails, or click "Send Invite" directly.
            </p>
          </div>

          {/* Queued Emails */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Ready to invite ({emails.length})
                </span>
                <button
                  type="button"
                  onClick={() => setEmails([])}
                  className="text-xs text-gray-400 hover:text-danger transition cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 border border-border rounded-xl">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm text-text-primary shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                      {email.charAt(0).toUpperCase()}
                    </span>
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-gray-400 hover:text-danger ml-0.5 p-0.5 rounded cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pending outgoing invitations preview */}
          {existingInvites.length > 0 && (
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Clock size={13} />
                Already invited ({existingInvites.length})
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5">
                {existingInvites.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between text-xs px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600"
                  >
                    <span>{inv.email}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || (emails.length === 0 && !emailInput.trim())}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Send {emails.length > 1 ? `${emails.length} Invitations` : "Invitation"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
