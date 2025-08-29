// Timeline component for displaying PO events and audit trail

export class Timeline {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      showPagination: true,
      itemsPerPage: 10,
      ...options
    };
    this.events = [];
    this.currentPage = 1;
    this.totalPages = 1;
  }

  render(events, pagination = null) {
    this.events = events;
    if (pagination) {
      this.currentPage = pagination.page;
      this.totalPages = pagination.totalPages;
    }

    this.container.innerHTML = `
      <div class="timeline-container">
        <div class="timeline-header mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Event Timeline</h3>
          <p class="text-sm text-gray-500">Audit trail for this purchase order</p>
        </div>
        
        <div class="timeline-events space-y-4">
          ${this.renderEvents()}
        </div>
        
        ${this.options.showPagination && pagination ? this.renderPagination(pagination) : ''}
      </div>
    `;

    this.attachPaginationEvents();
  }

  renderEvents() {
    if (this.events.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-2">📋</div>
          <p>No events recorded yet</p>
        </div>
      `;
    }

    return this.events.map((event, index) => {
      const isLast = index === this.events.length - 1;
      return `
        <div class="timeline-event relative">
          <!-- Timeline line -->
          ${!isLast ? '<div class="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>' : ''}
          
          <!-- Event content -->
          <div class="flex items-start space-x-3">
            <!-- Event icon -->
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${this.getEventIconClass(event.type)}">
              ${this.getEventIcon(event.type)}
            </div>
            
            <!-- Event details -->
            <div class="flex-1 min-w-0">
              <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-medium text-gray-900">${event.payload.message}</h4>
                  <span class="text-xs text-gray-500">${this.formatDate(event.createdAt)}</span>
                </div>
                
                <div class="text-sm text-gray-600 space-y-1">
                  ${this.renderEventDetails(event)}
                </div>
                
                <div class="mt-2 text-xs text-gray-400">
                  by ${event.payload.actorEmail || 'System'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderEventDetails(event) {
    const details = [];
    
    if (event.payload.previousStatus && event.payload.newStatus) {
      details.push(`Status changed from <span class="font-medium">${this.formatStatus(event.payload.previousStatus)}</span> to <span class="font-medium">${this.formatStatus(event.payload.newStatus)}</span>`);
    }
    
    if (event.payload.notes) {
      details.push(`<div class="mt-1 italic">"${event.payload.notes}"</div>`);
    }
    
    if (event.payload.changes && Object.keys(event.payload.changes).length > 0) {
      const changes = Object.entries(event.payload.changes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      details.push(`<div class="mt-1 text-xs bg-gray-50 p-1 rounded">Changes: ${changes}</div>`);
    }
    
    return details.join('');
  }

  renderPagination(pagination) {
    if (pagination.totalPages <= 1) return '';

    return `
      <div class="timeline-pagination mt-6 flex items-center justify-between border-t pt-4">
        <div class="text-sm text-gray-600">
          Showing ${pagination.page} of ${pagination.totalPages} pages (${pagination.total} total events)
        </div>
        
        <div class="flex space-x-2">
          <button 
            class="pagination-btn prev-btn px-3 py-1 text-sm border rounded ${!pagination.hasPrev ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}"
            ${!pagination.hasPrev ? 'disabled' : ''}
          >
            Previous
          </button>
          
          <span class="px-3 py-1 text-sm text-gray-600">
            Page ${pagination.page}
          </span>
          
          <button 
            class="pagination-btn next-btn px-3 py-1 text-sm border rounded ${!pagination.hasNext ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}"
            ${!pagination.hasNext ? 'disabled' : ''}
          >
            Next
          </button>
        </div>
      </div>
    `;
  }

  attachPaginationEvents() {
    const prevBtn = this.container.querySelector('.prev-btn');
    const nextBtn = this.container.querySelector('.next-btn');

    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        this.container.dispatchEvent(new CustomEvent('pageChange', {
          detail: { page: this.currentPage - 1 }
        }));
      });
    }

    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => {
        this.container.dispatchEvent(new CustomEvent('pageChange', {
          detail: { page: this.currentPage + 1 }
        }));
      });
    }
  }

  getEventIconClass(type) {
    const classes = {
      'created': 'bg-blue-100 text-blue-600',
      'updated': 'bg-yellow-100 text-yellow-600',
      'submitted': 'bg-orange-100 text-orange-600',
      'approved': 'bg-green-100 text-green-600',
      'rejected': 'bg-red-100 text-red-600',
      'acknowledged': 'bg-purple-100 text-purple-600',
      'shipped': 'bg-indigo-100 text-indigo-600',
      'delivered': 'bg-green-100 text-green-600',
    };
    return classes[type] || 'bg-gray-100 text-gray-600';
  }

  getEventIcon(type) {
    const icons = {
      'created': '📄',
      'updated': '✏️',
      'submitted': '📤',
      'approved': '✅',
      'rejected': '❌',
      'acknowledged': '👁️',
      'shipped': '🚚',
      'delivered': '📦',
    };
    return icons[type] || '📋';
  }

  formatStatus(status) {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Export for global use
window.Timeline = Timeline;
