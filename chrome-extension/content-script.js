/**
 * LeadGen Chrome Extension - Content Script
 * Runs on LinkedIn profile and company pages
 * Extracts data from DOM and sends to background script
 */

(function() {
  'use strict';

  // Check if we're on a profile or company page
  const currentUrl = window.location.href;
  const isProfile = currentUrl.includes('/in/');
  const isCompany = currentUrl.includes('/company/');

  console.log('[LeadGen] Content script loaded on:', currentUrl);

  /**
   * Extract data from LinkedIn profile page
   */
  function extractProfileData() {
    try {
      // Wait for page to load
      if (!document.querySelector('.pv-top-card')) {
        console.log('[LeadGen] Profile page not fully loaded yet');
        return null;
      }

      const data = {
        type: 'profile',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Name - multiple selectors for different LinkedIn layouts
      const nameSelectors = [
        'h1.text-heading-xlarge',
        '.pv-top-card--list li:first-child',
        '.pv-text-details__left-panel h1',
        '[data-generated-suggestion-target]',
      ];

      for (const selector of nameSelectors) {
        const nameElem = document.querySelector(selector);
        if (nameElem && nameElem.textContent.trim()) {
          const fullName = nameElem.textContent.trim();
          const nameParts = fullName.split(' ');
          data.firstName = nameParts[0] || '';
          data.lastName = nameParts.slice(1).join(' ') || '';
          data.fullName = fullName;
          break;
        }
      }

      // Job Title / Headline
      const titleSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.pv-top-card--list-bullet li:first-child',
        'div.text-body-medium:not(.break-words)',
      ];

      for (const selector of titleSelectors) {
        const titleElem = document.querySelector(selector);
        if (titleElem && titleElem.textContent.trim()) {
          data.title = titleElem.textContent.trim();
          break;
        }
      }

      // Location
      const locationSelectors = [
        '.text-body-small.inline.t-black--light.break-words',
        '.pv-top-card--list-bullet li:nth-child(2)',
        '.pv-text-details__left-panel .text-body-small',
      ];

      for (const selector of locationSelectors) {
        const locationElem = document.querySelector(selector);
        if (locationElem && locationElem.textContent.trim()) {
          data.location = locationElem.textContent.trim();
          break;
        }
      }

      // Current Company - from headline or experience section
      const companyFromHeadline = data.title?.match(/at (.+)$/);
      if (companyFromHeadline) {
        data.company = companyFromHeadline[1].trim();
      }

      // About section
      const aboutSelectors = [
        '#about + * .inline-show-more-text',
        '.pv-about-section .pv-about__summary-text',
        'section[data-section="summary"] .pv-shared-text-with-see-more',
      ];

      for (const selector of aboutSelectors) {
        const aboutElem = document.querySelector(selector);
        if (aboutElem && aboutElem.textContent.trim()) {
          data.about = aboutElem.textContent.trim();
          break;
        }
      }

      // Experience section - get first/current job
      const experienceItems = document.querySelectorAll('li[data-view-name="profile-component-entity"]');
      if (experienceItems.length > 0) {
        const firstExp = experienceItems[0];
        
        const expTitle = firstExp.querySelector('.mr1.t-bold span[aria-hidden="true"]');
        const expCompany = firstExp.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        
        if (expTitle) data.currentTitle = expTitle.textContent.trim();
        if (expCompany) data.currentCompany = expCompany.textContent.trim();
        
        // Override company if we found it
        if (data.currentCompany && !data.company) {
          data.company = data.currentCompany;
        }
      }

      // Contact info (if visible)
      const emailLink = document.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        data.email = emailLink.textContent.trim();
      }

      // LinkedIn URL
      data.linkedinUrl = window.location.href.split('?')[0];

      // Profile picture
      const profilePic = document.querySelector('.pv-top-card__photo, img.pv-top-card-profile-picture__image');
      if (profilePic) {
        data.profilePicture = profilePic.src;
      }

      console.log('[LeadGen] Extracted profile data:', data);
      return data;

    } catch (error) {
      console.error('[LeadGen] Error extracting profile data:', error);
      return null;
    }
  }

  /**
   * Extract data from LinkedIn company page
   */
  function extractCompanyData() {
    try {
      // Wait for page to load
      if (!document.querySelector('.org-top-card')) {
        console.log('[LeadGen] Company page not fully loaded yet');
        return null;
      }

      const data = {
        type: 'company',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Company Name
      const nameSelectors = [
        'h1.org-top-card-summary__title',
        '.org-top-card-summary__info-item h1',
        'h1[data-test-org-name]',
      ];

      for (const selector of nameSelectors) {
        const nameElem = document.querySelector(selector);
        if (nameElem && nameElem.textContent.trim()) {
          data.name = nameElem.textContent.trim();
          break;
        }
      }

      // Industry
      const industrySelectors = [
        '.org-top-card-summary__industry',
        '.org-page-details__definition-text',
      ];

      for (const selector of industrySelectors) {
        const industryElem = document.querySelector(selector);
        if (industryElem && industryElem.textContent.trim()) {
          data.industry = industryElem.textContent.trim();
          break;
        }
      }

      // Company Size
      const sizeSelectors = [
        '.org-top-card-summary__info-item:has(.org-top-card-summary-info-list__info-item-icon)',
        '.org-about-company-module__company-size-definition',
      ];

      for (const selector of sizeSelectors) {
        const sizeElem = document.querySelector(selector);
        if (sizeElem && sizeElem.textContent.trim()) {
          const sizeText = sizeElem.textContent.trim();
          // Extract number range (e.g., "51-200 employees" -> "51-200")
          const sizeMatch = sizeText.match(/(\d+-\d+|\d+\+)/);
          if (sizeMatch) {
            data.size = sizeMatch[1];
          }
          break;
        }
      }

      // Location/Headquarters
      const locationSelectors = [
        '.org-top-card-summary__headquarter',
        '.org-about-company-module__headquarters',
      ];

      for (const selector of locationSelectors) {
        const locationElem = document.querySelector(selector);
        if (locationElem && locationElem.textContent.trim()) {
          data.location = locationElem.textContent.trim();
          break;
        }
      }

      // About/Description
      const descriptionSelectors = [
        '.org-about-us-organization-description__text',
        '.org-top-card-summary__tagline',
        'p[data-test-about-description]',
      ];

      for (const selector of descriptionSelectors) {
        const descElem = document.querySelector(selector);
        if (descElem && descElem.textContent.trim()) {
          data.description = descElem.textContent.trim();
          break;
        }
      }

      // Website
      const websiteLink = document.querySelector('a[data-test-org-website-link], a.org-about-us-company-module__website');
      if (websiteLink) {
        data.website = websiteLink.href;
      }

      // LinkedIn URL
      data.linkedinUrl = window.location.href.split('?')[0];

      // Logo
      const logo = document.querySelector('.org-top-card-primary-content__logo, img[data-test-org-logo]');
      if (logo) {
        data.logo = logo.src;
      }

      console.log('[LeadGen] Extracted company data:', data);
      return data;

    } catch (error) {
      console.error('[LeadGen] Error extracting company data:', error);
      return null;
    }
  }

  /**
   * Send data to background script
   */
  function sendDataToBackground(data) {
    if (!data) {
      console.log('[LeadGen] No data to send');
      return;
    }

    chrome.runtime.sendMessage({
      action: 'saveData',
      data: data
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[LeadGen] Error sending message:', chrome.runtime.lastError);
        return;
      }
      
      if (response && response.success) {
        console.log('[LeadGen] Data sent successfully:', response);
        showNotification('✓ Data captured successfully!', 'success');
      } else {
        console.error('[LeadGen] Failed to save data:', response);
        showNotification('✗ Failed to capture data', 'error');
      }
    });
  }

  /**
   * Show notification on page
   */
  function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('leadgen-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.id = 'leadgen-notification';
    notification.textContent = message;
    
    // Styles
    const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Listen for messages from popup/background
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[LeadGen] Received message:', message);

    if (message.action === 'captureData') {
      let data = null;
      
      if (isProfile) {
        data = extractProfileData();
      } else if (isCompany) {
        data = extractCompanyData();
      }

      if (data) {
        sendDataToBackground(data);
        sendResponse({ success: true, data: data });
      } else {
        sendResponse({ success: false, error: 'Failed to extract data' });
      }
      
      return true; // Keep channel open for async response
    }

    if (message.action === 'getPageType') {
      sendResponse({ 
        isProfile, 
        isCompany,
        url: window.location.href
      });
      return true;
    }
  });

  // Auto-capture on page load if enabled
  chrome.storage.sync.get(['autoCapture'], (result) => {
    if (result.autoCapture === true) {
      console.log('[LeadGen] Auto-capture enabled, extracting data...');
      
      // Wait a bit for page to fully load
      setTimeout(() => {
        let data = null;
        if (isProfile) {
          data = extractProfileData();
        } else if (isCompany) {
          data = extractCompanyData();
        }
        
        if (data) {
          sendDataToBackground(data);
        }
      }, 2000);
    }
  });

  console.log('[LeadGen] Content script initialized');
})();
