import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { getWorkspace } from "../src/services/workspaceService.js";

export default function WorkspaceActivity() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    if (id) {
      getWorkspace(id)
        .then((data) => setWorkspace(data))
        .catch(() => {});
    }
  }, [id]);

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
      <main className="flex-1 p-8">
        {/* Activity Log remains as is (blank) */}
      </main>
    </section>
  );
}
