import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Button from "../components/Button.jsx";
import { getWorkspace } from "../src/services/workspaceService.js";
import projectService from "../src/services/projectService.js";
import AddProjectModal from "../components/modals/AddProjectModal.jsx";
import { Folder, FolderPlus, Clock, ArrowLeft } from "lucide-react";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function fetchProjects() {
    try {
      const data = await projectService.getProjects(id);
      setProjects(data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        getWorkspace(id).then((data) => setWorkspace(data)),
        fetchProjects(),
      ])
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleCreateProject(name, description) {
    await projectService.createProject(id, name, description);
    await fetchProjects();
    setShowModal(false);
  }

  const isOwner = Boolean(workspace?.isOwner || workspace?.role === "owner");

  const items = [
    { label: "Projects", path: `/workspace/${id}` },
    { label: "Activity Log", path: `/workspace/${id}/activity` },
    { label: "Members", path: `/workspace/${id}/members` },
    ...(isOwner ? [{ label: "Settings", path: `/workspace/${id}/settings` }] : []),
  ];

  return (
    <section className="flex min-h-screen w-full bg-gray-50">
      <Sidebar items={items} workspaceId={id} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Top navigation / back link */}
          <Link
            to="/workspaces"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Workspaces</span>
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Workspace
              </p>
              <h1 className="text-3xl font-semibold text-text-primary">
                {workspace?.name ? `${workspace.name} - Projects` : "Projects"}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Manage and track all projects in this workspace
              </p>
            </div>

            <Button
              text="Create project"
              onClick={() => setShowModal(true)}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted text-sm">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-dashed border-border text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <FolderPlus size={32} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                No projects yet
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mb-6">
                Get started by creating your first project for this workspace.
              </p>
              <Button
                text="Create project"
                onClick={() => setShowModal(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() =>
                    navigate(`/${project._id}`, {
                      state: { workspaceId: id, workspace, project },
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/${project._id}`, {
                        state: { workspaceId: id, workspace, project },
                      });
                    }
                  }}
                  className="group bg-white rounded-2xl p-6 border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-base shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <Folder size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                    </div>
                    {project.description ? (
                      <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm text-text-muted italic mb-4">
                        No description provided
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "Recently created"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <AddProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </section>
  );
}