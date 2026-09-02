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
    };
    setNameError("");
    onCreate(name, members);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium">
              Workspace name
            </label>

            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              className="border rounded-lg p-3"
            />
          </div>

          {/* Invite members */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowMembers((prev) => !prev)}
              className="border rounded-lg p-3 text-left font-medium"
            >
              Invite members
              {members.length > 0 && ` (${members.length})`}
            </button>

            {showMembers && (
              <div className="flex flex-col gap-3 border rounded-lg p-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    className="border rounded-lg px-3 py-2 flex-1"
                  />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border rounded-lg px-2"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                  </select>

                  <button
                    type="button"
                    onClick={addMember}
                    className="border rounded-lg px-3"
                  >
                    Add
                  </button>
                </div>
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}

                {members.map((member) => (
                  <div
                    key={member.email}
                    className="flex justify-between items-center border rounded-lg p-3"
                  >
                    <div>
                      <p>{member.email}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMember(member.email)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border rounded-md px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-black text-white rounded-md px-4 py-2"
            >
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
