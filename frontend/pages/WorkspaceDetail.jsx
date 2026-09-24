import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const items = [
    { label: "Projects", path: `/workspace/${id}` },
    { label: "Activity Log", path: `/workspace/${id}/activity` },
    { label: "Members", path: `/workspace/${id}/members` },
    { label: "Settings", path: `/workspace/${id}/settings` },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />
    </div>
  );
}