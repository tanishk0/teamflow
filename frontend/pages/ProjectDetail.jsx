import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspace,
  getWorkspaceMembers,
} from "../src/services/workspaceService.js";
import projectService from "../src/services/projectService.js";
import taskService from "../src/services/taskService.js";
import TaskList from "../components/TaskList.jsx";
import TaskModal from "../components/modals/TaskModal.jsx";
import { Folder, ChevronRight, CheckSquare, Plus } from "lucide-react";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();

  const [workspaceId, setWorkspaceId] = useState(
    () =>
      location.state?.workspaceId || location.state?.project?.workspaceId || ""
  );
  const [workspace, setWorkspace] = useState(
    () => location.state?.workspace || null
  );
  const [project, setProject] = useState(
    () => location.state?.project || null
  );

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [modalInitialSection, setModalInitialSection] = useState("");

  // Derived existing sections directly from tasks (no hardcoded defaults)
  const existingSections = Array.from(
    new Set(tasks.map((t) => t.section?.trim()).filter(Boolean))
  );

  // Fetch Project and Workspace
  useEffect(() => {
    async function loadProjectAndWorkspace() {
      try {
        let currentWorkspaceId = workspaceId;
        let currentProject = project;

        if (!currentProject || !currentWorkspaceId) {
          const fetchedProject = await projectService.getProjectById(projectId);
          if (fetchedProject) {
            setProject(fetchedProject);
            currentProject = fetchedProject;
            currentWorkspaceId = fetchedProject.workspaceId;
            setWorkspaceId(fetchedProject.workspaceId);
          }
        }

        if (
          currentWorkspaceId &&
          (!workspace || workspace._id !== currentWorkspaceId)
        ) {
          const wsData = await getWorkspace(currentWorkspaceId);
          setWorkspace(wsData);
        }

        if (currentWorkspaceId) {
          const memberList = await getWorkspaceMembers(currentWorkspaceId);
          setMembers(memberList || []);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      }
    }

    if (projectId) {
      loadProjectAndWorkspace();
    }
  }, [projectId, workspaceId]);

  // Fetch Tasks
  async function fetchTasks() {
    if (!projectId) return;
    setTasksLoading(true);
    try {
      const data = await taskService.getTasks(projectId);
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Task Operations
  async function handleCreateTask(taskData) {
    const newTask = await taskService.createTask(projectId, taskData);
    setTasks((prev) => [newTask, ...prev]);
  }

  async function handleUpdateTask(taskId, updates) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t))
    );
    try {
      const updated = await taskService.updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updated : t))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      fetchTasks();
    }
  }

  async function handleDeleteTask(taskId) {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await taskService.deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      fetchTasks();
    }
  }

  function handleOpenCreateModal(defaultSection = "") {
    setTaskToEdit(null);
    setModalInitialSection(defaultSection || existingSections[0] || "");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(task) {
    setTaskToEdit(task);
    setModalInitialSection(task.section || "");
    setIsModalOpen(true);
  }

  async function handleSaveModalTask(taskData, taskId) {
    if (taskId) {
      await handleUpdateTask(taskId, taskData);
    } else {
      await handleCreateTask(taskData);
    }
  }

  const isOwner = Boolean(workspace?.isOwner || workspace?.role === "owner");
  const isManager = workspace?.role === "manager";
  const canManageTasks = isOwner || isManager;

  const items = [
    {
      label: "Projects",
      path: workspaceId ? `/workspace/${workspaceId}` : "/workspaces",
    },
    {
      label: "Activity Log",
      path: workspaceId ? `/workspace/${workspaceId}` : "/workspaces",
    },
    {
      label: "Members",
      path: workspaceId ? `/workspace/${workspaceId}` : "/workspaces",
    },
    ...(isOwner && workspaceId
      ? [{ label: "Settings", path: `/workspace/${workspaceId}/settings` }]
      : []),
  ];

  return (
    <section className="flex min-h-screen w-full bg-gray-50">
      {/* Same sidebar as /:workspaceId */}
      <Sidebar items={items} workspaceId={workspaceId} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header & Horizontal Navigation */}
        <header className="bg-white border-b border-border sticky top-0 z-10 px-8 pt-4">
          <div className="flex items-center justify-between pb-3 gap-4">
            {/* Breadcrumb & Project Name */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={workspaceId ? `/workspace/${workspaceId}` : "/workspaces"}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors truncate max-w-[200px]"
              >
                {workspace?.name || "Workspace"}
              </Link>
              <ChevronRight size={14} className="text-text-muted shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  <Folder size={14} />
                </div>
                <h1 className="text-base font-semibold text-text-primary truncate">
                  {project?.name || "Project"}
                </h1>
              </div>
            </div>

            {/* "+ New Task" Button - only for managers and owners */}
            {canManageTasks && (
              <button
                onClick={() => handleOpenCreateModal("")}
                className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer shrink-0 active:scale-95"
              >
                <Plus size={16} />
                <span>New Task</span>
              </button>
            )}
          </div>

          {/* Horizontal Navigation with only tasks for now */}
          <nav className="flex items-center gap-6 mt-1">
            <button className="flex items-center gap-2 pb-3 text-sm font-medium border-b-2 border-primary text-primary transition-all cursor-pointer">
              <CheckSquare size={16} />
              <span>Tasks</span>
            </button>
          </nav>
        </header>

        {/* Content Body: Task List */}
        <div className="flex-1 p-8 max-w-7xl">
          <TaskList
            tasks={tasks}
            members={members}
            loading={tasksLoading}
            canManageTasks={canManageTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
            onEditTask={handleOpenEditModal}
            onNewTask={(sec) => handleOpenCreateModal(sec || "")}
          />
        </div>
      </main>

      {/* Task Creation / Editing Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModalTask}
          taskToEdit={taskToEdit}
          initialSection={modalInitialSection}
          existingSections={existingSections}
          members={members}
          canManageTasks={canManageTasks}
        />
      )}
    </section>
  );
}
