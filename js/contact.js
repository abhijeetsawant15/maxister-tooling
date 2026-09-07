/**
 * MAXISTER TOOLING — RFQ / Contact Form Handling
 * Validation, drag-and-drop file attachments, error states, and submission feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('rfq-form');
  const statusBox = document.getElementById('form-status');
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('rfq-files');
  const fileListContainer = document.getElementById('attached-files-list');

  if (!form) return;

  // Store attached files
  let attachedFiles = [];

  // Helper to format bytes
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Render file chips
  function renderFileList() {
    if (!fileListContainer) return;
    fileListContainer.innerHTML = '';

    if (attachedFiles.length === 0) return;

    attachedFiles.forEach((file, index) => {
      const chip = document.createElement('div');
      chip.className = 'attached-file-chip';
      chip.innerHTML = `
        <div class="attached-file-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="attached-file-name" title="${file.name}">${file.name}</span>
          <span class="attached-file-size">${formatFileSize(file.size)}</span>
        </div>
        <button type="button" class="attached-file-remove" aria-label="Remove ${file.name}" data-index="${index}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      // Remove handler
      chip.querySelector('.attached-file-remove').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachedFiles.splice(index, 1);
        renderFileList();
      });

      fileListContainer.appendChild(chip);
    });
  }

  // Handle incoming files from picker or drop
  function handleFiles(files) {
    const maxFileSize = 25 * 1024 * 1024; // 25MB
    const oversizedFiles = [];

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        oversizedFiles.push(`${file.name} (${formatFileSize(file.size)})`);
      } else {
        // Prevent exact duplicates
        const exists = attachedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!exists) {
          attachedFiles.push(file);
        }
      }
    });

    if (oversizedFiles.length > 0 && statusBox) {
      statusBox.className = 'form-status error';
      statusBox.style.display = 'block';
      statusBox.innerHTML = `<strong>File size limit exceeded:</strong><br>The following file(s) exceed 25MB: ${oversizedFiles.join(', ')}. Please select smaller files.`;
    }

    renderFileList();
  }

  // Dropzone click & key triggers
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      fileInput.value = ''; // Reset so the same file can be re-selected if removed
    });

    // Drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFiles(dt.files);
      }
    });
  }

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset status
    if (statusBox) {
      statusBox.className = 'form-status';
      statusBox.style.display = 'none';
      statusBox.innerHTML = '';
    }

    const name = form.elements['name']?.value.trim();
    const company = form.elements['company']?.value.trim();
    const phone = form.elements['phone']?.value.trim();
    const email = form.elements['email']?.value.trim();
    const service = form.elements['service']?.value;
    const message = form.elements['message']?.value.trim();

    const errors = [];

    if (!name) {
      errors.push('Please enter your full name.');
    }

    const phoneRegex = /^[0-9+\s\-()]{7,15}$/;
    if (!phone || !phoneRegex.test(phone)) {
      errors.push('Please enter a valid phone number.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Please enter a valid email address.');
    }

    if (!service) {
      errors.push('Please select the service required.');
    }

    if (!message || message.length < 5) {
      errors.push('Please provide component or machining requirements in the message.');
    }

    if (errors.length > 0) {
      if (statusBox) {
        statusBox.className = 'form-status error';
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<strong>Please correct the following:</strong><ul style="margin-top: 0.5rem; padding-left: 1.25rem;">${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
      }
      return;
    }

    // Attachments summary
    const fileSummary = attachedFiles.length > 0 
      ? `\nAttached Files (${attachedFiles.length}): ` + attachedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ')
      : '';

    // Target contact info
    const recipientPhone = '8380801307';
    const recipientEmail = 'maxistertooling@gmail.com';

    // Prepare WhatsApp text
    const waText = encodeURIComponent(
      `Hello Maxister Tooling,\n\nName: ${name}\nCompany: ${company || 'N/A'}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nMessage: ${message}${fileSummary}`
    );
    const waUrl = `https://wa.me/91${recipientPhone}?text=${waText}`;
    
    // Prepare Mailto link
    const mailSubject = encodeURIComponent(`RFQ: ${service} - ${name} (${company || 'Direct'})`);
    const mailBody = encodeURIComponent(
      `Name: ${name}\nCompany: ${company || 'N/A'}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\nRequirements:\n${message}${fileSummary}\n\n[Please attach your files in this email]`
    );
    const mailUrl = `mailto:${recipientEmail}?subject=${mailSubject}&body=${mailBody}`;

    // Success confirmation
    if (statusBox) {
      statusBox.className = 'form-status success';
      statusBox.style.display = 'block';

      let filesHtml = '';
      if (attachedFiles.length > 0) {
        filesHtml = `
          <div style="margin-top: 0.5rem; padding: 0.5rem 0.75rem; background-color: rgba(26, 127, 72, 0.08); border-radius: 4px; font-size: 0.85rem;">
            <strong>📎 Attached (${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''}):</strong>
            <ul style="margin: 0.25rem 0 0; padding-left: 1.25rem;">
              ${attachedFiles.map(f => `<li>${f.name} (${formatFileSize(f.size)})</li>`).join('')}
            </ul>
          </div>
        `;
      }

      statusBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div>
            <strong>✓ Thank you, ${name}!</strong>
            <p style="margin: 0.25rem 0 0; color: #14532D; font-size: 0.9rem;">
              Your quotation enquiry for <strong>${service}</strong> has been prepared. You can immediately send your specifications and attach files via WhatsApp or Email:
            </p>
            ${filesHtml}
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.25rem;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background-color: #25D366; color: #FFFFFF; border-color: #25D366; border-radius: 4px;">
              Send via WhatsApp (+91 ${recipientPhone}) ➔
            </a>
            <a href="${mailUrl}" class="btn btn-sm btn-secondary" style="border-radius: 4px;">
              Email to ${recipientEmail}
            </a>
          </div>
        </div>
      `;
    }

    form.reset();
    attachedFiles = [];
    renderFileList();
  });
}
