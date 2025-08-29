// Suppliers page module
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../suppliers.js';
import { config } from '../config.js';
import { getDemoSuppliers } from '../demo.js';

let suppliersData = [];

export async function initializeSuppliers() {
  console.log('Initializing suppliers page...');
  
  try {
    await loadSuppliers();
    setupSuppliersEventListeners();
  } catch (error) {
    console.error('Error loading suppliers:', error);
    showSuppliersError(error);
  }
}

async function loadSuppliers(search = '') {
  try {
    if (config.USE_DEMO_DATA) {
      suppliersData = await getDemoSuppliers();
      // Filter by search if provided
      if (search) {
        suppliersData = suppliersData.filter(supplier => 
          supplier.name.toLowerCase().includes(search.toLowerCase()) ||
          (supplier.category && supplier.category.toLowerCase().includes(search.toLowerCase()))
        );
      }
    } else {
      suppliersData = await listSuppliers({ search });
    }
    renderSuppliersTable();
  } catch (error) {
    console.error('Error loading suppliers:', error);
    throw error;
  }
}

function renderSuppliersTable() {
  const tableBody = document.querySelector('#suppliers-content tbody');
  if (!tableBody) return;

  if (suppliersData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-gray-500">
          No suppliers found
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = suppliersData.map(supplier => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${supplier.name}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${supplier.category || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${supplier.location || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${supplier.contact || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${supplier.phone || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="editSupplier('${supplier.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
          Edit
        </button>
        <button onclick="deleteSupplierConfirm('${supplier.id}')" class="text-red-600 hover:text-red-900">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function setupSuppliersEventListeners() {
  // Search functionality
  const searchInput = document.querySelector('#suppliers-content input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const search = e.target.value;
      loadSuppliers(search);
    });
  }

  // Add supplier button
  const addButton = document.querySelector('#suppliers-content button[onclick*="showCreateSupplierModal"]');
  if (addButton) {
    addButton.onclick = showCreateSupplierModal;
  }
}

function showCreateSupplierModal() {
  // Implementation for create supplier modal
  console.log('Show create supplier modal');
}

function showSuppliersError(error) {
  console.error('Suppliers error:', error);
  // Show user-friendly error message
}

// Global functions for backwards compatibility
window.editSupplier = (id) => {
  console.log('Edit supplier:', id);
  // Implementation for edit supplier
};

window.deleteSupplierConfirm = async (id) => {
  if (confirm('Are you sure you want to delete this supplier?')) {
    try {
      await deleteSupplier(id);
      await loadSuppliers();
      showToast('Supplier deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToast('Error deleting supplier', 'error');
    }
  }
};

// Toast function (assuming it exists globally)
function showToast(message, type) {
  console.log(`${type.toUpperCase()}: ${message}`);
}
