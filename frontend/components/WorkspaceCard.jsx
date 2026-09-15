import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";

export default function WorkspaceCard({ workspace, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workspace.name);

  const navigate = useNavigate();

  async function handleRename() {
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName === workspace.name) {
      setName(workspace.name);
      setIsEditing(false);
      return;
    }

    try {
      await onRename(workspace._id, trimmedName);
      setName(trimmedName);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleRename();
    }

    if (e.key === "Escape") {
      setName(workspace.name);
      setIsEditing(false);
    }
  }

  return (
    <div className="w-full bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="w-full border border-border rounded-lg px-3 py-2
                         bg-surface text-text-primary
                         focus:outline-none focus:ring-2
                         focus:ring-primary/20 focus:border-primary"
              placeholder="Workspace name"
            />
          ) : (
            <button
              onClick={() => navigate(`/workspace/${workspace._id}`)}
              className="text-left w-full"
            >
              <h3 className="text-lg font-semibold text-text-primary hover:text-primary transition-colors">
                {workspace.name}
              </h3>

              <p className="text-sm text-text-muted mt-1">Workspace</p>
            </button>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-2 rounded-lg hover:bg-surface-muted
                         text-text-muted hover:text-text-primary
                         transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="w-48 bg-white rounded-xl shadow-xl
                         border border-border p-2 z-50"
            >
              <DropdownMenu.Item
                onSelect={() => {
                  setName(workspace.name);
                  setIsEditing(true);
                }}
                className="px-4 py-3 cursor-pointer outline-none
                           hover:bg-surface-muted rounded-lg
                           text-text-primary"
              >
                Rename Workspace
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-border my-1" />

              <DropdownMenu.Item
                onSelect={() => onDelete(workspace._id)}
                className="px-4 py-3 cursor-pointer outline-none
                           hover:bg-danger-light rounded-lg text-danger"
              >
                Delete Workspace
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
