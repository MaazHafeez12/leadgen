# Chrome Extension Quick Start Guide

Get up and running with the LinkedIn Scraper Chrome Extension in 5 minutes.

## 🚀 Quick Installation

### 1. Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `chrome-extension/` folder
5. Pin the extension to your toolbar (puzzle icon → pin)

### 2. Configure API Key

1. Click the extension icon
2. Go to **Settings** tab
3. Enter API Key: `dev-key-12345` (for development)
4. Set API URL: `http://localhost:3000` (or your deployed URL)
5. Click **Save Settings**

### 3. Start Your Server

```bash
cd my-leads-app
npm run dev
```

### 4. Capture Your First Profile

1. Go to any LinkedIn profile: `https://www.linkedin.com/in/[username]`
2. Click the extension icon
3. Click **"Capture Data"**
4. Check your dashboard at `http://localhost:3000`

## ✅ Verification

- ✅ Extension icon shows green on LinkedIn pages
- ✅ Popup displays "Ready to capture"
- ✅ Success notification appears after capture
- ✅ Data appears in your dashboard

## 📖 Usage Methods

### Method 1: Extension Icon
- Click extension icon → Click "Capture Data"

### Method 2: Keyboard Shortcut
- `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)

### Method 3: Right-Click
- Right-click on page → "Capture LinkedIn Data"

### Method 4: Auto-Capture
- Enable in Settings → Automatically captures on page load

## 🎯 What Gets Captured

### LinkedIn Profiles
- Name, title, location, company
- About section
- Experience/work history
- Email (if visible)

### LinkedIn Companies
- Company name, industry, size
- Location, description
- Website URL
- Logo

## 🔧 Common Issues

### "API key required"
→ Go to Settings and enter your API key

### "Not on LinkedIn"
→ Make sure you're on `/in/[username]` or `/company/[name]` pages

### "Failed to connect"
→ Check that your dev server is running (`npm run dev`)

### Data not in dashboard
→ Refresh dashboard and look for "linkedin-scrape" tag

## ⚠️ Important Notes

### Legal Considerations
- This extension may violate LinkedIn's Terms of Service
- Use for personal/educational purposes only
- Don't scrape data at scale
- Respect privacy and data protection laws

### Best Practices
- Use sparingly (not hundreds of profiles)
- Don't enable auto-capture for bulk scraping
- Only capture data you need
- Store data securely

## 📚 Full Documentation

For complete documentation, see [README.md](./README.md)

## 🔗 Endpoints Used

- `POST /api/extension/profile` - Save profile data
- `POST /api/extension/company` - Save company data
- `GET /api/health` - Check API connectivity

## 🛠️ Development

### Environment Setup

```env
# .env.local
EXTENSION_API_KEY=dev-key-12345
MONGODB_URI=your-mongodb-connection-string
```

### Testing

1. Load extension in Chrome
2. Configure with dev API key
3. Start dev server (`npm run dev`)
4. Visit LinkedIn profile
5. Capture data and verify in dashboard

## 🎨 Extension Features

- ✅ One-click data capture
- ✅ Automatic page detection
- ✅ Smart duplicate handling
- ✅ Visual feedback notifications
- ✅ Capture history tracking
- ✅ Keyboard shortcuts
- ✅ Context menu integration

## 📦 Files

```
chrome-extension/
├── manifest.json       # Extension config
├── background.js       # Service worker
├── content-script.js   # DOM extraction
├── popup.html          # UI interface
├── popup.js            # UI logic
└── README.md           # Full docs
```

## 🆘 Need Help?

1. Check [Troubleshooting](./README.md#troubleshooting) section
2. Review browser console (F12)
3. Check server logs
4. Verify API endpoint at `http://localhost:3000/api/health`

---

**Quick Links:**
- [Full Documentation](./README.md)
- [API Endpoints](./README.md#api-endpoints)
- [Troubleshooting](./README.md#troubleshooting)
- [Legal Considerations](./README.md#legal--ethical-considerations)
