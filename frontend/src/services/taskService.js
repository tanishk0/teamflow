import api from "../api/axios.js";

export async function getTasks(projectId, filters = {}) {
  const response = await api.get(`/projects/${projectId}/tasks`, {
    params: filters,
  });
  return response.data.tasks;
}

export async function createTask(projectId, taskData) {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data.task;
}

export async function getTask(taskId) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data.task;
}

export async function updateTask(taskId, updates) {
  const response = await api.patch(`/tasks/${taskId}`, updates);
  return response.data.task;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

const taskService = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};

export default taskService;
