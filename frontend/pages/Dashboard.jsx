import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../src/api/axios.js";
import Button from "../components/Button.jsx";
export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);

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
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />

      <div className="p-4 flex flex-col">
        <h2 className="text-3xl font-semibold">Dashboard</h2>

        <div>
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

                <p className="text-sm text-gray-500 mt-1">Your workspace</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
