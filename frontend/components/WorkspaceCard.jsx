import { MoreVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";

export default function WorkspaceCard({ workspace, onRename, onDelete }) {
  return (
    <div className="w-full h-16 flex justify-between items-center px-8 bg-white rounded-md shadow-sm my-1">
      <p>{workspace.name}</p>

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
            className="w-32 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <DropdownMenu.Item
              onSelect={() => onRename(workspace)}
              className="px-4 py-2 cursor-pointer outline-none hover:bg-gray-100"
            >
              Rename
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => onDelete(workspace._id)}
              className="px-4 py-2 cursor-pointer outline-none text-red-600 hover:bg-red-50"
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
