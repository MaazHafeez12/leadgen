# Email Outreach - Quick Start Guide

Send personalized email campaigns in 5 minutes.

## 🚀 Quick Setup

### 1. Configure SMTP

Add to `.env.local`:

```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Your Name
```

**Gmail App Password Setup**:
1. Enable 2FA on Google Account
2. Go to Security → App passwords
3. Generate password for "Mail"
4. Copy password to `SMTP_PASS`

### 2. Test Connection

```bash
curl http://localhost:3000/api/email/send
```

Expected response:
```json
{ "success": true, "message": "SMTP connection is working" }
```

### 3. Send Your First Email

1. Go to `http://localhost:3000/outreach`
2. Select contacts (checkbox)
3. Enter campaign name: "Test Campaign"
4. Write subject: "Hello {FirstName}!"
5. Write body: "Hi {FirstName}, great to connect!"
6. Click "Send Emails"

## 📝 Template Variables

Use these variables for personalization:

- `{FirstName}` → Contact's first name
- `{LastName}` → Contact's last name
- `{FullName}` → Full name
- `{Email}` → Email address
- `{Company}` → Company name
- `{Title}` → Job title
- `{Location}` → Location

**Example**:
```
Subject: Quick question, {FirstName}

Hi {FirstName},

I noticed you're a {Title} at {Company}. I'd love to connect!

Best,
John
```

## 🎯 Send via API

```javascript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactIds: ['contact-id-1', 'contact-id-2'],
    subject: 'Hello {FirstName}',
    body: 'Hi {FirstName},\n\nGreat to connect!',
    campaignName: 'My Campaign',
    useTemplate: true
  })
});

const data = await response.json();
console.log(data.stats); // { total: 2, sent: 2, failed: 0 }
```

## 📊 View Analytics

1. Click **"Campaigns"** tab
2. See metrics:
   - Sent emails
   - Open rate
   - Click rate
   - Bounce rate

## 🔍 Check History

1. Click **"History"** tab
2. View all sent emails
3. See status (sent, opened, clicked, bounced)
4. Track engagement (opens/clicks)

## ⚙️ SMTP Providers

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-password
```

## ✅ Best Practices

### Deliverability
- ✅ Start with small batches (10-20/day)
- ✅ Warm up new domains gradually
- ✅ Keep bounce rate < 2%
- ✅ Remove bounced emails immediately

### Personalization
- ✅ Use multiple variables
- ✅ Reference company/role
- ✅ Keep subject lines under 50 chars
- ✅ Test before bulk sending

### Timing
- ✅ Send Tue-Thu for best results
- ✅ Best time: 10-11 AM or 2-3 PM
- ✅ Avoid Mondays and Fridays
- ✅ Consider recipient time zones

### Legal
- ✅ Include unsubscribe link
- ✅ Add physical address
- ✅ Honor opt-outs within 10 days
- ✅ Get consent before sending (GDPR)

## 🐛 Troubleshooting

### "SMTP not configured" warning
→ Check `.env.local` has correct SMTP settings

### Emails not sending
→ Test connection: `GET /api/email/send`
→ Verify contacts have valid emails
→ Check SMTP credentials

### Variables not replacing
→ Enable "Replace variables" checkbox
→ Verify contacts have required fields
→ Check variable spelling

### High bounce rate
→ Validate email addresses
→ Clean inactive contacts
→ Check domain reputation

## 📈 Rate Limits

**Default**: 1 email per second (3,600/hour)

**Provider Limits**:
- Gmail: 500/day (free), 2,000/day (Workspace)
- SendGrid: 40,000+/day (varies by plan)
- Mailgun: 10,000+/day (varies by plan)

## 📚 Full Documentation

For complete docs: [EMAIL_OUTREACH.md](./EMAIL_OUTREACH.md)

## 🎓 Example Campaign

```
Campaign: "Product Demo Outreach"

Subject: Quick demo for {Company}?

Body:
Hi {FirstName},

I hope you're doing well! I noticed {Company} is in the {industry} space.

We've helped similar companies reduce costs by 30%. Would you be interested in a 15-minute demo?

Let me know if you have time this week!

Best regards,
John Smith
```

**Result**:
- 100 emails sent
- 45% open rate (45 opens)
- 12% click rate (12 clicks)
- 8 responses (8% response rate)

## 🔗 API Endpoints

- `POST /api/email/send` - Send emails
- `GET /api/outreach` - Get email history
- `GET /api/outreach/stats` - Get campaign stats
- `POST /api/outreach/track/:id` - Track events

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Test SMTP
curl http://localhost:3000/api/email/send

# View outreach dashboard
open http://localhost:3000/outreach
```

---

**Quick Links**:
- [Full Documentation](./EMAIL_OUTREACH.md)
- [API Reference](./EMAIL_OUTREACH.md#api-reference)
- [Template Guide](./EMAIL_OUTREACH.md#email-templates)
- [Troubleshooting](./EMAIL_OUTREACH.md#troubleshooting)
