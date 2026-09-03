import api from "../api/axios.js";

// Incoming invitations for logged-in user
export async function getMyInvitations() {
  const response = await api.get("/invitations");
  return response.data.invitations;
}

// Outgoing invitations for a workspace
export async function getWorkspaceInvitations(workspaceId) {
  const response = await api.get(
    `/workspaces/${workspaceId}/invitations`,
  );

  return response.data.invitations;
}

// Send invite
export async function createInvitation(workspaceId, member) {
  const response = await api.post(
    `/workspaces/${workspaceId}/invitations`,
    member,
  );

  return response.data.invitation;
}

// Accept
export async function acceptInvitation(invitationId) {
  const response = await api.patch(
    `/invitations/${invitationId}/accept`,
  );

  return response.data;
}

// Reject
export async function rejectInvitation(invitationId) {
  const response = await api.patch(
    `/invitations/${invitationId}/reject`,
  );

  return response.data;
}