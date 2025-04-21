// DOM Elements
const urlList = document.getElementById('urlList');
const paginationTop = document.getElementById('paginationTop');
const paginationBottom = document.getElementById('paginationBottom');
const totalUrlsElement = document.getElementById('totalUrls');
const totalPagesElement = document.getElementById('totalPages');
const currentPageRangeElement = document.getElementById('currentPageRange');
const footerTotalElement = document.getElementById('footerTotal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const itemsPerPageSelect = document.getElementById('itemsPerPage');

// URL Preview Modal Elements
const urlPreviewModal = document.getElementById('urlPreviewModal');
const modalUrlText = document.getElementById('modalUrlText');
const modalUrlLink = document.getElementById('modalUrlLink');
const modalDomain = document.getElementById('modalDomain');
const modalProtocol = document.getElementById('modalProtocol');
const copyUrlBtn = document.getElementById('copyUrlBtn');

// State
let currentPage = 1;
let itemsPerPage = 100;
let totalUrls = 0;
let totalPages = 0;
let searchQuery = '';
let urlsData = [];

// Bootstrap modal instance
let urlModal;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap modal
  urlModal = new bootstrap.Modal(urlPreviewModal);
  
  // Set initial items per page
  itemsPerPage = parseInt(itemsPerPageSelect.value);
  
  // Load initial data
  fetchUrls();
  
  // Set up event listeners
  setupEventListeners();
  
  // Create invisible toast container
  createToastContainer();
});

// Set up event listeners
function setupEventListeners() {
  // Search button click
  searchButton.addEventListener('click', handleSearch);
  
  // Search input enter key
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  // Items per page change
  itemsPerPageSelect.addEventListener('change', () => {
    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to first page
    fetchUrls();
  });
  
  // Copy URL button
  copyUrlBtn.addEventListener('click', () => {
    const urlText = modalUrlText.textContent;
    navigator.clipboard.writeText(urlText)
      .then(() => {
        copyUrlBtn.classList.add('copy-animation', 'active');
        showToast('URL copied to clipboard!');
        
        setTimeout(() => {
          copyUrlBtn.classList.remove('active');
        }, 1000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        showToast('Failed to copy URL', 'error');
      });
  });
}

// Create toast container
function createToastContainer() {
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

// Show toast notification
function showToast(message, type = 'success') {
  const toastContainer = document.querySelector('.toast-container');
  
  const toastElement = document.createElement('div');
  toastElement.className = `toast align-items-center ${type === 'error' ? 'bg-danger' : 'bg-dark'} text-white border-0`;
  toastElement.setAttribute('role', 'alert');
  toastElement.setAttribute('aria-live', 'assertive');
  toastElement.setAttribute('aria-atomic', 'true');
  
  const toastContent = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastElement.innerHTML = toastContent;
  toastContainer.appendChild(toastElement);
  
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  // Remove toast from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastContainer.removeChild(toastElement);
  });
}

// Handle search
function handleSearch() {
  searchQuery = searchInput.value.trim();
  currentPage = 1; // Reset to first page
  fetchUrls();
}

// Fetch URLs from the API
async function fetchUrls() {
  try {
    // Show loading state
    urlList.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading URLs...</p>
        </td>
      </tr>
    `;
    
    // Use window.location.origin to ensure correct protocol and port
    const apiUrl = `${window.location.origin}/api/urls?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`;
    
    // Fetch data from the API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }
    
    const data = await response.json();
    
    // Update state
    urlsData = data.urls;
    totalUrls = data.total;
    totalPages = data.totalPages;
    
    // Update UI
    renderUrlList();
    renderPagination();
    updateStats();
    
  } catch (error) {
    console.error('Error fetching URLs:', error);
    
    // Show error state
    urlList.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-5 text-danger">
          <i class="icon-exclamation display-4 d-block mb-3"></i>
          <p>Failed to load URLs. Please check if the url0.txt file exists and try again.</p>
          <button class="btn btn-outline-primary mt-3" onclick="fetchUrls()">
            <i class="icon-refresh me-1"></i> Try Again
          </button>
        </td>
      </tr>
    `;
  }
}

// Render URL list
function renderUrlList() {
  if (urlsData.length === 0) {
    urlList.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-5">
          <i class="icon-magnifier display-4 d-block mb-3 text-muted"></i>
          <p>No URLs found${searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
          ${searchQuery ? `<button class="btn btn-outline-primary mt-3" onclick="clearSearch()">Clear Search</button>` : ''}
        </td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  
  urlsData.forEach((url, index) => {
    const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
    const urlInfo = parseUrl(url);
    
    html += `
      <tr class="url-item">
        <td class="py-3">${itemNumber}</td>
        <td class="py-3">
          <span class="text-truncate-custom">${url}</span>
        </td>
        <td class="py-3 text-center">
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary view-url" 
              data-url="${url}" data-index="${index}">
              <i class="icon-eye"></i>
            </button>
            <a href="${urlInfo.isValid ? url : '#'}" target="_blank" 
              class="btn btn-sm btn-outline-success ${!urlInfo.isValid ? 'disabled' : ''}" 
              ${!urlInfo.isValid ? 'aria-disabled="true"' : ''}>
              <i class="icon-action-redo"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  });
  
  urlList.innerHTML = html;
  
  // Add event listeners to view buttons
  document.querySelectorAll('.view-url').forEach(button => {
    button.addEventListener('click', () => {
      const url = button.getAttribute('data-url');
      const urlInfo = parseUrl(url);
      
      // Set modal content
      modalUrlText.textContent = url;
      modalUrlLink.href = urlInfo.isValid ? url : '#';
      modalUrlLink.classList.toggle('disabled', !urlInfo.isValid);
      modalDomain.textContent = urlInfo.domain || 'N/A';
      modalProtocol.textContent = urlInfo.protocol || 'N/A';
      
      // Show modal
      urlModal.show();
    });
  });
}

// Parse URL to extract components
function parseUrl(url) {
  try {
    // Add protocol if missing
    let urlWithProtocol = url;
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      urlWithProtocol = 'http://' + url;
    }
    
    const parsedUrl = new URL(urlWithProtocol);
    
    return {
      isValid: true,
      domain: parsedUrl.hostname,
      protocol: parsedUrl.protocol.replace(':', '')
    };
  } catch (error) {
    return {
      isValid: false,
      domain: null,
      protocol: null
    };
  }
}

// Render pagination
function renderPagination() {
  if (totalPages <= 1) {
    paginationTop.innerHTML = '';
    paginationBottom.innerHTML = '';
    return;
  }
  
  // Generate pagination HTML
  const paginationHtml = generatePaginationHtml();
  
  // Set pagination HTML
  paginationTop.innerHTML = paginationHtml;
  paginationBottom.innerHTML = paginationHtml;
  
  // Add event listeners to pagination buttons
  document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageAction = link.getAttribute('data-page');
      
      if (pageAction === 'prev') {
        if (currentPage > 1) {
          currentPage--;
          fetchUrls();
        }
      } else if (pageAction === 'next') {
        if (currentPage < totalPages) {
          currentPage++;
          fetchUrls();
        }
      } else {
        const page = parseInt(pageAction);
        if (page !== currentPage) {
          currentPage = page;
          fetchUrls();
        }
      }
      
      // Scroll to top of the table on mobile
      if (window.innerWidth < 768) {
        const tableTop = document.querySelector('.table-responsive').offsetTop;
        window.scrollTo({ top: tableTop - 20, behavior: 'smooth' });
      }
    });
  });
}

// Generate pagination HTML
function generatePaginationHtml() {
  let html = '';
  
  // Previous button
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="prev" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;
  
  // Page numbers
  const displayedPages = getDisplayedPages();
  
  displayedPages.forEach(page => {
    if (page === '...') {
      html += `
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>
      `;
    } else {
      html += `
        <li class="page-item ${page === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${page}">${page}</a>
        </li>
      `;
    }
  });
  
  // Next button
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="next" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;
  
  return html;
}

// Get displayed pages for pagination
function getDisplayedPages() {
  const maxDisplayedPages = 5;
  const pages = [];
  
  if (totalPages <= maxDisplayedPages) {
    // Display all pages if total pages is less than max displayed pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always include the first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Pages around the current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always include the last page
    pages.push(totalPages);
  }
  
  return pages;
}

// Update statistics
function updateStats() {
  totalUrlsElement.textContent = totalUrls.toLocaleString();
  totalPagesElement.textContent = totalPages.toLocaleString();
  footerTotalElement.textContent = totalUrls.toLocaleString();
  
  // Calculate current page range
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalUrls);
  
  if (totalUrls === 0) {
    currentPageRangeElement.textContent = '0-0';
  } else {
    currentPageRangeElement.textContent = `${start.toLocaleString()}-${end.toLocaleString()}`;
  }
}

// Clear search
function clearSearch() {
  searchInput.value = '';
  searchQuery = '';
  currentPage = 1;
  fetchUrls();
}

// Handle window resize
window.addEventListener('resize', () => {
  // Re-render URL list on window resize for responsive adjustments
  if (urlsData.length > 0) {
    renderUrlList();
  }
});