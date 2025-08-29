// Projects module
import { api } from './api.js';

export async function listProjects({ search } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const url = params.toString() ? `/projects?${params}` : '/projects';
  return api(url);
}

export async function createProject(projectData) {
  return api('/projects', {
    method: 'POST',
    body: projectData
  });
}

export async function getProject(id) {
  return api(`/projects/${id}`);
}

export async function updateProject(id, projectData) {
  return api(`/projects/${id}`, {
    method: 'PUT',
    body: projectData
  });
}

export async function deleteProject(id) {
  return api(`/projects/${id}`, {
    method: 'DELETE'
  });
}
