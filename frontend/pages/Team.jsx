import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeam } from "../src/services/teamService.js";

export default function Team() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;
  if (!team) return <p>Team not found.</p>;

  return (
    <div>
      <h1>{team.name}</h1>

      <h2>Members</h2>

      {team.members.map((member) => (
        <div key={member._id}>
          {member.name} — {member.email}
        </div>
      ))}
    </div>
  );
}
