import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  X,
  Mail,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Plus,
  Shield,
  User,
} from "lucide-react";
import api from "../../src/api/axios.js";
import {
  createInvitation,
  getWorkspaceInvitations,
} from "../../src/services/invitationService.js";
import { addTeamsToWorkspace } from "../../src/services/workspaceTeamService.js";
import { getTeams, createTeam } from "../../src/services/teamService.js";

export default function InviteWorkspaceModal({
  workspace,
  existingMembers = [],
  onClose,
  onInvited,
}) {
  const [activeTab, setActiveTab] = useState("individuals"); // 'individuals' | 'teams'

  // Individual invite state
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [individualList, setIndividualList] = useState([]);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Teams state
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Shared state
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch teams and existing invitations
  useEffect(() => {
    async function loadData() {
      try {
        const [teamsData, invitesData] = await Promise.all([
          getTeams().catch(() => []),
          getWorkspaceInvitations(workspace._id).catch(() => []),
        ]);

        setAvailableTeams(teamsData || []);
        const pending = (invitesData || []).filter((inv) => inv.status === "pending");
        setPendingInvites(pending);
      } catch (err) {
        console.error("Failed to load initial modal data:", err);
      } finally {
        setLoadingTeams(false);
      }
    }

    if (workspace?._id) {
      loadData();
    }
  }, [workspace?._id]);

  function validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Individuals Tab Functions ---
  async function handleAddIndividual() {
    const cleaned = emailInput.trim().toLowerCase();
    if (!cleaned) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmailFormat(cleaned)) {
      setError("Please enter a valid email address");
      return;
    }

    if (individualList.some((item) => item.email === cleaned)) {
      setError("This email is already in the list to invite");
      return;
    }

    // Check if already an active member
    const alreadyMember = existingMembers.some(
      (m) => (m.userId?.email || m.email)?.toLowerCase().trim() === cleaned
    );
    if (alreadyMember) {
      setError("User is already a member of this workspace");
      return;
    }

    // Check if already invited (pending)
    const alreadyInvited = pendingInvites.some(
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
        setError("No account found with this email. The user must register first.");
        setCheckingEmail(false);
        return;
      }

      setIndividualList((prev) => [
        ...prev,
        { email: cleaned, role: selectedRole },
      ]);
      setEmailInput("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email address");
    } finally {
      setCheckingEmail(false);
    }
  }

  function handleRemoveIndividual(emailToRemove) {
    setIndividualList((prev) => prev.filter((item) => item.email !== emailToRemove));
  }

  async function handleSendIndividualInvites(e) {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const toSend = [...individualList];
    const cleanedCurrent = emailInput.trim().toLowerCase();

    if (cleanedCurrent) {
      if (!validateEmailFormat(cleanedCurrent)) {
        setError("Please enter a valid email address");
        return;
      }

      const alreadyMember = existingMembers.some(
        (m) => (m.userId?.email || m.email)?.toLowerCase().trim() === cleanedCurrent
      );
      if (alreadyMember) {
        setError("User is already a member of this workspace");
        return;
      }

      const alreadyInvited = pendingInvites.some(
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
          setError("No account found with this email. The user must register first.");
          setCheckingEmail(false);
          return;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to verify email address");
        setCheckingEmail(false);
        return;
      }
      setCheckingEmail(false);

      if (!toSend.some((item) => item.email === cleanedCurrent)) {
        toSend.push({ email: cleanedCurrent, role: selectedRole });
      }
    }

    if (toSend.length === 0) {
      setError("Please add at least one email address to invite");
      return;
    }

    setLoading(true);
    let sentCount = 0;
    const errors = [];

    for (const item of toSend) {
      try {
        await createInvitation(workspace._id, {
          email: item.email,
          role: item.role,
        });
        sentCount++;
      } catch (err) {
        const msg = err.response?.data?.message || `Failed to invite ${item.email}`;
        errors.push(`${item.email}: ${msg}`);
      }
    }

    setLoading(false);

    if (errors.length > 0) {
      setError(errors.join(", "));
    }

    if (sentCount > 0) {
      setSuccessMsg(`Successfully sent ${sentCount} invitation${sentCount > 1 ? "s" : ""}!`);
      setIndividualList([]);
      setEmailInput("");

      if (onInvited) {
        onInvited();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    }
  }

  // --- Teams Tab Functions ---
  function toggleTeamSelection(teamId) {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  }

  async function handleCreateNewTeam() {
    const trimmed = newTeamName.trim();
    if (!trimmed) {
      setError("Please enter a team name");
      return;
    }

    if (trimmed.length > 120) {
      setError("Team name cannot exceed 120 characters");
      return;
    }

    setCreatingTeam(true);
    setError("");

    try {
      const created = await createTeam(trimmed);
      setAvailableTeams((prev) => [created, ...prev]);
      setSelectedTeamIds((prev) => [...prev, created._id]);
      setNewTeamName("");
      setShowCreateTeam(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  }

  async function handleAddTeamsToWorkspace() {
    if (selectedTeamIds.length === 0) {
      setError("Please select at least one team to add");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await addTeamsToWorkspace(workspace._id, selectedTeamIds);
      setSuccessMsg(
        `Added ${selectedTeamIds.length} team${
          selectedTeamIds.length > 1 ? "s" : ""
        } and their members to this workspace!`
      );

      if (onInvited) {
        onInvited();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add teams to workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Add to {workspace?.name || "Workspace"}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Invite individuals or add entire teams to collaborate.
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

        {/* Tab Switcher */}
        <div className="flex border-b border-border mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("individuals");
              setError("");
            }}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === "individuals"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User size={16} />
            Invite Individuals
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("teams");
              setError("");
            }}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === "teams"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={16} />
            Add Teams
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
            <Check size={18} className="shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* --- TAB 1: INDIVIDUALS --- */}
        {activeTab === "individuals" && (
          <form onSubmit={handleSendIndividualInvites} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                User Email Address & Role
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
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
                        handleAddIndividual();
                      }
                    }}
                    placeholder="teammate@company.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2.5 border border-border rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                    disabled={loading}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddIndividual}
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
              </div>

              <p className="text-xs text-text-muted mt-1.5">
                Press Enter or click "Add" to queue multiple emails, or click "Send Invite" directly.
              </p>
            </div>

            {/* Queued Individual List */}
            {individualList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Ready to invite ({individualList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIndividualList([])}
                    className="text-xs text-gray-400 hover:text-danger transition cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 border border-border rounded-xl">
                  {individualList.map((item) => (
                    <span
                      key={item.email}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm text-text-primary shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                        {item.email.charAt(0).toUpperCase()}
                      </span>
                      <span>{item.email}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        {item.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIndividual(item.email)}
                        className="text-gray-400 hover:text-danger ml-0.5 p-0.5 rounded cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Pending Invitations Preview */}
            {pendingInvites.length > 0 && (
              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Clock size={13} />
                  Pending Invitations ({pendingInvites.length})
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1.5">
                  {pendingInvites.map((inv) => (
                    <div
                      key={inv._id}
                      className="flex items-center justify-between text-xs px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600"
                    >
                      <span>{inv.email}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 capitalize">{inv.role}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
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
                disabled={
                  loading || (individualList.length === 0 && !emailInput.trim())
                }
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
                    Send {individualList.length > 1 ? `${individualList.length} Invites` : "Invite"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* --- TAB 2: TEAMS --- */}
        {activeTab === "teams" && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Select Teams to Add
                </label>

                <button
                  type="button"
                  onClick={() => setShowCreateTeam((prev) => !prev)}
                  className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={14} />
                  {showCreateTeam ? "Cancel" : "Create New Team"}
                </button>
              </div>

              {/* Inline Create New Team */}
              {showCreateTeam && (
                <div className="mb-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-blue-900">
                    Create a new team and automatically add it:
                  </p>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        maxLength={120}
                        placeholder="e.g. Design Team, DevOps"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateNewTeam();
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="text-right">
                        <span
                          className={`text-[11px] ${
                            newTeamName.length > 120
                              ? "text-danger font-medium"
                              : newTeamName.length >= 100
                              ? "text-amber-600 font-medium"
                              : "text-text-muted"
                          }`}
                        >
                          {newTeamName.length}/120 characters
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateNewTeam}
                      disabled={creatingTeam || !newTeamName.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {creatingTeam ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              )}

              {/* Team Checklist */}
              {loadingTeams ? (
                <div className="py-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading your teams...
                </div>
              ) : availableTeams.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
                  <p>You haven't created any teams yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(true)}
                    className="mt-2 text-primary font-medium text-xs hover:underline cursor-pointer"
                  >
                    + Create your first team
                  </button>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 border border-border rounded-xl p-2 bg-gray-50">
                  {availableTeams.map((team) => {
                    const isSelected = selectedTeamIds.includes(team._id);
                    const memberCount =
                      Array.isArray(team.members) ? team.members.length : 0;

                    return (
                      <div
                        key={team._id}
                        onClick={() => toggleTeamSelection(team._id)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-200 text-blue-900"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div onClick
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {team.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {memberCount} {memberCount === 1 ? "member" : "members"}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-text-muted">
              Adding a team automatically grants all its members access to this workspace.
            </p>

            {/* Footer Buttons */}
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
                type="button"
                onClick={handleAddTeamsToWorkspace}
                disabled={loading || selectedTeamIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding Teams...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    Add {selectedTeamIds.length > 0 ? `${selectedTeamIds.length} Team${selectedTeamIds.length > 1 ? "s" : ""}` : "Teams"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
