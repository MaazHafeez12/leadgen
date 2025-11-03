# 🚀 Hunter.io Email Enrichment - Quick Setup

Get started with email enrichment in 3 minutes!

## Step 1: Get Your API Key (2 minutes)

1. Go to [Hunter.io](https://hunter.io) and sign up for a free account
2. Navigate to **Dashboard** → **API**
3. Copy your API key (starts with a long string of characters)

**Free Plan Includes:**
- 50 requests/month
- Email Finder
- Email Verifier
- Domain Search

## Step 2: Add API Key to Project (30 seconds)

1. Open your project in VS Code
2. Create or edit `.env.local` file in the root directory
3. Add this line (replace with your actual key):

```bash
HUNTER_API_KEY=your_actual_api_key_here
```

**Example `.env.local` file:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadgen
HUNTER_API_KEY=1234567890abcdef1234567890abcdef12345678
```

## Step 3: Restart Development Server (30 seconds)

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ You're Ready!

### Test It Out:

1. Go to **Contacts** in your app
2. Click on any contact
3. Click **Edit**
4. Scroll to the **Email Enrichment** section
5. Fill in:
   - First Name: "Elon"
   - Last Name: "Musk"
   - Company: Select or create "Tesla" (domain: tesla.com)
6. Click **"Find Email"**
7. See the magic! ✨

### What You'll See:

- ✅ Email found with confidence score
- 📊 Position and department
- 🎯 Email type (personal/generic)
- 💾 Auto-saved to contact record

### Next: Verify Emails

After finding or entering an email:
1. Click **"Verify Email"**
2. See deliverability score (0-100)
3. View verification checks (MX records, SMTP, format, etc.)
4. Results automatically saved

## 🎓 Learn More

- **Full Documentation**: `docs/HUNTER_EMAIL_ENRICHMENT.md`
- **API Reference**: Hunter.io endpoints, parameters, responses
- **Best Practices**: Optimize API usage, quality standards
- **Examples**: Real-world usage scenarios

## 💡 Pro Tips

1. **Find Emails First**: Use name + company domain
2. **Always Verify**: Check deliverability before campaigns
3. **Check Scores**: 80+ = high quality, use immediately
4. **Monitor Usage**: Free plan = 50 requests/month
5. **Domain Search**: Find multiple contacts at once

## ⚠️ Troubleshooting

**"API key not configured" error?**
- Check `.env.local` file exists
- Verify variable name is `HUNTER_API_KEY`
- Restart dev server

**"No email found"?**
- Verify company domain is correct
- Check name spelling
- Try Domain Search to see email pattern

**Low confidence score?**
- Always verify before using
- Cross-check with LinkedIn
- Consider manual research

## 📊 Track Your Usage

Check remaining requests:
- Visit [Hunter.io Dashboard](https://hunter.io/api-keys)
- API responses include usage: `"available": 48, "used": 2`

## 🚀 Ready to Scale?

Upgrade plans for more requests:
- **Starter**: $49/mo → 500 requests
- **Growth**: $99/mo → 2,500 requests
- **Business**: $199/mo → 10,000 requests

---

**Questions?** Check `docs/HUNTER_EMAIL_ENRICHMENT.md` for detailed documentation!
