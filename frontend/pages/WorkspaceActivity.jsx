import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { getWorkspace } from "../src/services/workspaceService.js";
import { ArrowLeft } from "lucide-react";

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
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Top navigation / back link */}
          <Link
            to={`/workspace/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Workspace</span>
          </Link>

          {/* Activity Log remains as is */}
        </div>
      </main>
    </section>
  );
}
