// Popup script for LinkedIn Scraper Extension

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Setup tab switching
  setupTabs();
  
  // Load settings
  await loadSettings();
  
  // Load stats and history
  await loadStatsAndHistory();
  
  // Check current page status
  await checkCurrentPage();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Setup tab switching
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // Reload history when history tab is clicked
      if (tabName === 'history') {
        loadStatsAndHistory();
      }
    });
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Capture button
  document.getElementById('capture-btn').addEventListener('click', handleCapture);
  
  // Save settings button
  document.getElementById('save-settings-btn').addEventListener('click', handleSaveSettings);
  
  // Open dashboard button
  document.getElementById('open-dashboard-btn').addEventListener('click', () => {
    chrome.storage.sync.get(['apiUrl'], (settings) => {
      const dashboardUrl = settings.apiUrl || 'http://localhost:3000';
      chrome.tabs.create({ url: dashboardUrl });
    });
  });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey', 'apiUrl', 'autoCapture'], (settings) => {
      document.getElementById('api-key').value = settings.apiKey || '';
      document.getElementById('api-url').value = settings.apiUrl || '';
      document.getElementById('auto-capture').checked = settings.autoCapture || false;
      resolve();
    });
  });
}

/**
 * Handle save settings
 */
async function handleSaveSettings() {
  const btn = document.getElementById('save-settings-btn');
  const originalText = btn.textContent;
  
  // Get form values
  const apiKey = document.getElementById('api-key').value.trim();
  const apiUrl = document.getElementById('api-url').value.trim();
  const autoCapture = document.getElementById('auto-capture').checked;
  
  // Validate API key
  if (!apiKey) {
    showAlert('error', 'API key is required');
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  
  try {
    // Save to storage
    await chrome.storage.sync.set({
      apiKey,
      apiUrl,
      autoCapture
    });
    
    // Show success message
    showAlert('success', 'Settings saved successfully!');
    
    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showAlert('error', 'Failed to save settings');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/**
 * Check current page status
 */
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      updatePageStatus(false, 'Unable to detect current page');
      return;
    }
    
    const url = tab.url;
    
    if (!url.includes('linkedin.com')) {
      updatePageStatus(false, 'Not on LinkedIn. Navigate to a LinkedIn profile or company page.');
      return;
    }
    
    // Check if it's a profile or company page
    if (url.includes('linkedin.com/in/')) {
      updatePageStatus(true, 'LinkedIn Profile - Ready to capture');
    } else if (url.includes('linkedin.com/company/')) {
      updatePageStatus(true, 'LinkedIn Company - Ready to capture');
    } else {
      updatePageStatus(false, 'Not on a LinkedIn profile or company page');
    }
    
  } catch (error) {
    console.error('Error checking current page:', error);
    updatePageStatus(false, 'Error detecting page');
  }
}

/**
 * Update page status UI
 */
function updatePageStatus(isActive, text) {
  const indicator = document.getElementById('page-status-indicator');
  const statusText = document.getElementById('page-status-text');
  const captureBtn = document.getElementById('capture-btn');
  
  if (isActive) {
    indicator.classList.remove('inactive');
    indicator.classList.add('active');
    captureBtn.disabled = false;
  } else {
    indicator.classList.remove('active');
    indicator.classList.add('inactive');
    captureBtn.disabled = true;
  }
  
  statusText.textContent = text;
}

/**
 * Handle capture action
 */
async function handleCapture() {
  const btn = document.getElementById('capture-btn');
  const btnText = document.getElementById('capture-btn-text');
  const originalText = btnText.textContent;
  
  // Show loading state
  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> Capturing...';
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'captureData' });
    
    if (response && response.success) {
      showAlert('success', 'Data captured and sent to your dashboard!');
      // Reload history
      await loadStatsAndHistory();
    } else {
      throw new Error(response?.error || 'Failed to capture data');
    }
    
  } catch (error) {
    console.error('Error capturing data:', error);
    showAlert('error', error.message || 'Failed to capture data. Make sure you have configured your API key.');
  } finally {
    // Reset button
    btnText.textContent = originalText;
    btn.disabled = false;
  }
}

/**
 * Load stats and history
 */
async function loadStatsAndHistory() {
  try {
    // Load stats
    const statsData = await chrome.storage.local.get('stats');
    const stats = statsData.stats || { totalCaptures: 0, profileCaptures: 0, companyCaptures: 0 };
    
    document.getElementById('total-captures').textContent = stats.totalCaptures || 0;
    document.getElementById('profile-captures').textContent = stats.profileCaptures || 0;
    
    // Load history
    const historyData = await chrome.storage.local.get('captureHistory');
    const history = historyData.captureHistory || [];
    
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No captures yet</div>
        </div>
      `;
    } else {
      historyList.innerHTML = history.map(item => `
        <div class="history-item">
          <div class="history-item-header">
            <span class="history-item-name">${escapeHtml(item.name || 'Unknown')}</span>
            <span class="history-item-type">${item.type === 'profile' ? 'Profile' : 'Company'}</span>
          </div>
          <div class="history-item-details">
            ${formatDate(item.timestamp)}
          </div>
        </div>
      `).join('');
    }
    
  } catch (error) {
    console.error('Error loading stats and history:', error);
  }
}

/**
 * Show alert message
 */
function showAlert(type, message) {
  const container = document.getElementById('alert-container');
  const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
  
  container.innerHTML = `
    <div class="alert ${alertClass}">
      ${escapeHtml(message)}
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

/**
 * Format date
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Default format
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for tab updates to refresh page status
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkCurrentPage();
  }
});

// Listen for tab activation to refresh page status
chrome.tabs.onActivated.addListener(() => {
  checkCurrentPage();
});
