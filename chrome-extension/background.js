// Background Service Worker for LinkedIn Scraper Extension
// Handles communication between content scripts and backend API

// Extension configuration
const API_CONFIG = {
  // Development
  dev: 'http://localhost:3000',
  // Production - update with your deployed URL
  prod: 'https://your-app.vercel.app'
};

// Get the current environment (checks if localhost is reachable)
let API_BASE_URL = API_CONFIG.prod;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToBackend') {
    // Handle async API call
    handleDataSubmission(message.data, message.type)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate async response
    return true;
  }
  
  if (message.action === 'getSettings') {
    // Return current settings
    chrome.storage.sync.get(['apiKey', 'apiUrl', 'autoCapture'], (settings) => {
      sendResponse({ success: true, settings });
    });
    return true;
  }
  
  if (message.action === 'saveSettings') {
    // Save settings
    chrome.storage.sync.set(message.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

/**
 * Handle data submission to backend API
 * @param {Object} data - The scraped data from LinkedIn
 * @param {String} type - 'profile' or 'company'
 * @returns {Promise<Object>} - API response
 */
async function handleDataSubmission(data, type) {
  try {
    // Get API key from storage
    const settings = await chrome.storage.sync.get(['apiKey', 'apiUrl']);
    const apiKey = settings.apiKey;
    const customApiUrl = settings.apiUrl;
    
    if (!apiKey) {
      throw new Error('API key not configured. Please set your API key in the extension popup.');
    }
    
    // Use custom API URL if provided
    const baseUrl = customApiUrl || API_BASE_URL;
    const endpoint = type === 'profile' 
      ? `${baseUrl}/api/extension/profile`
      : `${baseUrl}/api/extension/company`;
    
    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update storage with last capture info
    await updateCaptureHistory(type, data, result);
    
    return result;
    
  } catch (error) {
    console.error('Error submitting data to backend:', error);
    throw error;
  }
}

/**
 * Update capture history in storage
 */
async function updateCaptureHistory(type, data, result) {
  try {
    const history = await chrome.storage.local.get('captureHistory') || { captureHistory: [] };
    const captureRecord = {
      type,
      timestamp: new Date().toISOString(),
      name: type === 'profile' ? data.name : data.company,
      url: data.url,
      success: true,
      id: result.id || result._id
    };
    
    // Keep last 50 captures
    const updatedHistory = [captureRecord, ...(history.captureHistory || [])].slice(0, 50);
    
    await chrome.storage.local.set({ captureHistory: updatedHistory });
    
    // Update stats
    const stats = await chrome.storage.local.get('stats') || { stats: { totalCaptures: 0, profileCaptures: 0, companyCaptures: 0 } };
    stats.stats = stats.stats || { totalCaptures: 0, profileCaptures: 0, companyCaptures: 0 };
    stats.stats.totalCaptures = (stats.stats.totalCaptures || 0) + 1;
    
    if (type === 'profile') {
      stats.stats.profileCaptures = (stats.stats.profileCaptures || 0) + 1;
    } else {
      stats.stats.companyCaptures = (stats.stats.companyCaptures || 0) + 1;
    }
    
    await chrome.storage.local.set(stats);
    
  } catch (error) {
    console.error('Error updating capture history:', error);
  }
}

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      autoCapture: false,
      apiUrl: ''
    });
    
    // Initialize stats
    chrome.storage.local.set({
      stats: {
        totalCaptures: 0,
        profileCaptures: 0,
        companyCaptures: 0
      },
      captureHistory: []
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'chrome-extension://' + chrome.runtime.id + '/welcome.html'
    });
  }
});

/**
 * Handle extension icon click - send message to content script
 */
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on a LinkedIn page
  if (tab.url && tab.url.includes('linkedin.com')) {
    try {
      // Inject content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
      
      // Send capture message
      chrome.tabs.sendMessage(tab.id, { action: 'captureData' });
    } catch (error) {
      console.error('Error triggering capture:', error);
    }
  }
});

/**
 * Handle keyboard shortcuts
 */
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture-data') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureData' });
      }
    });
  }
});

/**
 * Context menu for capturing data
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'captureLinkedInData',
    title: 'Capture LinkedIn Data',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.linkedin.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'captureLinkedInData') {
    chrome.tabs.sendMessage(tab.id, { action: 'captureData' });
  }
});

// Test API connectivity on startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    // Try localhost first
    const localResponse = await fetch(`${API_CONFIG.dev}/api/health`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(2000)
    }).catch(() => null);
    
    if (localResponse && localResponse.ok) {
      API_BASE_URL = API_CONFIG.dev;
      console.log('Connected to local development server');
    } else {
      API_BASE_URL = API_CONFIG.prod;
      console.log('Using production server');
    }
  } catch (error) {
    API_BASE_URL = API_CONFIG.prod;
  }
});
