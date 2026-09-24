import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../src/api/axios.js";
import { addTeamsToWorkspace } from "../src/services/workspaceTeamService.js";
import {
  getWorkspaces,
  createWorkspace,
} from "../src/services/workspaceService.js";
import { createInvitation } from "../src/services/invitationService.js";
import Button from "../components/Button.jsx";
import WorkspaceModal from "../components/modals/AddWorkspaceModal.jsx";
import WorkspaceCard from "../components/WorkspaceCard.jsx";
import { useNavigate } from "react-router-dom";
export default function Workspace() {
  const [showModal, setShowModal] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];
  const navigate = useNavigate();
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
      console.log("1", { name, members, teamIds });

      const workspace = await createWorkspace(name);
      console.log("2 workspace created", workspace._id);

      if (teamIds?.length > 0) {
        console.log("3 adding teams", teamIds);
        await addTeamsToWorkspace(workspace._id, teamIds);
        console.log("4 teams added");
      }

      for (const member of members) {
        console.log("5 inviting", member);
        try {
          await createInvitation(workspace._id, member);
        } catch (inviteError) {
          console.warn("Failed to invite member:", member, inviteError);
        }
      }

      setWorkspaces((prev) => [...prev, workspace]);
      setShowModal(false);
    } catch (error) {
      console.error("ERROR:", error.response?.data || error);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items}></Sidebar>
      <div className="p-4 flex flex-col w-full">
        <div className="w-full p-2 flex justify-between">
          <h2 className="text-3xl font-semibold">Your workspaces</h2>
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
            workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace._id}
                workspace={workspace}
              />
            ))
          )}
        </div>
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
