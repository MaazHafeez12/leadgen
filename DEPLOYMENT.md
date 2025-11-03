# Deployment Guide - Vercel

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)

## Step 1: Set up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (M0 Sandbox)
3. Create database user:
   - Database Access → Add New Database User
   - Choose Password authentication
   - Save username and password
4. Whitelist IP addresses:
   - Network Access → Add IP Address
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `leadgen`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/leadgen?retryWrites=true&w=majority`

## Step 2: Push to GitHub

```bash
cd my-leads-app
git init
git add .
git commit -m "Initial commit - Lead Generation MVP"
git branch -M main
git remote add origin https://github.com/yourusername/lead-gen-mvp.git
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 4: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/leadgen?retryWrites=true&w=majority
HUNTER_API_KEY=your_hunter_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

## Step 5: Deploy

Click "Deploy" - Vercel will build and deploy your app automatically.

## Post-Deployment

### Custom Domain (Optional)

1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Monitor Deployment

- View deployment logs in Vercel dashboard
- Check function logs for API routes
- Monitor MongoDB Atlas metrics

### Update Deployment

Any push to `main` branch will automatically deploy:

```bash
git add .
git commit -m "Update feature"
git push
```

## Vercel Configuration

The project automatically configures for Vercel, but you can customize with `vercel.json`:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri"
  }
}
```

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors locally first

**MongoDB Connection Issues:**
- Verify connection string
- Check IP whitelist (use 0.0.0.0/0 for all IPs)
- Ensure database user has correct permissions

**API Routes Timeout:**
- Increase function timeout in vercel.json
- Optimize database queries
- Add indexes to MongoDB collections

**Environment Variables Not Working:**
- Redeploy after adding variables
- Check variable names match exactly
- Use NEXT_PUBLIC_ prefix for client-side variables

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Custom domain added (optional)
- [ ] Hunter.io API key added
- [ ] Email SMTP configured
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Set up alerts in Vercel

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Monitor API usage** to prevent abuse
5. **Enable rate limiting** for production

## Cost Estimation

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited API requests
- 100 GB-hours compute

**MongoDB Atlas:**
- 512 MB storage
- Shared RAM
- No backup

**Hunter.io:**
- 50 requests/month free
- Upgrade for more

**Gmail SMTP:**
- 500 emails/day free
- Consider SendGrid/Mailgun for scale

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
