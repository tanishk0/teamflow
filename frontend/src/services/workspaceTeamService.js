import api from "../api/axios.js";

export async function addTeamsToWorkspace(workspaceId, teamIds) {
  const response = await api.post(
    `/workspaces/${workspaceId}/teams`,
    { teamIds }
  );

  return response.data;
}