import api from "../api/axios.js"

export async function getWorkspace(){
    const response = await api.get('/workspace');
    return response.data.workspaces;
}

export async function createWorkspace(name){
    const response = await api.post('/workspaces', {name})
    return response.data.workspace;
}
