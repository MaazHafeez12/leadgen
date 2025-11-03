# 🕷️ Web Scraping Module - Quick Start

Enrich your leads by scraping public company data!

---

## ⚡ Quick Setup (Already Installed!)

Dependencies are already installed:
```bash
✅ playwright-core
✅ @sparticuz/chromium (for Vercel/serverless)
✅ cheerio (HTML parsing)
✅ axios (HTTP requests)
```

**No configuration needed** - just start using!

---

## 🚀 Usage

### Option 1: UI Component (Easiest)

Add the scraper to any company edit page:

```tsx
import WebScraper from '@/components/WebScraper';

<WebScraper
  companyId={company._id}
  companyWebsite={company.website}
  linkedinUrl={company.linkedinUrl}
  onDataScraped={(data) => {
    // Auto-fill form with scraped data
    console.log('Scraped:', data);
  }}
/>
```

**Features**:
- Two buttons: "Scrape Website" and "Scrape LinkedIn"
- Method selector: Cheerio (fast) or Playwright (dynamic)
- Automatic robots.txt checking
- Auto-saves to company record

### Option 2: API Direct

Scrape from anywhere in your app:

```typescript
// Scrape company website
const response = await fetch('/api/scrape/company', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://stripe.com',
    method: 'cheerio', // or 'playwright'
    checkRobots: true
  })
});

const result = await response.json();
console.log('Description:', result.data.description);
console.log('Social Links:', result.data.socialLinks);
```

---

## 🎯 When to Use Which Method

### Cheerio (Fast - Recommended Default)

**Use for**:
- Static HTML websites
- Simple company pages
- Fast bulk scraping
- Low resource usage

**Example**:
```json
{
  "method": "cheerio"
}
```

**Speed**: ~300ms per page

### Playwright (Dynamic Content)

**Use for**:
- JavaScript-heavy sites (React, Vue, Angular)
- LinkedIn pages
- Sites with dynamic loading
- When Cheerio returns empty data

**Example**:
```json
{
  "method": "playwright"
}
```

**Speed**: ~4-5 seconds per page

---

## 📊 What Gets Scraped

### Company Website
- ✅ Company description (meta tags, about sections)
- ✅ Social media links (LinkedIn, Twitter, Facebook)
- ✅ Key page headings
- ✅ Page title

### LinkedIn Company Page
- ✅ Company description
- ✅ Industry
- ✅ Company size
- ✅ Website URL
- ⚠️ **Note**: Use LinkedIn API for production

---

## 🔥 Common Use Cases

### 1. Enrich Companies Without Descriptions

```typescript
const companies = await Company.find({
  website: { $exists: true },
  description: { $exists: false }
});

for (const company of companies) {
  const response = await fetch('/api/scrape/company', {
    method: 'POST',
    body: JSON.stringify({ url: company.website })
  });
  
  const result = await response.json();
  if (result.success) {
    await Company.findByIdAndUpdate(company._id, {
      description: result.data.description
    });
  }
  
  // Rate limiting - wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));
}
```

### 2. Find Social Media Links

```typescript
await fetch('/api/scrape/company', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://company.com' })
});

// Returns:
{
  socialLinks: {
    linkedin: "https://linkedin.com/company/...",
    twitter: "https://twitter.com/...",
    facebook: "https://facebook.com/..."
  }
}
```

### 3. Custom Data Extraction

```typescript
await fetch('/api/scrape/generic', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://example.com/about',
    selectors: [
      'h1.company-name',
      '.mission-statement',
      '#team-size'
    ]
  })
});
```

---

## ⚠️ Important Guidelines

### Legal & Ethical

**Always**:
- ✅ Respect robots.txt (automatic in our module)
- ✅ Rate limit requests (2-5 seconds between scrapes)
- ✅ Only scrape public information
- ✅ Check website Terms of Service

**Never**:
- ❌ Scrape personal/private data
- ❌ Overwhelm servers with rapid requests
- ❌ Ignore robots.txt restrictions
- ❌ Use for spam or harassment

### Rate Limiting Example

```typescript
const DELAY_MS = 2000; // 2 seconds

for (const url of urls) {
  await scrapeUrl(url);
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
}
```

### LinkedIn Specific

⚠️ **LinkedIn restricts automated scraping**

Our module includes warnings. For production:
- Use [LinkedIn Official API](https://developer.linkedin.com/)
- Use this module for educational/personal research only
- Consider paid enrichment APIs (Clearbit, ZoomInfo)

---

## 🐛 Troubleshooting

### "Cheerio returns empty data"

**Problem**: Page uses JavaScript to render content

**Solution**: Switch to Playwright
```json
{ "method": "playwright" }
```

### "robots.txt blocking"

**Problem**: Website disallows scraping

**Solutions**:
1. Respect the restriction (recommended)
2. Contact website for permission
3. Use their official API

### "Timeout errors"

**Problem**: Website is slow or unresponsive

**Solution**: Playwright has 30-second default timeout (usually sufficient)

---

## 📚 API Endpoints

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/scrape/company` | Scrape company website | POST |
| `/api/scrape/linkedin` | Scrape LinkedIn (educational) | POST |
| `/api/scrape/generic` | Custom selector scraping | POST |
| `/api/companies/[id]/scrape` | Save scraped data | POST |

---

## 💡 Pro Tips

### 1. Cache Scraped Data

Don't re-scrape frequently:
```typescript
// Only scrape if > 1 week old
const needsScraping = !company.scrapedData?.lastScraped ||
  (Date.now() - company.scrapedData.lastScraped.getTime()) > 7 * 24 * 60 * 60 * 1000;
```

### 2. Batch Processing

Process multiple URLs efficiently:
```typescript
const BATCH_SIZE = 5;

for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  const batch = urls.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(url => scrapeUrl(url)));
  await delay(5000); // Wait between batches
}
```

### 3. Use Official APIs First

Before scraping, check if an API exists:
- **Clearbit**: Company enrichment API
- **Hunter.io**: Email discovery (already integrated!)
- **LinkedIn API**: Official company/profile data
- **Google Places**: Business information

### 4. Validate Scraped Data

```typescript
if (!data.description || data.description.length < 20) {
  console.log('Description too short, try different method');
}

if (data.description.includes('404')) {
  console.log('Page not found, invalid URL');
}
```

---

## 🎓 Learn More

**Full Documentation**: `docs/WEB_SCRAPING.md`

Topics covered:
- Architecture & design patterns
- CheerioScraper vs PlaywrightScraper
- Complete API reference
- 5+ usage examples
- Performance benchmarks
- Legal compliance (GDPR, CCPA, robots.txt)
- Ethical guidelines
- Troubleshooting guide

**Key sections**:
- Scraper Service (600+ lines of code)
- Legal & Ethical Considerations
- Best Practices
- Performance Optimization

---

## ✅ Quick Checklist

Before scraping:
- [ ] Check if official API exists
- [ ] Review website Terms of Service
- [ ] Confirm robots.txt allows scraping
- [ ] Implement rate limiting (2+ seconds)
- [ ] Only scrape public data
- [ ] Cache results to minimize requests
- [ ] Handle errors gracefully

---

## 🚀 Ready to Go!

**Test it now**:
1. Go to Companies → Select company → Edit
2. Add WebScraper component
3. Enter website URL
4. Click "Scrape Website"
5. See data auto-populate!

**Questions?** Check `docs/WEB_SCRAPING.md` for comprehensive documentation.

---

**Reminder**: Use responsibly and ethically. Always respect website policies and data privacy laws!
