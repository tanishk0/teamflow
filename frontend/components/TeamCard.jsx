import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { MoreVertical } from "lucide-react";

export default function TeamCard({ team, onClick, onRename, onDelete }) {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [name, setName] = useState(team.name);
  const [error, setError] = useState("");

  function handleRename() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Team name cannot be empty");
      return;
    }

    if (trimmedName === team.name) {
      setShowRenameModal(false);
      return;
    }

    onRename(team._id, trimmedName);
    setShowRenameModal(false);
    setError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename();
    }

    if (e.key === "Escape") {
      setName(team.name);
      setError("");
      setShowRenameModal(false);
    }
  }

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-xl p-5
                   cursor-pointer hover:border-gray-300 hover:shadow-sm
                   transition"
      >
        <div className="flex items-center justify-between">
          <div onClick={onClick} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>

            <p className="text-sm text-gray-500 mt-1">
              {team.members.length}{" "}
              {team.members.length === 1 ? "member" : "members"}
            </p>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 p-2"
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    setName(team.name);
                    setError("");
                    setShowRenameModal(true);
                  }}
                  className="px-4 py-3 cursor-pointer outline-none hover:bg-gray-100 rounded-lg"
                >
                  Rename Team
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                <DropdownMenu.Item
                  onSelect={() => onDelete(team._id)}
                  className="px-4 py-3 cursor-pointer outline-none hover:bg-red-50 text-red-600 rounded-lg"
                >
                  Delete Team
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {showRenameModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">Rename Team</h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter a new name for your team.
            </p>

            <div className="mt-5">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-primary/20
                           focus:border-primary"
                placeholder="Team name"
              />

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setName(team.name);
                  setError("");
                  setShowRenameModal(false);
                }}
                className="px-4 py-2.5 rounded-xl text-gray-600
                           hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRename}
                className="px-5 py-2.5 rounded-xl bg-primary text-white
                           hover:bg-primary-hover transition"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
