import Sidebar from "../components/Sidebar.jsx";

export default function Workspace() {
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items}></Sidebar>
    </div>  
  );
}
