import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../src/api/axios.js";
import Button from "../components/Button.jsx";
import WorkspaceModal from "../components/modals/AddWorkspaceModal.jsx";
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
        const response = await api.get("/workspaces");

        setWorkspaces(response.data.workspaces);
      } catch (error) {
        console.error(error);
      }
    }

    fetchWorkspaces();
  }, []);

  //Create workspace through add workspace button
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
      <Sidebar items={items} />

      <div className="p-4 flex flex-col w-full">
        <div className="w-full p-2 flex justify-between">
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <Button
            text="Add workspace"
            onClick={() => setShowModal(true)}
          ></Button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {workspaces.length === 0 ? (
            <Button text="Add workspace" />
          ) : (
            workspaces.slice(0, 3).map((workspace) => (
              <div
                key={workspace._id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">
                  {workspace.workspaceId.name}
                </h3>
              </div>
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
