import { useNavigate } from "react-router-dom";
import { ChevronRight, Building2 } from "lucide-react";

export default function WorkspaceCard({ workspace, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/workspace/${workspace._id}`);
    }
  };

  const initial = workspace.name ? workspace.name.charAt(0).toUpperCase() : "W";

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group w-full bg-surface border border-border hover:border-primary/30
                 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200
                 cursor-pointer flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className="w-12 h-12 rounded-xl bg-primary-light text-primary
                     flex items-center justify-center font-bold text-lg shrink-0
                     group-hover:bg-primary group-hover:text-white transition-colors duration-200"
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
              {workspace.name}
            </h3>
          </div>
          <p className="text-xs font-medium text-text-muted mt-0.5 flex items-center gap-1.5">
            <Building2 size={13} className="text-text-muted" />
            Workspace
          </p>
        </div>
      </div>

      <div className="flex items-center text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all">
        <ChevronRight size={20} />
      </div>
    </div>
  );
}
