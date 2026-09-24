import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import {
  getWorkspaces,
  createWorkspace,
} from "../src/services/workspaceService.js";
import api from "../src/api/axios.js";
import { createInvitation } from "../src/services/invitationService.js";
import { addTeamsToWorkspace } from "../src/services/workspaceTeamService.js";

import Button from "../components/Button.jsx";
import WorkspaceModal from "../components/modals/AddWorkspaceModal.jsx";
import WorkspaceCard from "../components/WorkspaceCard.jsx";
export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(console.error);
  }, []);

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
  async function handleCreateWorkspace(name, members, teamIds) {
    try {
      const workspace = await createWorkspace(name);

      if (teamIds?.length > 0) {
        await addTeamsToWorkspace(workspace._id, teamIds);
      }

      for (const member of members) {
        try {
          await createInvitation(workspace._id, member);
        } catch (inviteError) {
          console.warn("Failed to invite member:", member, inviteError);
        }
      }

      setWorkspaces((prev) => [...prev, workspace]);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />

      <div className="p-4 flex flex-col w-full">
        <div className="w-full p-2 flex justify-between">
          <div className="flex flex-col">
            <h2 className="text-3xl font-semibold">Dashboard</h2>
            <p>Welcome back, {user?.name}</p>
          </div>
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
