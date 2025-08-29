// File upload component with progress tracking
import { upload } from '../files.js';
import { showToast, showErrorToast } from './toast.js';

export class FileUploadComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      multiple: false,
      ...options
    };
    
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="file-upload-component">
        <div class="file-upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input type="file" class="file-input hidden" ${this.options.multiple ? 'multiple' : ''}>
          <div class="upload-content">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-gray-600 mb-2">Drop files here or <button class="text-blue-600 hover:text-blue-800 font-medium">browse</button></p>
            <p class="text-sm text-gray-500">PDF, Images, CSV, Excel, Word (max 25MB)</p>
          </div>
        </div>
        
        <div class="file-list mt-4 space-y-2"></div>
      </div>
    `;
  }

  attachEvents() {
    const fileInput = this.container.querySelector('.file-input');
    const uploadArea = this.container.querySelector('.file-upload-area');
    const browseButton = this.container.querySelector('button');

    // Browse button click
    browseButton.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('border-blue-400', 'bg-blue-50');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    });
  }

  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.options.maxSize) {
      errors.push(`File size exceeds ${Math.round(this.options.maxSize / (1024 * 1024))}MB limit`);
    }

    // Check file type
    if (!this.options.allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    return errors;
  }

  handleFiles(files) {
    if (!this.options.multiple && files.length > 1) {
      showErrorToast({ message: 'Only one file allowed' });
      return;
    }

    files.forEach(file => {
      const errors = this.validateFile(file);
      if (errors.length > 0) {
        showErrorToast({ message: errors.join(', ') });
        return;
      }

      this.addFileToList(file);
    });
  }

  addFileToList(file) {
    const fileList = this.container.querySelector('.file-list');
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fileItem = document.createElement('div');
    fileItem.className = 'file-item border rounded-lg p-3 bg-gray-50';
    fileItem.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="font-medium text-sm">${file.name}</div>
          <div class="text-xs text-gray-500">${this.formatFileSize(file.size)}</div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="upload-btn text-blue-600 hover:text-blue-800 text-sm font-medium">Upload</button>
          <button class="remove-btn text-red-600 hover:text-red-800 text-sm">Remove</button>
        </div>
      </div>
      <div class="progress-container hidden mt-2">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="progress-bar bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <div class="progress-text text-xs text-gray-500 mt-1">0%</div>
      </div>
    `;

    fileList.appendChild(fileItem);

    // Add event listeners
    const uploadBtn = fileItem.querySelector('.upload-btn');
    const removeBtn = fileItem.querySelector('.remove-btn');

    uploadBtn.addEventListener('click', () => {
      this.uploadFile(file, fileItem);
    });

    removeBtn.addEventListener('click', () => {
      fileItem.remove();
    });
  }

  async uploadFile(file, fileItem, entityType, entityId) {
    if (!entityType || !entityId) {
      showErrorToast({ message: 'Entity type and ID required for upload' });
      return;
    }

    const uploadBtn = fileItem.querySelector('.upload-btn');
    const progressContainer = fileItem.querySelector('.progress-container');
    const progressBar = fileItem.querySelector('.progress-bar');
    const progressText = fileItem.querySelector('.progress-text');

    try {
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';
      progressContainer.classList.remove('hidden');

      // Simulate progress (since fetch doesn't support upload progress natively)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
      }, 200);

      const result = await upload(entityType, entityId, file);

      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      progressText.textContent = '100%';

      setTimeout(() => {
        fileItem.classList.add('border-green-200', 'bg-green-50');
        uploadBtn.textContent = 'Uploaded';
        uploadBtn.className = 'text-green-600 text-sm font-medium';
        
        showToast('File uploaded successfully', 'success');
        
        // Trigger custom event
        this.container.dispatchEvent(new CustomEvent('fileUploaded', {
          detail: { file, result }
        }));
      }, 500);

    } catch (error) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Retry';
      progressContainer.classList.add('hidden');
      
      fileItem.classList.add('border-red-200', 'bg-red-50');
      showErrorToast(error);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Public methods
  setEntityInfo(entityType, entityId) {
    this.entityType = entityType;
    this.entityId = entityId;
    
    // Auto-upload any pending files
    const uploadButtons = this.container.querySelectorAll('.upload-btn:not([disabled])');
    uploadButtons.forEach((btn, index) => {
      const fileItem = btn.closest('.file-item');
      const files = this.container.querySelectorAll('.file-item');
      // This is simplified - in a real implementation, you'd store file references
      // For now, this provides the UI structure
    });
  }

  clear() {
    const fileList = this.container.querySelector('.file-list');
    fileList.innerHTML = '';
  }
}

// Global helper for creating file upload components
window.createFileUpload = (container, options) => {
  return new FileUploadComponent(container, options);
};
