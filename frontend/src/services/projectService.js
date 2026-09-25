import api from "../api/axios.js";

export async function createProject(workspaceId, name, description = "") {
  const response = await api.post(
    `/workspaces/${workspaceId}/projects`,
    { name, description }
  );
  return response.data;
}

export async function getProjects(workspaceId) {
  const response = await api.get(
    `/workspaces/${workspaceId}/projects`
  );
  return response.data.projects;
}

export async function getProject(workspaceId, projectId) {
  const response = await api.get(
    `/workspaces/${workspaceId}/projects/${projectId}`
  );
  return response.data;
}

export async function renameProject(workspaceId, projectId, name) {
  const response = await api.patch(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    { name }
  );
  return response.data;
}

export async function deleteProject(workspaceId, projectId) {
  const response = await api.delete(
    `/workspaces/${workspaceId}/projects/${projectId}`
  );
  return response.data;
}

const projectService = {
  createProject,
  getProjects,
  getProject,
  renameProject,
  deleteProject,
};

export default projectService;