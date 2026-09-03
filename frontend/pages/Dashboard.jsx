import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspaces,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
} from "../src/services/workspaceService.js";
import { createInvitation } from "../src/services/invitationService.js";

import Button from "../components/Button.jsx";
import WorkspaceModal from "../components/modals/AddWorkspaceModal.jsx";
import WorkspaceCard from "../components/WorkspaceCard.jsx";
export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const workspaces = await getWorkspaces();
        setWorkspaces(workspaces || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchWorkspaces();
  }, []);

  //Create workspace through add workspace button
  async function handleCreateWorkspace(name, members) {
    try {
      const workspace = await createWorkspace(name);

      for (const member of members) {
        await createInvitation(workspace._id, member);
      }

      setWorkspaces((prev) => [...prev, workspace]);
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  }
  // handle delete
  async function handleDeleteWorkspace(id) {
    try {
      await deleteWorkspace(id);

      setWorkspaces((prev) => prev.filter((workspace) => workspace._id !== id));
    } catch (error) {
      console.error(error);
    }
  }
  //handle name
  async function handleRenameWorkspace(id, name) {
    try {
      await renameWorkspace(id, name);

      setWorkspaces((prev) =>
        prev.map((workspace) =>
          workspace._id === id ? { ...workspace, name } : workspace,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />

      <div className="p-4 flex flex-col w-full">
        <div className="w-full p-2 flex justify-between">
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <Button
            text="Add workspace"
            onClick={() => setShowModal(true)}
          ></Button>
        </div>

        <div className="flex flex-col gap-1 mt-4 h-full">
          {workspaces.length === 0 ? (
            <div className="flex flex-col gap-4 h-full w-full items-center justify-center">
              <p>You don't have any workspaces</p>
              <Button
                text="Add workspace"
                onClick={() => setShowModal(true)}
              ></Button>
            </div>
          ) : (
            workspaces
              .slice(0, 3)
              .map((workspace) => (
                <WorkspaceCard
                  key={workspace._id}
                  workspace={workspace}
                  onRename={handleRenameWorkspace}
                  onDelete={handleDeleteWorkspace}
                />
              ))
          )}
        </div>
      </div>
      <div className="w-[32%] flex flex-col p-2 bg-white">
        <h1>Activity Log</h1>
      </div>
      {showModal && (
        <WorkspaceModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateWorkspace}
        />
      )}
    </div>
  );
}
