import { MoreVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { use } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WorkspaceCard({ workspace, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workspace.name);
  const navigate = useNavigate();
  return (
    <div className="w-full h-16 text-md flex justify-between items-center px-8 bg-white rounded-md shadow-sm my-1">
      {isEditing ? (
        <input
          className="border"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await onRename(workspace._id, name);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <p
          onClick={() => navigate(`/workspace/${workspace._id}`)}
          className="text-md hover:text-primary hover:underline cursor-pointer"
        >
          {workspace.name}
        </p>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button>
            <MoreVertical size={16} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="w-32 bg-white rounded-lg shadow-lg overflow-hidden z-50 p-1"
          >
            <DropdownMenu.Item
              onSelect={() => {
                setName(workspace.name);
                setIsEditing(true);
              }}
              className="px-4 py-2 cursor-pointer outline-none hover:bg-gray-100 rounded-md"
            >
              Rename
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => onDelete(workspace._id)}
              className="px-4 py-2 cursor-pointer outline-none text-red-600 hover:bg-red-50 rounded-md"
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
