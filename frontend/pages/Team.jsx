import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { getTeam } from "../src/services/teamService.js";
import { Settings as SettingsIcon } from "lucide-react";

export default function Team() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const items = [
    { label: "Overview", path: `/team/${id}` },
    { label: "Members", path: "/invitations" },
    { label: "Settings", path: `/team/${id}/settings` },
  ];

  useEffect(() => {
    async function fetchTeam() {
      try {
        const team = await getTeam(id);
        setTeam(team);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <section className="min-h-screen w-full flex bg-gray-50">
        <Sidebar items={items} />

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="mt-8 h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
          </div>
        </main>
      </section>
    );
  }

  if (!team) {
    return (
      <section className="min-h-screen w-full flex bg-gray-50">
        <Sidebar items={items} />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Team not found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              This team may have been deleted or you may not have access.
            </p>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full flex bg-gray-50">
      <Sidebar items={items} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Team</p>

              <h1 className="text-3xl font-semibold text-gray-900">
                {team.name}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {team.members.length}{" "}
                {team.members.length === 1 ? "member" : "members"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/team/${id}/settings`}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700
                           text-sm font-medium hover:bg-gray-50
                           transition flex items-center gap-2 shadow-xs"
              >
                <SettingsIcon size={16} className="text-gray-500" />
                Settings
              </Link>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white
                           text-sm font-medium hover:bg-blue-700
                           transition"
              >
                Invite members
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Members</h2>

              <p className="mt-1 text-sm text-gray-500">
                People who belong to this team.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {team.members.map((member) => (
                <div
                  key={member._id}
                  className="px-6 py-4 flex items-center justify-between
                             hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100
                                 flex items-center justify-center
                                 text-sm font-semibold text-gray-600"
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>

                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  {member._id === team.ownerId && (
                    <span
                      className="px-2.5 py-1 rounded-full bg-blue-50
                                 text-blue-700 text-xs font-medium"
                    >
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
