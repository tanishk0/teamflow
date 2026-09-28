import api from "../api/axios.js";

export async function getUserActivityFeed() {
  const response = await api.get("/activity/feed");
  return response.data.activities || [];
}

export async function getWorkspaceActivity(workspaceId, params = {}) {
  const response = await api.get(`/workspaces/${workspaceId}/activity`, {
    params,
  });
  return response.data;
}

const activityService = {
  getUserActivityFeed,
  getWorkspaceActivity,
};

export default activityService;
