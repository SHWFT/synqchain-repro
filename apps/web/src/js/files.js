// Files module
import { api, uploadFile } from './api.js';

export async function upload(entityType, entityId, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  
  return uploadFile('/files/upload', formData);
}

export async function getFilesByEntity(entityType, entityId) {
  return api(`/files/entity/${entityType}/${entityId}`);
}

export async function deleteFile(id) {
  return api(`/files/${id}`, {
    method: 'DELETE'
  });
}

export function getFileDownloadUrl(id) {
  return `http://localhost:4000/files/${id}`;
}
