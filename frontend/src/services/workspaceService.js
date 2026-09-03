import api from "../api/axios.js"

export async function getWorkspace(){
    const response = await api.get('/workspace');
    return response.data.workspaces;
}
