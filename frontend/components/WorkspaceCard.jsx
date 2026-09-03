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
    <div className="w-full bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 group">
      <div className="flex justify-between items-start">
        {isEditing ? (
          <div className="flex-1">
            <input
              className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await onRename(workspace._id, name);
                  setIsEditing(false);
                }
              }}
              placeholder="Enter workspace name"
            />
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center group-hover:bg-primary-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" y2="9"></line>
                </svg>
              </div>
              <div>
                <h3
                  onClick={() => navigate(`/workspace/${workspace._id}`)}
                  className="text-xl font-semibold text-text-primary hover:text-primary cursor-pointer transition-colors"
                >
                  {workspace.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-text-muted">Active workspace</span>
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>12 members</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                </svg>
                <span>5 projects</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <span>Last active today</span>
              </div>
            </div>
          </div>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-2 rounded-lg hover:bg-surface-muted transition-colors text-text-muted hover:text-text-primary">
              <MoreVertical size={20} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="w-48 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50 p-2"
            >
              <DropdownMenu.Item
                onSelect={() => {
                  setName(workspace.name);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-3 cursor-pointer outline-none hover:bg-surface-muted rounded-lg text-text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                </svg>
                Rename Workspace
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-border my-1" />

              <DropdownMenu.Item
                onSelect={() => onDelete(workspace._id)}
                className="flex items-center gap-2 px-4 py-3 cursor-pointer outline-none hover:bg-danger-light text-danger rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Workspace
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
