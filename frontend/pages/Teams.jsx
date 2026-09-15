import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../src/services/teamService.js";
import InvitationCard from "../components/InvitationCard.jsx";
import {
  getMyTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
} from "../src/services/teamInvitationService.js";
export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  //fetching data
  useEffect(() => {
    async function fetchData() {
      try {
        const teams = await getTeams();
        setTeams(teams);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  //Sidebar
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];

  return (
    <section className="min-h-screen w-280 flex">
      <Sidebar items={items}></Sidebar>
      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {/* Your Teams */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-semibold text-xl">Your teams</p>
            <p className="text-sm text-gray-500">Teams you belong to</p>
          </div>

          <div className="p-4 space-y-2">
            {loading ? (
              <p className="text-gray-500">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-gray-500">No teams yet.</p>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  onClick={() => navigate(`/team/${team._id}`)}
                  className="p-4 rounded-lg border border-gray-200
                       hover:bg-gray-50 hover:border-gray-300
                       cursor-pointer transition"
                >
                  <p className="font-medium">{team.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
