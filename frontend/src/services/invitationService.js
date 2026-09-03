import api from "../api/axios.js";

// Incoming invitations for logged-in user
export async function getMyInvitations() {
  const response = await api.get("/invitations");
  return response.data.invitations;
}