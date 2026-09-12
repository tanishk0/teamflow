import api from "../api/axios.js";

// Incoming team invitations
export async function getMyTeamInvites() {
  const response = await api.get("/team-invitations");

  return response.data.teamInvitations;
}

// Outgoing invitations for a specific team
export async function getTeamInvites(teamId) {
  const response = await api.get(
    `/team-invitations/${teamId}/invitations`
  );

  return response.data.teamInvitations;
}

// Send team invitation
export async function createTeamInvite(teamId, email) {
  const response = await api.post(
    `/team-invitations/${teamId}`,
    { email }
  );

  return response.data;
}

// Accept team invitation
export async function acceptTeamInvite(invitationId) {
  const response = await api.patch(
    `/team-invitations/${invitationId}/accept`
  );

  return response.data;
}

// Reject team invitation
export async function rejectTeamInvite(invitationId) {
  const response = await api.patch(
    `/team-invitations/${invitationId}/reject`
  );

  return response.data;
}