import { DropdownMenu } from "radix-ui";
import { MoreVertical } from "lucide-react";

export default function TeamCard({ team, onClick, onRename, onDelete }) {
  return (
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
                onSelect={() => onRename(team._id, team.name)}
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
  );
}
