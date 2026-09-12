import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { getMyTeamInvites } from "../src/services/teamInvitationService.js";
import { getTeams } from "../src/services/teamService.js";

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  //fetching data
  useEffect(() => {
    async function fetchData() {
      try {
        const [teams, invites] = await Promise.all([
          getTeams(),
          getMyTeamInvites(),
        ]);

        setTeams(teams);
        setInvites(invites);
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
    <section className="min-h-screen w-full flex">
      <Sidebar items={items}></Sidebar>
      <div className="flex-col p-4">
        <div className="bg-red-200">
          <p className="font-semibold text-xl">Your teams</p>
          {loading ? (
            <p>Loading invitations...</p>
          ) : teams.length === 0 ? (
            <p>No pending invitations.</p>
          ) : (
            teams.map((team) => (
              <div key={team._id} onClick={() => navigate(`/team/${team._id}`)}>
                {team.name}
              </div>
            ))
          )}
        </div>
        <div className="bg-green-200">
          <p className="font-semibold text-xl">Invites</p>

          {invites.map((invite) => (
            <div key={invite._id}>{invite.teamId.name}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
