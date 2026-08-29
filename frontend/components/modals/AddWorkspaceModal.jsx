import { useState } from "react";

export default function WorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return;

    onCreate(name);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-md w-96 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name">Workspace name</label>

            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md p-2"
            />
          </div>

          <div className="flex gap-2">
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
