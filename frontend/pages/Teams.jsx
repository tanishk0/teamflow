import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../src/services/teamService.js";
import Button from "../components/Button.jsx";
import TeamCard from "../components/TeamCard.jsx";
import TeamModal from "../components/modals/AddTeamModal.jsx";
import {
  createTeam,
  renameTeam,
  deleteTeam,
} from "../src/services/teamService.js";
import { createTeamInvite } from "../src/services/teamInvitationService.js";

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
  // Handle create
  async function handleCreateTeam(name, members) {
    try {
      const team = await createTeam(name);
      console.log("CREATED TEAM:", team);
      console.log("MEMBERS TO INVITE:", members);
      for (const member of members) {
        console.log("INVITING:", member);
        await createTeamInvite(team._id, member);
      }
      setTeams((prev) => [...prev, team]);
      setShowModal(false);
    } catch (error) {
      console.log(error);
      console.error("CREATE TEAM ERROR:", error);
    }
  }

  //rename
  async function handleRenameTeam(id, name) {
    try {
      await renameTeam(id, name);
      setTeams((prev) =>
        prev.map((team) => (team._id === id ? { ...team, name } : team)),
      );
    } catch (error) {
      console.log(error);
    }
  }
  //delete
  async function handleDeleteTeam(id) {
    try {
      await deleteTeam(id);
      setTeams((prev) => prev.filter((team) => team._id !== id));
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <section className="flex min-h-screen">
      <Sidebar items={items}></Sidebar>
      <div className="p-4 flex flex-col w-full">
        <div className="w-full p-2 flex justify-between">
          <h2 className="text-3xl font-semibold">Your teams</h2>
          <Button
            text="Create team"
            onClick={() => setShowModal(true)}
          ></Button>
        </div>
        <div className="flex flex-col gap-1 mt-4 h-full">
          {teams.length === 0 ? (
            <div className="flex flex-col gap-4 h-full w-full items-center justify-center">
              <p>You don't have any teams</p>
              <Button
                text="Create team"
                onClick={() => setShowModal(true)}
              ></Button>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                onClick={() => navigate(`/team/${team._id}`)}
                onRename={handleRenameTeam}
                onDelete={handleDeleteTeam}
              />
            ))
          )}
        </div>
      </div>
      {showModal && (
        <TeamModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateTeam}
        />
      )}
    </section>
  );
}
