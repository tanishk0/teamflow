import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Plus, Hash } from "lucide-react";
import api from "../src/api/axios";
import projectService from "../src/services/projectService";
import AddProjectModal from "./modals/AddProjectModal.jsx";

export default function Sidebar({
  items = [],
  workspaceId: propWorkspaceId,
  projects: propProjects,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const detectedWorkspaceId =
    propWorkspaceId ||
    items
      ?.find((item) => item.path?.startsWith("/workspace/"))
      ?.path?.split("/")[2] ||
    null;

  const [projects, setProjects] = useState(propProjects || []);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  useEffect(() => {
    if (propProjects) {
      const sorted = [...propProjects].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
      setProjects(sorted);
      return;
    }

    if (detectedWorkspaceId) {
      projectService
        .getProjects(detectedWorkspaceId)
        .then((data) => {
          const list = data || [];
          list.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          );
          setProjects(list);
        })
        .catch((err) =>
          console.error("Failed to fetch sidebar projects:", err)
        );
    }
  }, [detectedWorkspaceId, propProjects, location.pathname]);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  async function handleCreateProject(name, description) {
    if (!detectedWorkspaceId) return;
    const res = await projectService.createProject(
      detectedWorkspaceId,
      name,
      description
    );
    const newProject = res?.project || res;
    setShowAddProjectModal(false);

    // Refresh projects list
    if (newProject?._id) {
      setProjects((prev) => [newProject, ...prev]);
      navigate(`/${newProject._id}`);
    }
  }

  return (
    <aside className="flex flex-col justify-between w-64 shrink-0 h-screen sticky top-0 px-4 py-4 bg-white border-r border-border">
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Brand Logo */}
        <div className="text-primary text-2xl shrink-0">
          <span className="font-sans font-semibold text-text-primary">
            Team
          </span>
          <span className="font-serif italic">Flow</span>
        </div>

        {/* Scrollable Navigation items & Projects */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {/* Main items */}
          <div className="flex flex-col">
            {items.map((item, index) => (
              <NavLink
                key={`${item.label}-${item.path}-${index}`}
                to={item.path}
                end={item.end !== undefined ? item.end : true}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-primary font-semibold text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Your Projects Section (shown on workspaceId below settings) */}
          {detectedWorkspaceId && (
            <div className="mt-6 pt-4 border-t border-border/70">
              <div className="flex items-center justify-between px-2 mb-2 select-none">
                <span className="text-sm font-semibold text-text-primary tracking-tight">
                  Your Projects
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  className="text-primary hover:text-primary-dark p-1 rounded-md hover:bg-primary-light transition-colors cursor-pointer"
                  title="Create Project"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {projects.map((proj) => {
                  const isActive =
                    location.pathname === `/${proj._id}` ||
                    location.pathname === `/project/${proj._id}`;

                  return (
                    <Link
                      key={proj._id}
                      to={`/${proj._id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary-light text-primary font-semibold"
                          : "text-gray-700 hover:bg-gray-100 hover:text-text-primary"
                      }`}
                    >
                      <Hash
                        size={16}
                        className={`shrink-0 ${
                          isActive ? "text-primary" : "text-gray-400"
                        }`}
                      />
                      <span className="truncate">{proj.name}</span>
                    </Link>
                  );
                })}

                {projects.length === 0 && (
                  <p className="px-3 py-2 text-xs text-text-muted italic">
                    No projects yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        className="flex items-center gap-1 text-danger cursor-pointer hover:bg-danger-light p-2 rounded-md shrink-0 mt-2"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <p className="font-medium">Logout</p>
      </button>

      {/* Create Project Modal */}
      {showAddProjectModal && (
        <AddProjectModal
          onClose={() => setShowAddProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </aside>
  );
}
