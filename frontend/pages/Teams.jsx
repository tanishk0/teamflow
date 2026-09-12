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

  async function handleAcceptInvite(invitationId) {
    try {
      await acceptTeamInvite(invitationId);

      // Remove accepted invite from UI
      setInvites((prev) =>
        prev.filter((invite) => invite._id !== invitationId),
      );

      // Refresh teams so the newly joined team appears
      const updatedTeams = await getTeams();
      setTeams(updatedTeams);
    } catch (error) {
      console.error(error);
    }
  }
  async function handleRejectInvite(invitationId) {
    try {
      await rejectTeamInvite(invitationId);

      setInvites((prev) =>
        prev.filter((invite) => invite._id !== invitationId),
      );
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section className="min-h-screen w-280 flex">
      <Sidebar items={items}></Sidebar>
      <div className="flex-col w-full p-4">
        <div className="">
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
        <div className="">
          <p className="font-semibold text-xl">Invites</p>

          {invites.map((invite) => (
            <InvitationCard
              invite={invite}
              type="team"
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
