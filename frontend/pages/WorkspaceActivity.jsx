import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function WorkspaceActivity() {
  const { id } = useParams();

  const items = [
    { label: "Projects", path: `/workspace/${id}` },
    { label: "Activity Log", path: `/workspace/${id}/activity` },
    { label: "Members", path: `/workspace/${id}/members` },
    { label: "Settings", path: `/workspace/${id}/settings` },
  ];

  return (
    <section className="flex min-h-screen w-full bg-gray-50">
      <Sidebar items={items} />
      <main className="flex-1 p-8">
        {/* Activity Log remains as is (blank) */}
      </main>
    </section>
  );
}
