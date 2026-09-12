import api from "../api/axios.js";

// Get teams
export async function getTeams() {
  const response = await api.get("/teams");

  return response.data.teams;
}

// Create team
export async function createTeam(name) {
  const response = await api.post("/teams", { name });

  return response.data.team;
}

// Rename team
export async function renameTeam(id, name) {
  const response = await api.patch(`/teams/${id}`, { name });

  return response.data.team;
}

// Delete team
export async function deleteTeam(id) {
  await api.delete(`/teams/${id}`);
}

// Remove member from team
export async function removeMember(teamId, userId) {
  const response = await api.delete(
    `/teams/${teamId}/members`,
    { data: { userId } }
  );

  return response.data;
}