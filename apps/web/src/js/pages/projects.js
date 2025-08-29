// Projects page module
import { listProjects, createProject, updateProject, deleteProject } from '../projects.js';
import { config } from '../config.js';
import { getDemoProjects } from '../demo.js';

let projectsData = [];

export async function initializeProjects() {
  console.log('Initializing projects page...');
  
  try {
    await loadProjects();
    setupProjectsEventListeners();
  } catch (error) {
    console.error('Error loading projects:', error);
    showProjectsError(error);
  }
}

async function loadProjects(search = '') {
  try {
    if (config.USE_DEMO_DATA) {
      projectsData = await getDemoProjects();
      // Filter by search if provided
      if (search) {
        projectsData = projectsData.filter(project => 
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          (project.client && project.client.toLowerCase().includes(search.toLowerCase()))
        );
      }
    } else {
      projectsData = await listProjects({ search });
    }
    renderProjectsTable();
  } catch (error) {
    console.error('Error loading projects:', error);
    throw error;
  }
}

function renderProjectsTable() {
  const tableBody = document.querySelector('#projects-content tbody');
  if (!tableBody) return;

  if (projectsData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-gray-500">
          No projects found
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = projectsData.map(project => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${project.name}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${project.client || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(project.priority)}">
          ${project.priority || 'Medium'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(project.status)}">
          ${project.status || 'Planning'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${project.savingsTarget ? '$' + project.savingsTarget.toLocaleString() : '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="editProject('${project.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
          Edit
        </button>
        <button onclick="deleteProjectConfirm('${project.id}')" class="text-red-600 hover:text-red-900">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Planning': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function setupProjectsEventListeners() {
  // Search functionality
  const searchInput = document.querySelector('#projects-content input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const search = e.target.value;
      loadProjects(search);
    });
  }

  // Add project button
  const addButton = document.querySelector('#projects-content button[onclick*="showCreateProjectModal"]');
  if (addButton) {
    addButton.onclick = showCreateProjectModal;
  }
}

function showCreateProjectModal() {
  console.log('Show create project modal');
}

function showProjectsError(error) {
  console.error('Projects error:', error);
}

// Global functions for backwards compatibility
window.editProject = (id) => {
  console.log('Edit project:', id);
};

window.deleteProjectConfirm = async (id) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await deleteProject(id);
      await loadProjects();
      showToast('Project deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Error deleting project', 'error');
    }
  }
};

function showToast(message, type) {
  console.log(`${type.toUpperCase()}: ${message}`);
}
