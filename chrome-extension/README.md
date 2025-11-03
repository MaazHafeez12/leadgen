# LinkedIn Scraper Chrome Extension

A powerful Chrome Extension for capturing LinkedIn profile and company data directly from your browser.

## 🌟 Features

- **One-Click Capture**: Extract profile and company data with a single click
- **Automatic Detection**: Automatically detects LinkedIn profile and company pages
- **Rich Data Extraction**: Captures comprehensive information including:
  - **Profiles**: Name, title, location, company, experience, about section
  - **Companies**: Name, industry, size, location, description, website
- **Smart Sync**: Automatically creates or updates contacts/companies in your LeadGen dashboard
- **Visual Feedback**: In-page notifications for successful captures
- **Capture History**: Track all your captures with detailed history
- **Flexible Settings**: Configure API key, custom API URL, and auto-capture options

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features in Detail](#features-in-detail)
- [API Endpoints](#api-endpoints)
- [Legal & Ethical Considerations](#legal--ethical-considerations)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## 🚀 Installation

### Step 1: Load Extension in Chrome

1. **Clone or Download** the repository containing the extension files
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"**
5. **Select the folder** `chrome-extension/` from your project directory

The extension should now appear in your Chrome extensions list.

### Step 2: Pin the Extension

1. Click the **puzzle icon** in Chrome toolbar
2. Find **LinkedIn Scraper** extension
3. Click the **pin icon** to keep it visible in toolbar

## ⚙️ Configuration

### Getting Your API Key

1. **Open your LeadGen dashboard** (http://localhost:3000 or your deployed URL)
2. **Navigate to Settings** or API section
3. **Generate an API key** (or use the default dev key: `dev-key-12345`)
4. **Copy the API key**

### Setting Up the Extension

1. **Click the extension icon** in Chrome toolbar
2. **Go to Settings tab**
3. **Enter your API Key** in the API Key field
4. **(Optional) Enter Custom API URL** if using a deployed version
   - Development: `http://localhost:3000`
   - Production: `https://your-app.vercel.app`
5. **Toggle Auto-capture** if you want automatic data capture on page load
6. **Click Save Settings**

## 📖 Usage

### Method 1: Extension Popup

1. **Navigate to a LinkedIn page**:
   - Profile: `https://www.linkedin.com/in/[username]`
   - Company: `https://www.linkedin.com/company/[company-name]`

2. **Click the extension icon** in Chrome toolbar

3. **View page status** in the Capture tab:
   - Green indicator: Ready to capture
   - Red indicator: Not on a valid LinkedIn page

4. **Click "Capture Data"** button

5. **Wait for confirmation**:
   - Success notification appears on page
   - Data is saved to your dashboard

### Method 2: Keyboard Shortcut

1. Navigate to a LinkedIn profile or company page
2. Press `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)
3. Data is automatically captured and saved

### Method 3: Right-Click Menu

1. Navigate to a LinkedIn profile or company page
2. Right-click anywhere on the page
3. Select "Capture LinkedIn Data"
4. Data is automatically captured and saved

### Method 4: Auto-Capture

1. Enable "Auto-capture on page load" in Settings
2. Navigate to any LinkedIn profile or company page
3. Data is automatically captured and saved when page loads

## 🔍 Features in Detail

### Profile Data Extraction

The extension captures the following profile information:

- **Name**: Full name with first/last name parsing
- **Title**: Current job title
- **Location**: City, state/country
- **Company**: Current employer
- **About**: Profile summary/bio
- **Experience**: Work history with positions
- **Email**: If available on the page
- **LinkedIn URL**: Direct link to profile

### Company Data Extraction

The extension captures the following company information:

- **Company Name**: Official company name
- **Industry**: Business sector/category
- **Company Size**: Employee count range (e.g., "51-200 employees")
- **Location**: Headquarters location
- **Description**: Company overview
- **Website**: Company website URL
- **Logo**: Company logo image URL
- **LinkedIn URL**: Direct link to company page

### Smart Duplicate Handling

The extension intelligently handles duplicates:

- **Profile Detection**: Checks by LinkedIn URL or email
- **Company Detection**: Checks by company name or LinkedIn URL
- **Update Behavior**: Updates existing records instead of creating duplicates
- **Merge Strategy**: Preserves existing data while updating with new information

### Capture History

Track all your captures in the History tab:

- **Recent Captures**: View last 50 captures
- **Statistics**: Total captures, profiles, and companies
- **Timestamps**: Relative time display (e.g., "5 minutes ago")
- **Quick Access**: Click to view details

## 🔌 API Endpoints

### Profile Endpoint

**POST** `/api/extension/profile`

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "about": "Passionate software engineer...",
  "email": "john@example.com",
  "url": "https://www.linkedin.com/in/johndoe",
  "experience": [
    {
      "title": "Senior Engineer",
      "company": "Tech Corp",
      "duration": "2020 - Present"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "id": "60d5ec49f1b2c72b8c8e4f3a",
  "contact": { ... },
  "isNew": true
}
```

### Company Endpoint

**POST** `/api/extension/company`

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "company": "Tech Corp",
  "industry": "Technology",
  "size": "51-200 employees",
  "location": "San Francisco, CA",
  "description": "Leading technology company...",
  "website": "https://techcorp.com",
  "url": "https://www.linkedin.com/company/techcorp",
  "logo": "https://logo-url.com/logo.png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company created successfully",
  "id": "60d5ec49f1b2c72b8c8e4f3b",
  "company": { ... },
  "isNew": true
}
```

### Health Check Endpoint

**GET/HEAD** `/api/health`

Check if the API is running (used for connectivity test).

## ⚖️ Legal & Ethical Considerations

### LinkedIn Terms of Service

**IMPORTANT**: Using this extension may violate LinkedIn's Terms of Service, which prohibit:

1. **Automated Data Collection**: Scraping, crawling, or automated extraction of data
2. **Unauthorized Access**: Using extensions or tools not approved by LinkedIn
3. **Bulk Data Extraction**: Collecting data at scale without permission

### Recommended Best Practices

1. **Use Sparingly**: Only capture data you genuinely need
2. **Respect Privacy**: Don't capture or store sensitive personal information
3. **Manual Use Only**: Don't use the auto-capture feature aggressively
4. **Rate Limiting**: Don't capture hundreds of profiles in short time
5. **Permission**: Ideally, have consent from the person whose data you're capturing
6. **Compliance**: Ensure compliance with GDPR, CCPA, and other privacy laws

### Data Protection & Privacy

- **Store Securely**: All captured data should be stored securely in your database
- **Access Control**: Implement proper authentication and authorization
- **Data Retention**: Define and follow data retention policies
- **Right to Deletion**: Honor requests to delete personal data
- **Transparency**: Be transparent about how you use collected data

### Alternative Approaches

Consider these LinkedIn-approved alternatives:

1. **LinkedIn Sales Navigator**: Official tool for sales prospecting
2. **LinkedIn Recruiter**: Official tool for recruiting
3. **LinkedIn API**: Official API with proper authentication
4. **Manual Data Entry**: Most compliant but time-consuming

### Disclaimer

This extension is provided for educational and personal productivity purposes only. Users are solely responsible for ensuring their use complies with:

- LinkedIn's Terms of Service
- Applicable laws and regulations
- Privacy and data protection requirements

The developers assume no liability for misuse of this extension.

## 🐛 Troubleshooting

### Extension Not Capturing Data

**Problem**: Clicking "Capture Data" doesn't work

**Solutions**:
1. Verify you're on a LinkedIn profile or company page
2. Check that API key is configured in Settings
3. Refresh the LinkedIn page and try again
4. Check browser console for errors (F12 → Console tab)
5. Ensure you're connected to the internet

### "API key required" Error

**Problem**: Getting 401 authentication error

**Solutions**:
1. Open extension popup → Settings tab
2. Verify API key is entered correctly
3. Get a new API key from your dashboard if needed
4. Click "Save Settings" after entering API key

### "Failed to connect to backend" Error

**Problem**: Cannot reach your API server

**Solutions**:
1. Verify your API server is running (`npm run dev`)
2. Check API URL in Settings (should match your server)
3. For local development, use `http://localhost:3000`
4. For production, use your deployed URL (e.g., `https://your-app.vercel.app`)
5. Check if port 3000 is not blocked by firewall

### Data Not Appearing in Dashboard

**Problem**: Data captured but not showing in dashboard

**Solutions**:
1. Refresh your dashboard
2. Check the Contacts or Companies section
3. Look for newly created items with "linkedin-scrape" tag
4. Verify database connection in `/api/health` endpoint
5. Check server logs for errors

### Extension Not Detecting LinkedIn Page

**Problem**: Status shows "Not on LinkedIn" even when on LinkedIn

**Solutions**:
1. Ensure URL is exactly:
   - Profile: `https://www.linkedin.com/in/[username]`
   - Company: `https://www.linkedin.com/company/[company-name]`
2. Avoid LinkedIn feed or search pages
3. Reload the extension (chrome://extensions/ → click reload)
4. Try disabling and re-enabling the extension

### Selectors Not Working

**Problem**: Extension cannot find profile/company data

**Possible Causes**:
- LinkedIn changed their HTML structure (happens periodically)
- Using LinkedIn in a different language
- Profile has privacy settings that hide information

**Solutions**:
1. Update the extension to the latest version
2. Check if the same data is visible when logged in
3. Try a different profile/company to test
4. Report the issue with specific URL and browser console errors

### Performance Issues

**Problem**: Extension is slow or freezing

**Solutions**:
1. Disable auto-capture feature
2. Close unnecessary browser tabs
3. Clear extension storage:
   - Go to chrome://extensions/
   - Find LinkedIn Scraper
   - Click "Details"
   - Click "Clear storage"
4. Restart Chrome

## 🛠️ Development

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for API communication
├── content-script.js      # DOM extraction and data capture
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic and event handling
└── icons/                 # Extension icons (16x16, 48x48, 128x128)
```

### Key Components

**manifest.json**
- Defines extension metadata and permissions
- Configures content scripts and background service worker
- Sets up host permissions for LinkedIn and API

**content-script.js**
- Runs on LinkedIn pages
- Extracts data from DOM using CSS selectors
- Sends data to background script
- Shows in-page notifications

**background.js**
- Service worker for Manifest V3
- Handles messages from content script
- Makes API calls to backend
- Manages extension state and storage

**popup.html/popup.js**
- Extension popup interface
- Settings configuration
- Capture history display
- Statistics and status indicators

### Testing Locally

1. **Start your development server**:
   ```bash
   cd my-leads-app
   npm run dev
   ```

2. **Load the extension** (see Installation section)

3. **Open extension popup** and configure Settings:
   - API Key: `dev-key-12345`
   - API URL: `http://localhost:3000`

4. **Navigate to a LinkedIn profile** (e.g., your own profile)

5. **Click "Capture Data"** and verify:
   - Success notification appears
   - Data appears in dashboard at http://localhost:3000
   - No console errors

### Debugging

**Content Script:**
- Open LinkedIn page → F12 → Console tab
- Look for messages starting with "LinkedIn Scraper:"

**Background Script:**
- Go to chrome://extensions/
- Find LinkedIn Scraper → Click "Details"
- Click "Inspect views: service worker"
- Check console for background script logs

**Popup Script:**
- Right-click extension icon → Inspect popup
- Check console for popup-related errors

### Building for Production

1. **Update API Configuration**:
   - Open `background.js`
   - Update `API_CONFIG.prod` with your production URL

2. **Update Manifest**:
   - Open `manifest.json`
   - Update `host_permissions` to include your production domain
   - Update version number

3. **Test thoroughly** with production API

4. **Create ZIP file** for distribution:
   ```bash
   cd chrome-extension
   zip -r linkedin-scraper.zip . -x "*.git*" "*.DS_Store"
   ```

### Publishing to Chrome Web Store

**Note**: Publishing extensions that scrape LinkedIn may violate Chrome Web Store policies. This extension is intended for personal/internal use only.

If you still wish to publish:

1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devcenter)
2. Pay one-time $5 registration fee
3. Prepare store assets (screenshots, descriptions, icons)
4. Upload ZIP file
5. Fill in store listing details
6. Submit for review

## 📝 Environment Variables

Add these to your `.env.local` file:

```env
# Extension API Key (for development)
EXTENSION_API_KEY=dev-key-12345

# MongoDB Connection (required)
MONGODB_URI=mongodb+srv://...

# Next.js (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided as-is for educational and personal use. See [Legal & Ethical Considerations](#legal--ethical-considerations) for important usage restrictions.

## 🆘 Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Check server logs for backend issues
4. Open an issue on GitHub with details

## 🔮 Future Enhancements

Potential improvements:

- [ ] Bulk capture for search results
- [ ] Export to CSV functionality
- [ ] Custom field mapping
- [ ] Integration with CRM systems
- [ ] Chrome sync for settings across devices
- [ ] Advanced filtering and search in history
- [ ] Scheduled auto-capture with rate limiting
- [ ] Multi-language support

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Made with ❤️ for LeadGen**
