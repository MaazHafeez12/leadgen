# Hunter.io Email Enrichment - Complete Guide

This document provides comprehensive documentation for the Hunter.io email enrichment integration in the LeadGen MVP application.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Features](#features)
4. [API Endpoints](#api-endpoints)
5. [UI Integration](#ui-integration)
6. [Usage Examples](#usage-examples)
7. [Data Storage](#data-storage)
8. [API Limits & Pricing](#api-limits--pricing)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Hunter.io integration provides powerful email enrichment capabilities:

✅ **Email Finder**: Discover email addresses based on name and company domain  
✅ **Email Verifier**: Verify deliverability and validity of email addresses  
✅ **Domain Search**: Find all email addresses for a company domain  
✅ **Confidence Scoring**: Get deliverability scores (0-100) for each email  
✅ **Auto-Save**: Automatically save enrichment data to contact records  

Hunter.io uses multiple data sources and verification checks to provide accurate email information with confidence scores.

---

## Setup & Configuration

### 1. Get Hunter.io API Key

1. Sign up at [Hunter.io](https://hunter.io)
2. Navigate to **API** section in your dashboard
3. Copy your API key

### 2. Configure Environment Variable

Add your Hunter.io API key to `.env.local`:

```bash
HUNTER_API_KEY=your_hunter_io_api_key_here
```

**Security Note**: Never commit `.env.local` to version control. Use `.env.local.example` for documentation.

### 3. Verify Installation

The integration is ready when:
- Hunter.io API key is added to `.env.local`
- Application is restarted (to load new environment variables)
- No errors appear in browser console when accessing contact edit pages

---

## Features

### Email Finder

**What it does:**
- Discovers email addresses based on first name, last name, and company domain
- Returns confidence score (0-100)
- Identifies email type (personal vs generic)
- Provides position and department information
- Auto-fills email field when found

**Use Cases:**
- Finding contact information for prospects
- Enriching incomplete contact records
- Validating manually entered emails

**Confidence Levels:**
- **90-100%**: Very high confidence, multiple sources
- **70-89%**: High confidence, verified pattern
- **50-69%**: Medium confidence, likely correct
- **Below 50%**: Low confidence, verify before use

---

### Email Verifier

**What it does:**
- Verifies if email address is valid and deliverable
- Checks MX records, SMTP server, and format
- Detects disposable email services
- Identifies webmail providers (Gmail, Yahoo, etc.)
- Checks for catch-all servers

**Deliverability Results:**
- **Deliverable**: Email is valid and can receive emails
- **Undeliverable**: Email doesn't exist or can't receive emails
- **Risky**: Email might bounce (catch-all, accept all)
- **Unknown**: Verification inconclusive

**Verification Checks:**
- ✅ Valid Format: Email syntax is correct
- ✅ MX Records: Domain has mail servers
- ✅ SMTP Check: Server responds to verification
- ✅ Not Disposable: Not a temporary email service
- ✅ Not Gibberish: Email looks legitimate
- ✅ Not Blocked: Email not blacklisted

---

### Domain Search

**What it does:**
- Finds all public email addresses for a domain
- Returns email pattern for the domain
- Filters by seniority, department, or type
- Provides LinkedIn/Twitter profiles
- Shows verification status for each email

**Use Cases:**
- Discovering decision makers at target companies
- Building contact lists for specific departments
- Finding executive contacts
- Competitive intelligence

---

## API Endpoints

### POST /api/hunter/find

Find email address by name and domain.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "domain": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "john.doe@example.com",
    "score": 92,
    "firstName": "John",
    "lastName": "Doe",
    "position": "CEO",
    "department": "Executive",
    "type": "personal",
    "confidence": 95,
    "sources": 12
  },
  "meta": {
    "requests": {
      "available": 48,
      "used": 2
    }
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `500`: API key not configured
- `404`: No email found

---

### POST /api/hunter/verify

Verify email address deliverability.

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "john.doe@example.com",
    "status": "valid",
    "result": "deliverable",
    "score": 87,
    "regexp": true,
    "gibberish": false,
    "disposable": false,
    "webmail": false,
    "mxRecords": true,
    "smtp": {
      "server": true,
      "check": true
    },
    "acceptAll": false,
    "block": false,
    "domain": "example.com",
    "sources": 8
  }
}
```

**Status Values:**
- `valid`: Email exists and is deliverable
- `invalid`: Email doesn't exist
- `accept_all`: Server accepts all emails (risky)
- `webmail`: Free email service (Gmail, Yahoo)
- `disposable`: Temporary email service
- `unknown`: Cannot determine status

---

### POST /api/hunter/domain-search

Find all emails for a domain.

**Request:**
```json
{
  "domain": "example.com",
  "limit": 10,
  "offset": 0,
  "type": "personal",
  "seniority": "executive",
  "department": "executive"
}
```

**Optional Filters:**
- `type`: "personal" or "generic"
- `seniority`: "junior", "senior", "executive"
- `department`: "executive", "it", "finance", "management", "sales", "marketing", "communication", "hr", "legal"

**Response:**
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "disposable": false,
    "webmail": false,
    "acceptAll": false,
    "pattern": "{first}.{last}",
    "organization": "Example Corp",
    "emails": [
      {
        "value": "john.doe@example.com",
        "type": "personal",
        "confidence": 95,
        "firstName": "John",
        "lastName": "Doe",
        "position": "CEO",
        "seniority": "executive",
        "department": "executive",
        "linkedin": "https://linkedin.com/in/johndoe",
        "twitter": "@johndoe",
        "phoneNumber": "+1234567890",
        "sources": 12,
        "verification": {
          "date": "2024-01-01",
          "status": "valid"
        }
      }
    ],
    "total": 45,
    "limit": 10,
    "offset": 0
  }
}
```

---

### POST /api/contacts/[id]/enrich

Save enrichment data to contact record.

**Request:**
```json
{
  "enrichmentData": {
    "verified": true,
    "verificationStatus": "valid",
    "verificationResult": "deliverable",
    "score": 92,
    "emailType": "personal",
    "sources": 12,
    "hunterData": {
      "position": "CEO",
      "department": "Executive",
      "disposable": false,
      "webmail": false,
      "acceptAll": false,
      "mxRecords": true,
      "smtpCheck": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated contact */ },
  "message": "Enrichment data saved successfully"
}
```

---

## UI Integration

### EmailEnrichment Component

**Location:** `src/components/EmailEnrichment.tsx`

**Props:**
```typescript
interface EmailEnrichmentProps {
  firstName: string;          // Contact first name
  lastName: string;           // Contact last name
  domain?: string;            // Company domain (for finding)
  currentEmail?: string;      // Current email (for verification)
  contactId?: string;         // Contact ID (for auto-save)
  onEmailFound?: (email: string) => void;
  onEmailVerified?: (data: VerificationResult) => void;
}
```

**Usage in Contact Edit Page:**

```tsx
import EmailEnrichment from '@/components/EmailEnrichment';

<EmailEnrichment
  firstName={formData.firstName}
  lastName={formData.lastName}
  domain={getCompanyDomain()}
  currentEmail={formData.email}
  contactId={params.id}
  onEmailFound={(email) => setFormData({ ...formData, email })}
  onEmailVerified={(data) => console.log('Verified:', data)}
/>
```

**Features:**
- Two action buttons: "Find Email" and "Verify Email"
- Visual results with color-coded scores
- Detailed verification checks display
- Auto-saves enrichment data to contact
- Helper text for guidance

**Visual Indicators:**
- **Green (80-100)**: High confidence/deliverable
- **Yellow (50-79)**: Medium confidence/risky
- **Red (0-49)**: Low confidence/undeliverable

---

## Usage Examples

### Example 1: Find Email for New Contact

**Scenario:** You have a prospect's name and company but no email.

**Steps:**
1. Go to **Contacts** → Select contact → **Edit**
2. Enter First Name: "Sarah"
3. Enter Last Name: "Johnson"
4. Select Company: "Acme Corp" (domain: acme.com)
5. Click **"Find Email"**
6. Review confidence score (e.g., 92%)
7. Email auto-fills: sarah.johnson@acme.com
8. Click **"Save Changes"**

**Result:**
- Email field populated
- Enrichment data saved with score: 92
- Contact marked as enriched
- Position/department updated (if found)

---

### Example 2: Verify Existing Email

**Scenario:** You have an email but want to check if it's valid.

**Steps:**
1. Open contact with email: john@example.com
2. Click **Edit**
3. Scroll to Email Enrichment section
4. Click **"Verify Email"**
5. Review deliverability score: 85%
6. Check verification details:
   - ✅ Valid Format
   - ✅ MX Records
   - ✅ SMTP Check
   - ✅ Not Disposable
7. Result: **Deliverable**

**Result:**
- Contact marked as verified
- Verification status: "valid"
- Deliverability: "deliverable"
- Score: 85% saved

---

### Example 3: Bulk Email Discovery (Domain Search)

**Scenario:** Find all decision makers at a target company.

**API Call:**
```typescript
const response = await fetch('/api/hunter/domain-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'targetcompany.com',
    seniority: 'executive',
    department: 'executive',
    limit: 50
  })
});

const result = await response.json();
console.log(`Found ${result.data.emails.length} executives`);

// Create contacts from results
result.data.emails.forEach(async (email) => {
  await fetch('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({
      firstName: email.firstName,
      lastName: email.lastName,
      email: email.value,
      title: email.position,
      linkedinUrl: email.linkedin,
      status: 'new',
      source: 'hunter',
      enrichmentData: {
        verified: email.verification?.status === 'valid',
        score: email.confidence,
        emailType: email.type,
      }
    })
  });
});
```

**Result:**
- 50 executive contacts discovered
- All contacts created with enrichment data
- LinkedIn profiles included
- Ready for outreach

---

### Example 4: Verify List Before Campaign

**Scenario:** Verify all emails in a list before sending campaign.

**Process:**
```typescript
// Get all contacts in list
const listResponse = await fetch(`/api/lists/${listId}`);
const list = await listResponse.json();

// Verify each email
for (const contact of list.data.contacts) {
  const verifyResponse = await fetch('/api/hunter/verify', {
    method: 'POST',
    body: JSON.stringify({ email: contact.email })
  });
  
  const result = await verifyResponse.json();
  
  if (result.data.result === 'deliverable') {
    console.log(`✅ ${contact.email} - Valid`);
  } else {
    console.log(`❌ ${contact.email} - ${result.data.result}`);
    // Update contact status to unqualified
    await fetch(`/api/contacts/${contact._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'unqualified' })
    });
  }
}
```

**Result:**
- All emails verified
- Invalid emails marked as unqualified
- Campaign list cleaned
- Reduced bounce rate

---

## Data Storage

### Contact Model Enhancement

Enrichment data stored in `Contact.enrichmentData`:

```typescript
enrichmentData: {
  verified: boolean;
  verificationStatus: 'valid' | 'invalid' | 'accept_all' | 'webmail' | 'disposable' | 'unknown';
  verificationResult: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
  score: number; // 0-100
  emailType: 'personal' | 'generic';
  sources: number;
  lastEnriched: Date;
  hunterData: {
    position: string;
    department: string;
    disposable: boolean;
    webmail: boolean;
    acceptAll: boolean;
    mxRecords: boolean;
    smtpCheck: boolean;
  };
}
```

### Query Enriched Contacts

```typescript
// Find all verified contacts
const verifiedContacts = await Contact.find({
  'enrichmentData.verified': true,
  'enrichmentData.score': { $gte: 80 }
});

// Find contacts needing verification
const needsVerification = await Contact.find({
  email: { $exists: true },
  'enrichmentData.verified': { $ne: true }
});

// Find high-quality contacts
const highQuality = await Contact.find({
  'enrichmentData.verificationResult': 'deliverable',
  'enrichmentData.emailType': 'personal',
  'enrichmentData.score': { $gte: 90 }
});
```

---

## API Limits & Pricing

### Free Plan

- **50 requests/month**
- Email Finder: ✅
- Email Verifier: ✅
- Domain Search: ✅ (10 results)
- Bulk tasks: ❌

### Starter Plan ($49/month)

- **500 requests/month**
- All features
- API access
- Bulk tasks: ✅

### Growth Plan ($99/month)

- **2,500 requests/month**
- All features
- Priority support
- CRM integrations

### Business Plan ($199/month)

- **10,000 requests/month**
- All features
- Dedicated account manager
- Custom integrations

**Note:** Requests are shared across Email Finder, Email Verifier, and Domain Search.

### Tracking Usage

Hunter.io includes remaining requests in API responses:

```json
"meta": {
  "requests": {
    "available": 48,
    "used": 2
  }
}
```

Monitor usage in Hunter.io dashboard: [https://hunter.io/api-keys](https://hunter.io/api-keys)

---

## Best Practices

### 1. Optimize API Usage

**DO:**
- ✅ Verify emails before sending campaigns
- ✅ Use domain search to discover multiple contacts at once
- ✅ Cache enrichment data (don't re-verify frequently)
- ✅ Prioritize high-value contacts for enrichment
- ✅ Use confidence scores to determine which emails to use

**DON'T:**
- ❌ Verify same email multiple times
- ❌ Find emails without company domain
- ❌ Use API for every contact (prioritize)
- ❌ Ignore confidence scores
- ❌ Send to unverified emails in bulk

### 2. Email Quality Standards

**High Quality (Use for outreach):**
- Score ≥ 80
- Result: Deliverable
- Type: Personal
- Not webmail (for B2B)
- Multiple sources

**Medium Quality (Verify before use):**
- Score 50-79
- Result: Risky or Unknown
- Accept-all server
- Webmail addresses

**Low Quality (Do not use):**
- Score < 50
- Result: Undeliverable
- Disposable email
- Gibberish patterns
- Blocked

### 3. Enrichment Workflow

**Recommended Process:**

1. **Import/Create Contacts**
   - Add name and company
   - Status: "new"

2. **Find Emails**
   - Use Email Finder for missing emails
   - Check confidence score (≥80 recommended)
   - Auto-save results

3. **Verify Emails**
   - Verify all found emails
   - Verify imported emails before campaigns
   - Check deliverability result

4. **Segment by Quality**
   - High-quality: Ready for outreach
   - Medium-quality: Manual review
   - Low-quality: Mark as unqualified

5. **Campaign Execution**
   - Only contact verified emails
   - Track bounce rates
   - Re-verify periodically (quarterly)

### 4. Rate Limiting

Implement rate limiting for bulk operations:

```typescript
async function enrichContacts(contacts: Contact[]) {
  const BATCH_SIZE = 10;
  const DELAY_MS = 1000; // 1 second between batches
  
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(contact => enrichContact(contact))
    );
    
    if (i + BATCH_SIZE < contacts.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
}
```

### 5. Error Handling

```typescript
async function findEmailSafely(firstName: string, lastName: string, domain: string) {
  try {
    const response = await fetch('/api/hunter/find', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, domain })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      if (result.error.includes('API key')) {
        console.error('Hunter.io not configured');
        return null;
      }
      
      if (result.message?.includes('No email found')) {
        console.log('Email not found - manual research needed');
        return null;
      }
      
      throw new Error(result.error);
    }
    
    // Check confidence threshold
    if (result.data.score < 70) {
      console.warn(`Low confidence (${result.data.score}%) for ${firstName} ${lastName}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error finding email:', error);
    return null;
  }
}
```

---

## Troubleshooting

### Issue: "Hunter.io API key not configured"

**Solution:**
1. Check `.env.local` file exists
2. Verify variable name: `HUNTER_API_KEY`
3. Restart Next.js development server
4. Clear browser cache

### Issue: "No email found"

**Possible Causes:**
- Domain is incorrect (check company website)
- Person not in Hunter.io database
- Name spelling incorrect
- Person uses different email pattern

**Solutions:**
- Verify domain is correct
- Try different domain variations (company.com vs company.co)
- Check LinkedIn for correct name spelling
- Use Domain Search to see email pattern
- Manual research required

### Issue: Low Confidence Score

**Causes:**
- Limited data sources
- Uncommon email pattern
- Recent company domain change
- Person not publicly visible

**What to Do:**
- Verify email before using
- Cross-reference with LinkedIn
- Use Domain Search to confirm pattern
- Consider manual outreach via LinkedIn

### Issue: Rate Limit Exceeded

**Solution:**
```
Error: API limit reached (50/50 requests used)
```

**Options:**
1. Wait until next billing cycle (monthly reset)
2. Upgrade Hunter.io plan
3. Prioritize high-value contacts
4. Use cached data for re-verifications

### Issue: "Accept All" Server

**What it means:**
Server accepts all emails, can't verify existence.

**What to Do:**
- Mark as "risky"
- Consider for low-priority outreach
- Monitor bounce rate carefully
- Prefer other contacts at same company

---

## Integration Examples

### Zapier Integration

Connect Hunter.io with other tools:

```javascript
// Trigger: New Contact Created
// Action: Find Email with Hunter.io
// Action: Update Contact with Email

const zapierWebhook = async (contact) => {
  // Find email
  const hunterResult = await fetch('/api/hunter/find', {
    method: 'POST',
    body: JSON.stringify({
      firstName: contact.firstName,
      lastName: contact.lastName,
      domain: contact.companyDomain
    })
  });
  
  // Update contact
  if (hunterResult.success) {
    await updateContact(contact.id, {
      email: hunterResult.data.email
    });
  }
};
```

### Bulk Import with Enrichment

```typescript
async function importWithEnrichment(csvData: any[]) {
  const results = {
    imported: 0,
    enriched: 0,
    failed: 0
  };
  
  for (const row of csvData) {
    try {
      // Create contact
      const contact = await createContact({
        firstName: row.first_name,
        lastName: row.last_name,
        company: row.company_id,
        status: 'new'
      });
      results.imported++;
      
      // Enrich if domain available
      if (row.domain) {
        const hunterResult = await findEmail(
          row.first_name,
          row.last_name,
          row.domain
        );
        
        if (hunterResult) {
          await updateContact(contact._id, {
            email: hunterResult.email,
            enrichmentData: {
              verified: true,
              score: hunterResult.score,
              emailType: hunterResult.type
            }
          });
          results.enriched++;
        }
      }
    } catch (error) {
      results.failed++;
      console.error(`Failed to import ${row.first_name} ${row.last_name}:`, error);
    }
  }
  
  return results;
}
```

---

## Related Files

### API Routes
- `/src/app/api/hunter/find/route.ts` - Email Finder endpoint
- `/src/app/api/hunter/verify/route.ts` - Email Verifier endpoint
- `/src/app/api/hunter/domain-search/route.ts` - Domain Search endpoint
- `/src/app/api/contacts/[id]/enrich/route.ts` - Save enrichment data

### Components
- `/src/components/EmailEnrichment.tsx` - Email enrichment UI component

### Models
- `/src/models/Contact.ts` - Contact schema with enrichmentData

### Pages
- `/src/app/contacts/[id]/edit/page.tsx` - Contact edit with Hunter.io integration

### Configuration
- `/.env.local.example` - Environment variables template

---

## Summary

The Hunter.io integration provides powerful email enrichment capabilities:

- **3 API Endpoints**: Find, Verify, Domain Search
- **Automatic Data Saving**: Enrichment data stored in contacts
- **Visual UI Component**: Easy-to-use interface for finding and verifying emails
- **Confidence Scoring**: Make informed decisions based on data quality
- **Comprehensive Verification**: 6+ checks for email deliverability

This integration helps you:
1. Build complete contact databases
2. Verify email quality before campaigns
3. Discover decision makers at target companies
4. Reduce bounce rates
5. Improve outreach success rates

For support, visit [Hunter.io Documentation](https://hunter.io/api-documentation/v2) or contact Hunter.io support.
