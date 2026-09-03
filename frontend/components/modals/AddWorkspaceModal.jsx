import { useState } from "react";
import api from "../../src/api/axios.js";

export default function WorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [members, setMembers] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");

  async function addMember() {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      setEmailError("Enter an email");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail);

    if (!isValidEmail) {
      setEmailError("Enter a valid email");
      return;
    }

    if (members.some((member) => member.email === cleanedEmail)) {
      setEmailError("This member is already added");
      return;
    }

    try {
      const response = await api.get(
        `/users/exists?email=${encodeURIComponent(cleanedEmail)}`,
      );

      if (!response.data.exists) {
        setEmailError("No account exists with this email");
        return;
      }

      setMembers((prev) => [...prev, { email: cleanedEmail, role }]);

      setEmail("");
      setRole("member");
      setEmailError("");
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      console.log("FULL ERROR:", error);

      setEmailError(error.response?.data?.message || "Failed to verify email");
    }
  }

  function removeMember(emailToRemove) {
    setMembers((prev) =>
      prev.filter((member) => member.email !== emailToRemove),
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Workspace name cannot be empty");
      return;
    }
    setNameError("");
    onCreate(name, members);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Create New Workspace</h2>
            <p className="text-text-secondary text-sm mt-1">Collaborate with your team in a shared workspace</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Workspace Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" y2="9"></line>
                </svg>
              </div>
              <h3 className="font-medium text-text-primary">Workspace Details</h3>
            </div>

            <div className="space-y-3 pl-11">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                  Workspace name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  placeholder="e.g., Marketing Team, Product Development"
                  className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                {nameError && <p className="text-sm text-danger mt-2">{nameError}</p>}
                <p className="text-xs text-text-muted mt-2">This will be visible to all workspace members</p>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <h3 className="font-medium text-text-primary">Team Members</h3>
                {members.length > 0 && (
                  <span className="bg-primary-muted text-primary text-xs font-medium px-2 py-1 rounded-full">
                    {members.length} invited
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMembers((prev) => !prev)}
                className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
              >
                {showMembers ? 'Hide' : 'Invite Members'}
              </button>
            </div>

            {showMembers && (
              <div className="space-y-4 pl-11">
                <div className="bg-surface-muted p-4 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-secondary">Add team members to collaborate</p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          placeholder="team.member@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError("");
                          }}
                          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={addMember}
                        className="bg-primary hover:bg-primary-hover text-white rounded-xl px-6 py-3 font-medium transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                    {emailError && (
                      <p className="text-sm text-danger">{emailError}</p>
                    )}
                  </div>

                  {members.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-text-secondary">Invited Members</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {members.map((member) => (
                          <div
                            key={member.email}
                            className="flex justify-between items-center bg-white border border-border rounded-xl p-4 hover:bg-surface-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                <span className="text-primary font-medium text-sm">
                                  {member.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">{member.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${member.role === 'manager' ? 'bg-warning-light text-warning' : 'bg-success-light text-success'}`}>
                                    {member.role === 'manager' ? 'Manager' : 'Member'}
                                  </span>
                                  <span className="text-xs text-text-muted">Invited</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMember(member.email)}
                              className="text-text-muted hover:text-danger transition-colors p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {!showMembers && members.length === 0 && (
              <div className="pl-11">
                <p className="text-sm text-text-muted mb-3">Start collaborating by inviting team members</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMembers(true)}
                    className="bg-surface-muted hover:bg-border hover:text-text-primary text-text-secondary rounded-xl px-4 py-3 font-medium transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Invite Team Members
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-text-secondary hover:text-text-primary font-medium rounded-xl px-4 py-3 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-border flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary font-medium rounded-xl px-6 py-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white rounded-xl px-8 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
