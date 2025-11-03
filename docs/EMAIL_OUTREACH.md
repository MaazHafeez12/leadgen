# Email Outreach System - Complete Documentation

A comprehensive email outreach and campaign management system with SMTP integration, template variables, and engagement tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [SMTP Configuration](#smtp-configuration)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Email Templates](#email-templates)
- [Tracking & Analytics](#tracking--analytics)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The Email Outreach System provides a complete solution for managing email campaigns, from composition to delivery tracking. Built on Nodemailer with MongoDB for persistence and Next.js for the API layer.

### Key Components

- **Outreach Dashboard**: Web UI for composing and managing campaigns
- **Email Service**: Nodemailer-based SMTP integration
- **Template Engine**: Variable substitution for personalization
- **Tracking System**: Open/click/bounce tracking
- **Campaign Analytics**: Real-time statistics and performance metrics

## ✨ Features

### Email Composition
- ✅ Select multiple recipients from contact list
- ✅ Rich text email composition
- ✅ Template variable insertion ({FirstName}, {Company}, etc.)
- ✅ Campaign naming and organization
- ✅ CC/BCC support
- ✅ Attachment support (API level)

### Template System
- ✅ Dynamic variable replacement
- ✅ Built-in templates (Introduction, Follow-up, Cold Outreach)
- ✅ Custom template creation
- ✅ Template usage tracking
- ✅ Variable validation

### Campaign Management
- ✅ Campaign statistics dashboard
- ✅ Status tracking (Draft, Sent, Opened, Clicked, Bounced, Failed)
- ✅ Open rate and click rate analytics
- ✅ Email history with full details
- ✅ Multi-campaign support

### Tracking & Analytics
- ✅ Email open tracking (pixel-based)
- ✅ Click tracking
- ✅ Bounce detection
- ✅ Delivery confirmation
- ✅ Engagement metrics

### SMTP Integration
- ✅ Support for any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
- ✅ Secure authentication
- ✅ Connection testing
- ✅ Rate limiting (1 email/second default)
- ✅ Bulk email sending

## 🚀 Installation & Setup

### 1. Install Dependencies

The required packages should already be installed. If not:

```bash
npm install nodemailer @types/nodemailer uuid @types/uuid lucide-react
```

### 2. Environment Configuration

Add SMTP credentials to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM_NAME=Your Name or Company

# MongoDB (required)
MONGODB_URI=mongodb+srv://...

# Next.js (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 3. Database Models

The system uses two MongoDB models:

- **Outreach**: Tracks individual email sends
- **EmailTemplate**: Stores reusable templates

Models are automatically created on first use.

### 4. Access the Dashboard

Navigate to: `http://localhost:3000/outreach`

## 📧 SMTP Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account → Security
   - Select "App passwords"
   - Choose "Mail" and "Other (Custom name)"
   - Copy the generated password

3. **Configure Environment Variables**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=generated-app-password
```

### SendGrid Setup

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun Setup

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

### Custom SMTP Server

```env
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587 # or 465 for SSL
SMTP_SECURE=true # true for 465, false for 587
SMTP_USER=your-username
SMTP_PASS=your-password
```

### Testing SMTP Connection

```bash
curl http://localhost:3000/api/email/send
```

Response:
```json
{
  "success": true,
  "message": "SMTP connection is working"
}
```

## 📖 Usage Guide

### 1. Compose Email via Dashboard

1. Navigate to `/outreach`
2. Click **"Compose"** tab
3. **Select Recipients**: Check contacts from the list
4. **Enter Campaign Name**: e.g., "Q1 2024 Outreach"
5. **Write Subject**: Can include variables like `Quick intro - {Company}`
6. **Compose Body**: Use variable buttons or type `{Variable}` manually
7. **Click "Send Emails"**

### 2. Using Template Variables

Available variables:
- `{FirstName}` - Contact's first name
- `{LastName}` - Contact's last name
- `{FullName}` - Full name (FirstName + LastName)
- `{Email}` - Contact's email
- `{Company}` - Company name
- `{Title}` - Job title
- `{Location}` - Location
- `{LinkedInUrl}` - LinkedIn profile URL

**Example Email**:
```
Subject: Great to connect, {FirstName}!

Hi {FirstName},

I hope this email finds you well. I noticed you're working at {Company} as a {Title}.

I'd love to discuss potential collaboration opportunities.

Looking forward to connecting!

Best regards
```

### 3. Send via API

```javascript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactIds: ['contact-id-1', 'contact-id-2'],
    subject: 'Hello {FirstName}',
    body: 'Hi {FirstName},\n\nGreat to connect!',
    campaignName: 'My Campaign',
    useTemplate: true, // Enable variable replacement
    fromName: 'John Doe',
    replyTo: 'reply@example.com'
  })
});

const data = await response.json();
console.log(data.stats); // { total: 2, sent: 2, failed: 0 }
```

### 4. View Campaign Analytics

1. Click **"Campaigns"** tab
2. View statistics:
   - **Total Sent**
   - **Open Rate**
   - **Click Rate**
   - **Bounce Rate**
3. Click campaign to see detailed metrics

### 5. Check Email History

1. Click **"History"** tab
2. View all sent emails with:
   - Recipient details
   - Send timestamp
   - Current status
   - Open/click counts

## 🔌 API Reference

### Send Email

**POST** `/api/email/send`

Send emails to one or more contacts with template variable replacement.

**Request Body**:
```json
{
  "contactIds": ["60d5ec49f1b2c72b8c8e4f3a"],
  "subject": "Hello {FirstName}",
  "body": "Hi {FirstName},\n\nGreat to meet you!",
  "campaignName": "Q1 Outreach",
  "useTemplate": true,
  "fromName": "John Doe",
  "replyTo": "john@example.com",
  "cc": ["manager@example.com"],
  "bcc": ["tracking@example.com"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sent 1 email(s) successfully, 0 failed",
  "results": [
    {
      "contactId": "60d5ec49f1b2c72b8c8e4f3a",
      "email": "contact@example.com",
      "name": "John Doe",
      "success": true,
      "messageId": "<unique-message-id>",
      "outreachId": "60d5ec49f1b2c72b8c8e4f3b"
    }
  ],
  "stats": {
    "total": 1,
    "sent": 1,
    "failed": 0
  }
}
```

**Error Response**:
```json
{
  "error": "Some contacts do not have email addresses",
  "contactsWithoutEmail": [
    { "id": "...", "name": "John Doe" }
  ]
}
```

---

### Get Outreach Records

**GET** `/api/outreach?campaign=Campaign%20Name&status=sent&limit=50&page=1`

Retrieve outreach records with optional filtering.

**Query Parameters**:
- `campaign` (optional): Filter by campaign name
- `status` (optional): Filter by status (draft, sent, opened, clicked, bounced, failed)
- `limit` (optional): Results per page (default: 50)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3b",
      "contactId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "campaignName": "Q1 Outreach",
      "subject": "Hello John",
      "body": "Hi John,\n\nGreat to meet you!",
      "status": "opened",
      "sentAt": "2024-01-15T10:30:00Z",
      "openedAt": "2024-01-15T11:00:00Z",
      "openCount": 3,
      "clickCount": 1
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

---

### Create Draft Outreach

**POST** `/api/outreach`

Create a draft outreach record without sending.

**Request Body**:
```json
{
  "contactId": "60d5ec49f1b2c72b8c8e4f3a",
  "campaignName": "Q1 Outreach",
  "subject": "Hello",
  "body": "Email body",
  "metadata": {
    "fromName": "John Doe"
  }
}
```

---

### Get Campaign Statistics

**GET** `/api/outreach/stats?campaign=Campaign%20Name`

Get comprehensive statistics for campaigns.

**Response**:
```json
{
  "success": true,
  "stats": {
    "draft": 5,
    "sent": 100,
    "opened": 45,
    "clicked": 12,
    "bounced": 3,
    "failed": 2
  },
  "engagement": {
    "totalOpens": 67,
    "totalClicks": 18,
    "uniqueOpens": 45,
    "uniqueClicks": 12
  },
  "campaigns": [
    {
      "name": "Q1 Outreach",
      "count": 100,
      "sent": 95,
      "opened": 45,
      "clicked": 12,
      "openRate": "47.37",
      "clickRate": "12.63",
      "lastSent": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Track Email Events

**POST** `/api/outreach/track/:trackingId`

Manually track email events (for webhook integrations).

**Request Body**:
```json
{
  "event": "open" // or "click", "bounce", "delivered"
}
```

**GET** `/api/outreach/track/:trackingId`

Track email opens via pixel (automatically called when email is opened).

Returns: 1x1 transparent GIF

---

### Test SMTP Connection

**GET** `/api/email/send`

Test if SMTP is properly configured.

**Response**:
```json
{
  "success": true,
  "message": "SMTP connection is working"
}
```

## 📝 Email Templates

### Built-in Templates

The system includes three default templates:

#### 1. Introduction Email
```
Subject: Quick introduction - {Company}

Hi {FirstName},

I hope this email finds you well. I came across your profile and was impressed by your work at {Company}.

I'd love to connect and explore potential opportunities for collaboration.

Looking forward to hearing from you!

Best regards
```

#### 2. Follow Up Email
```
Subject: Following up on my previous email

Hi {FirstName},

I wanted to follow up on my previous email. I understand you're busy, but I believe there could be valuable synergies between us.

Would you have 15 minutes this week for a quick call?

Best regards
```

#### 3. Cold Outreach
```
Subject: Helping {Company} with [specific problem]

Hi {FirstName},

I noticed {Company} is working in [industry/area]. We've helped similar companies [achieve specific result].

I'd love to share some insights that might be valuable for {Company}.

Would you be open to a brief conversation?

Best regards
```

### Creating Custom Templates

Use the Email Template API or create them programmatically:

```javascript
const template = {
  name: 'Product Demo Request',
  description: 'Request for product demo',
  subject: 'Demo of our solution for {Company}',
  body: `Hi {FirstName},

I'd love to show you how our product can help {Company} achieve [specific goal].

Would you be available for a 15-minute demo this week?

Best regards`,
  variables: ['FirstName', 'Company'],
  category: 'sales',
  isActive: true
};

// Save to database
await EmailTemplate.create(template);
```

### Template Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{FirstName}` | Contact's first name | John |
| `{LastName}` | Contact's last name | Doe |
| `{FullName}` | Full name | John Doe |
| `{Email}` | Email address | john@example.com |
| `{Phone}` | Phone number | +1-555-0123 |
| `{Title}` | Job title | Software Engineer |
| `{Company}` | Company name | Acme Corp |
| `{Location}` | Location | San Francisco, CA |
| `{Source}` | Lead source | LinkedIn |
| `{LinkedInUrl}` | LinkedIn profile URL | https://linkedin.com/in/johndoe |

## 📊 Tracking & Analytics

### Email Open Tracking

The system uses a **1x1 transparent pixel** to track email opens:

```html
<img src="https://your-app.com/api/outreach/track/TRACKING_ID" width="1" height="1" />
```

When the email is opened, the pixel is loaded and the event is recorded.

**Limitations**:
- Email clients with image blocking won't track opens
- Some clients preload images, causing false positives
- Privacy-focused clients may block tracking pixels

### Click Tracking

To track clicks, wrap links with tracking URLs:

```html
<a href="https://your-app.com/api/outreach/track/TRACKING_ID?event=click&url=https://target-url.com">
  Click here
</a>
```

### Webhook Integration

For advanced tracking with SendGrid/Mailgun:

**SendGrid Webhook**:
```javascript
// pages/api/webhooks/sendgrid.ts
export async function POST(request) {
  const events = await request.json();
  
  for (const event of events) {
    const { email, event: eventType, sg_message_id } = event;
    
    // Find outreach by email and update status
    await Outreach.findOneAndUpdate(
      { 'metadata.messageId': sg_message_id },
      { 
        status: eventType, // 'delivered', 'open', 'click', 'bounce'
        [`${eventType}At`]: new Date()
      }
    );
  }
  
  return Response.json({ success: true });
}
```

**Mailgun Webhook**:
```javascript
// pages/api/webhooks/mailgun.ts
export async function POST(request) {
  const data = await request.json();
  const { event, recipient, 'message-id': messageId } = data;
  
  await Outreach.findOneAndUpdate(
    { 'metadata.messageId': messageId },
    {
      status: event,
      [`${event}At`]: new Date()
    }
  );
  
  return Response.json({ success: true });
}
```

### Analytics Dashboard

Access real-time analytics:
1. Navigate to `/outreach`
2. Click **"Campaigns"** tab
3. View metrics:
   - **Open Rate**: (Unique Opens / Sent) × 100
   - **Click Rate**: (Unique Clicks / Sent) × 100
   - **Bounce Rate**: (Bounced / Sent) × 100
   - **Engagement Score**: Opens + (Clicks × 2)

## ✅ Best Practices

### Email Deliverability

1. **Warm Up Your Domain**
   - Start with small batches (10-20 emails/day)
   - Gradually increase over 2-3 weeks
   - Monitor bounce rates

2. **Authentication**
   - Set up SPF records
   - Configure DKIM signing
   - Enable DMARC

3. **Content Quality**
   - Avoid spam trigger words (FREE, URGENT, ACT NOW)
   - Include unsubscribe link
   - Maintain good text-to-image ratio
   - Test with spam checkers

4. **List Hygiene**
   - Remove bounced emails immediately
   - Validate emails before sending
   - Honor unsubscribe requests
   - Clean inactive contacts regularly

### Personalization

1. **Use Multiple Variables**
   ```
   Subject: {FirstName}, saw your work at {Company}
   
   Hi {FirstName},
   
   I noticed you're a {Title} at {Company} in {Location}...
   ```

2. **Context-Specific Content**
   - Reference recent company news
   - Mention mutual connections
   - Highlight relevant case studies

3. **A/B Testing**
   - Test different subject lines
   - Try various email lengths
   - Experiment with CTAs

### Rate Limiting

Default: **1 email per second** (3,600/hour)

Adjust in code:
```javascript
// In EmailService.sendBulkEmails()
const delayMs = 2000; // 2 seconds between emails
```

Recommended limits by provider:
- **Gmail**: 500/day (consumer), 2,000/day (Workspace)
- **SendGrid**: Depends on plan (40,000+/day on free tier)
- **Mailgun**: Plan-dependent (10,000+/day)

### Legal Compliance

1. **CAN-SPAM Act (US)**
   - Include physical address
   - Clear unsubscribe mechanism
   - Honor opt-outs within 10 days
   - Identify as advertisement if applicable

2. **GDPR (EU)**
   - Obtain explicit consent
   - Provide data access/deletion
   - Document consent records
   - Include privacy policy link

3. **CASL (Canada)**
   - Get express consent before sending
   - Include unsubscribe in every email
   - Keep consent records for 3 years

### Campaign Strategy

1. **Segmentation**
   - Group by industry, role, location
   - Target based on engagement history
   - Create personas

2. **Timing**
   - Best days: Tuesday-Thursday
   - Best times: 10 AM - 11 AM, 2 PM - 3 PM
   - Avoid Mondays and Fridays
   - Test different time zones

3. **Follow-up Sequence**
   - Day 0: Initial email
   - Day 3: Soft follow-up
   - Day 7: Value-add follow-up
   - Day 14: Final check-in

4. **Metrics to Monitor**
   - Open rate: **15-25%** is good
   - Click rate: **2-5%** is good
   - Response rate: **1-3%** is good
   - Bounce rate: **< 2%** is healthy

## 🐛 Troubleshooting

### SMTP Connection Failed

**Error**: `Failed to connect to SMTP server`

**Solutions**:
1. Verify SMTP credentials in `.env.local`
2. Check SMTP_HOST and SMTP_PORT are correct
3. For Gmail: Use App Password, not account password
4. Ensure firewall isn't blocking port 587/465
5. Test connection: `curl http://localhost:3000/api/email/send`

---

### Emails Not Sending

**Error**: `Failed to send emails`

**Solutions**:
1. Check SMTP is configured: Visit `/outreach`, look for warning banner
2. Verify contacts have valid email addresses
3. Check server logs for detailed error messages
4. Test with a single email first
5. Verify SMTP daily/hourly limits aren't exceeded

---

### Variables Not Replacing

**Issue**: Email shows `{FirstName}` instead of actual name

**Solutions**:
1. Ensure "Replace variables with contact data" checkbox is enabled
2. Verify contact has the required fields (firstName, company, etc.)
3. Check variable spelling (case-sensitive)
4. Use exact variable names: `{FirstName}` not `{firstname}`

---

### Tracking Not Working

**Issue**: Opens/clicks not being recorded

**Solutions**:
1. **Opens**: Many email clients block images/pixels
2. **Clicks**: Ensure links use tracking wrapper
3. Check tracking pixel is in HTML version of email
4. Some privacy-focused clients block all tracking
5. Test with regular email clients (Gmail, Outlook)

---

### High Bounce Rate

**Issue**: Many emails bouncing

**Solutions**:
1. Validate email addresses before sending
2. Clean old/inactive contacts
3. Check for typos in email addresses
4. Verify domain reputation
5. Use email validation API

---

### Rate Limit Errors

**Error**: `Too many requests` or `Rate limit exceeded`

**Solutions**:
1. Gmail: Reduce sending volume (< 500/day for consumer)
2. Increase delay between emails in code
3. Upgrade to business email service
4. Use dedicated SMTP provider (SendGrid, Mailgun)
5. Spread campaigns over multiple days

---

### Database Connection Issues

**Error**: `Failed to connect to MongoDB`

**Solutions**:
1. Verify MONGODB_URI in `.env.local`
2. Check MongoDB Atlas IP whitelist
3. Ensure database user has correct permissions
4. Test connection: `http://localhost:3000/api/health`

## 🔐 Security Considerations

### Environment Variables

**Never commit** `.env.local` to version control:

```bash
# Add to .gitignore
.env*.local
.env
```

### SMTP Credentials

- Use app-specific passwords (Gmail)
- Rotate credentials regularly
- Limit scope of API keys
- Monitor for unusual activity

### API Rate Limiting

Implement rate limiting on API endpoints:

```javascript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many emails sent, please try again later'
});
```

### Input Validation

Always validate and sanitize:
- Email addresses (format validation)
- Subject lines (length limits, XSS prevention)
- Email bodies (HTML sanitization)
- Attachment types and sizes

## 📚 Additional Resources

### Documentation
- [Nodemailer Docs](https://nodemailer.com/about/)
- [SendGrid API](https://sendgrid.com/docs/API_Reference/index.html)
- [Mailgun API](https://documentation.mailgun.com/en/latest/)

### Email Best Practices
- [Email Deliverability Guide](https://postmarkapp.com/guides/email-deliverability)
- [CAN-SPAM Compliance](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)
- [GDPR Email Marketing](https://gdpr.eu/email-marketing/)

### Tools
- [Mail Tester](https://www.mail-tester.com/) - Test email deliverability
- [MXToolbox](https://mxtoolbox.com/) - Check domain configuration
- [Email on Acid](https://www.emailonacid.com/) - Test email rendering

## 🎯 Quick Start Checklist

- [ ] Install dependencies (`nodemailer`, `uuid`, `lucide-react`)
- [ ] Configure SMTP in `.env.local`
- [ ] Test SMTP connection: `GET /api/email/send`
- [ ] Create test contacts with valid emails
- [ ] Navigate to `/outreach`
- [ ] Compose and send first test email
- [ ] Verify email received
- [ ] Check campaign statistics
- [ ] Review email history
- [ ] Set up SPF/DKIM (production)
- [ ] Configure webhooks (optional)
- [ ] Monitor deliverability metrics

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Built with**: Next.js 15, Nodemailer, MongoDB, TypeScript
