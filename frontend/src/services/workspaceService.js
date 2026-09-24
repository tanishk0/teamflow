import api from "../api/axios.js"

export async function getWorkspaces(){
    const response = await api.get('/workspaces');
    return response.data.workspaces;
}

export async function getWorkspace(id) {
    const response = await api.get(`/workspaces/${id}`);
    return response.data.workspace;
}

export async function createWorkspace(name){
    const response = await api.post('/workspaces', {name})
    return response.data.workspace;
}

export async function renameWorkspace(id, name) {
  const response = await api.patch(`/workspaces/${id}`, { name });
  return response.data.workspace;
}

export async function deleteWorkspace(id) {
  await api.delete(`/workspaces/${id}`);
}

export async function getWorkspaceMembers(id) {
  const response = await api.get(`/workspaces/${id}/members`);
  return response.data.members;
}

export async function removeWorkspaceMember(workspaceId, userId) {
  const response = await api.delete(
    `/workspaces/${workspaceId}/members`,
    { data: { userId } }
  );
  return response.data;
}