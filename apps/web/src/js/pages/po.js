// Purchase Orders page module
import { listPOs, createPO, updatePO, submitPO, approvePO, deletePO } from '../po.js';

let posData = [];

export async function initializePO() {
  console.log('Initializing PO page...');
  
  try {
    await loadPOs();
    setupPOEventListeners();
  } catch (error) {
    console.error('Error loading POs:', error);
    showPOError(error);
  }
}

async function loadPOs(search = '') {
  try {
    posData = await listPOs({ search });
    renderPOTable();
  } catch (error) {
    console.error('Error loading POs:', error);
    throw error;
  }
}

function renderPOTable() {
  const tableBody = document.querySelector('#po-content tbody');
  if (!tableBody) return;

  if (posData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-gray-500">
          No purchase orders found
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = posData.map(po => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${po.number}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${po.supplier ? po.supplier.name : '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(po.status)}">
          ${formatStatus(po.status)}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${po.currency} ${Number(po.total).toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${new Date(po.createdAt).toLocaleDateString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex justify-end space-x-2">
          ${getActionButtons(po)}
        </div>
      </td>
    </tr>
  `).join('');
}

function getStatusClass(status) {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED': return 'bg-green-100 text-green-800';
    case 'ACKNOWLEDGED': return 'bg-blue-100 text-blue-800';
    case 'IN_FULFILLMENT': return 'bg-indigo-100 text-indigo-800';
    case 'SHIPPED': return 'bg-purple-100 text-purple-800';
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'INVOICED': return 'bg-orange-100 text-orange-800';
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getActionButtons(po) {
  let buttons = [];
  
  // View button - always available
  buttons.push(`<button onclick="viewPODetails('${po.id}')" class="text-blue-600 hover:text-blue-900">View</button>`);
  
  // Edit button - available for drafts
  if (po.status === 'DRAFT') {
    buttons.push(`<button onclick="editPO('${po.id}')" class="text-indigo-600 hover:text-indigo-900">Edit</button>`);
  }
  
  // Submit button - available for drafts
  if (po.status === 'DRAFT') {
    buttons.push(`<button onclick="submitPOConfirm('${po.id}')" class="text-green-600 hover:text-green-900">Submit</button>`);
  }
  
  // Approve button - available for pending approval
  if (po.status === 'PENDING_APPROVAL') {
    buttons.push(`<button onclick="approvePOConfirm('${po.id}')" class="text-green-600 hover:text-green-900">Approve</button>`);
  }
  
  // Delete button - available for drafts
  if (po.status === 'DRAFT') {
    buttons.push(`<button onclick="deletePOConfirm('${po.id}')" class="text-red-600 hover:text-red-900">Delete</button>`);
  }
  
  return buttons.join('');
}

function setupPOEventListeners() {
  // Search functionality
  const searchInput = document.querySelector('#po-content input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const search = e.target.value;
      loadPOs(search);
    });
  }

  // Add PO button
  const addButton = document.querySelector('#po-content button[onclick*="showCreatePOWizard"]');
  if (addButton) {
    addButton.onclick = showCreatePOWizard;
  }
}

function showCreatePOWizard() {
  console.log('Show create PO wizard');
}

function showPOError(error) {
  console.error('PO error:', error);
}

// Global functions for backwards compatibility
window.viewPODetails = (id) => {
  console.log('View PO details:', id);
};

window.editPO = (id) => {
  console.log('Edit PO:', id);
};

window.submitPOConfirm = async (id) => {
  if (confirm('Are you sure you want to submit this PO for approval?')) {
    try {
      await submitPO(id);
      await loadPOs();
      showToast('PO submitted for approval', 'success');
    } catch (error) {
      console.error('Error submitting PO:', error);
      showToast('Error submitting PO', 'error');
    }
  }
};

window.approvePOConfirm = async (id) => {
  if (confirm('Are you sure you want to approve this PO?')) {
    try {
      await approvePO(id);
      await loadPOs();
      showToast('PO approved successfully', 'success');
    } catch (error) {
      console.error('Error approving PO:', error);
      showToast('Error approving PO', 'error');
    }
  }
};

window.deletePOConfirm = async (id) => {
  if (confirm('Are you sure you want to delete this PO?')) {
    try {
      await deletePO(id);
      await loadPOs();
      showToast('PO deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting PO:', error);
      showToast('Error deleting PO', 'error');
    }
  }
};

function showToast(message, type) {
  console.log(`${type.toUpperCase()}: ${message}`);
}
