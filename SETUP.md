# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env.local` with connection string

### Step 2: Configure Environment

Edit `.env.local` file:
```env
# Required
MONGODB_URI=mongodb://localhost:27017/leadgen

# Optional (for email enrichment)
HUNTER_API_KEY=your_key_here

# Optional (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Step 3: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## 📝 First Steps

1. **Import Leads**
   - Click "Import Leads" on homepage
   - Use Manual Entry or CSV Import
   - CSV format: `First Name, Last Name, Email, Company, Title`

2. **View Leads**
   - Click "Leads Database"
   - Search and filter leads
   - Click "View" to see details

3. **Create Lists**
   - Click "Lead Lists"
   - Create custom lists for campaigns
   - Organize leads by project/campaign

## 🔑 Getting API Keys

### Hunter.io (Email Enrichment)
1. Sign up at https://hunter.io
2. Go to API section
3. Copy API key
4. Add to `.env.local`

### Gmail SMTP (Email Sending)
1. Enable 2FA on Google Account
2. Generate App Password
3. Use in `.env.local`

## 🎯 CSV Import Example

```csv
First Name, Last Name, Email, Company, Title, Location
John, Doe, john@example.com, Acme Corp, CEO, San Francisco
Jane, Smith, jane@techco.com, Tech Co, CTO, New York
Bob, Johnson, bob@startup.io, Startup Inc, Founder, Austin
```

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running (`mongod` command)
- Check connection string in `.env.local`

**Port 3000 Already in Use:**
```bash
# Use different port
npm run dev -- -p 3001
```

**Email Enrichment Not Working:**
- Check Hunter.io API key
- Verify API quota (free tier: 50 requests/month)

## 📚 Next Steps

1. Add your first leads
2. Test email enrichment
3. Create lead lists
4. Try CSV bulk import
5. Deploy to Vercel (see README.md)

## 💡 Tips

- Use search to quickly find leads
- Filter by status to track pipeline
- Enrich emails to verify accuracy
- Create lists for targeted campaigns
- Tag leads for better organization
