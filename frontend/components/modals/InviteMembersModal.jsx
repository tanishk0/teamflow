import { useState } from "react";
import Button from "../Button.jsx";
import {XIcon} from "lucide-react"

export default function InviteMembersModal({ onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [members, setMembers] = useState([]);

  function addMember() {
    if (!email.trim()) return;

    setMembers((prev) => [
      ...prev,
      {
        email: email.trim(),
        role,
      },
    ]);

    setEmail("");
    setRole("member");
  }

  function removeMember(emailToRemove) {
    setMembers((prev) =>
      prev.filter((member) => member.email !== emailToRemove),
    );
  }

  function handleSubmit() {
    onInvite(members);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Invite members</h2>

          <button onClick={onClose}> <XIcon size={18}/> </button>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded-lg px-2"
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <button onClick={addMember} className="mt-3 text-sm">
          + Add member
        </button>

        <div className="flex flex-col gap-2 mt-4">
          {members.map((member) => (
            <div
              key={member.email}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <div>
                <p>{member.email}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>

              <button onClick={() => removeMember(member.email)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button text="Cancel" onClick={onClose} />

          <Button
            text={`Invite${members.length ? ` (${members.length})` : ""}`}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
