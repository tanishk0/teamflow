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