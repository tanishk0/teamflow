import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../src/api/axios.js";
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
        const response = await api.get("/workspaces");

        setWorkspaces(response.data.workspaces || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchWorkspaces();
  }, []);
  async function handleCreateWorkspace(name) {
    try {
      const response = await api.post("/workspaces", {
        name,
      });
      const workspace = response.data.workspace;
      //Add newly added workspace to ui
      setWorkspaces((prevWorkspaces) => [...prevWorkspaces, workspace]);
      // Close the modal
      setShowModal(false);
    } catch (error) {
      console.log(error);
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
              <WorkspaceCard key={workspace._id} workspace={workspace} />
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
