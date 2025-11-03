# Quick Start Guide

## For New Developers

Welcome to the Lead Generation MVP! This guide will get you up and running in 5 minutes.

### Step 1: Environment Setup (2 minutes)

1. **Install dependencies**:
   ```powershell
   npm install
   ```

2. **Configure environment** - Edit `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/leadgen
   HUNTER_API_KEY=your_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start MongoDB** (if using local):
   ```powershell
   mongod
   ```

### Step 2: Start Development Server (1 minute)

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 3: Verify Everything Works (2 minutes)

**Option A: Automated Testing** (Recommended)
```powershell
.\scripts\test-api.ps1
```

**Option B: Manual Health Check**
```powershell
curl http://localhost:3000/api/health
```

**Option C: Browse the UI**
- Visit http://localhost:3000
- Navigate to "Import Leads"
- Try adding a test company or contact

---

## What Can You Do?

### 🏢 Manage Companies
- Create organizations/businesses
- Track company details (name, industry, size, location)
- Add tags and enrichment data
- Search and filter companies

**API**: `POST /api/companies`, `GET /api/companies`, etc.  
**Frontend**: Coming soon (APIs ready!)

### 👥 Manage Contacts
- Create individual people/contacts
- Link contacts to companies
- Track status (new → contacted → qualified → converted)
- Bulk import from CSV

**API**: `POST /api/contacts`, `GET /api/contacts`, etc.  
**Frontend**: Coming soon (APIs ready!)

### 📋 Organize with Lists
- Create campaigns or segments
- Add contacts and companies to lists
- Manage multiple lists

**API**: `POST /api/lists`, `GET /api/lists`  
**Frontend**: `/lists` page

### 🏷️ Tag Everything
- Create custom tags
- Apply tags to companies, contacts, and lists
- Filter by tags

**API**: `POST /api/tags`, `GET /api/tags`  
**Frontend**: Integrated in other pages

### 📧 Email Outreach
- Send personalized emails
- Use template variables
- Track email sends

**API**: `POST /api/email/send`  
**Frontend**: Coming soon

---

## Project Structure

```
my-leads-app/
├── src/
│   ├── app/
│   │   ├── api/              # All API endpoints
│   │   │   ├── companies/    # Company CRUD
│   │   │   ├── contacts/     # Contact CRUD + import
│   │   │   ├── leads/        # Legacy leads
│   │   │   ├── lists/        # List management
│   │   │   ├── tags/         # Tag system
│   │   │   ├── email/        # Email sending
│   │   │   └── health/       # Health check
│   │   ├── leads/            # Leads UI
│   │   ├── import/           # Import UI
│   │   ├── lists/            # Lists UI
│   │   └── page.tsx          # Homepage
│   ├── lib/
│   │   ├── mongodb.ts        # Database connection
│   │   └── apiHelpers.ts     # API utilities (NEW!)
│   └── models/               # Mongoose schemas
│       ├── Company.ts        # Organization data
│       ├── Contact.ts        # Person with company reference
│       ├── Lead.ts           # Legacy leads
│       ├── List.ts           # Campaign lists
│       └── Tag.ts            # Tags
├── scripts/
│   ├── test-api.js           # Automated API tests
│   └── test-api.ps1          # PowerShell test wrapper
└── Documentation files (see below)
```

---

## Key Files to Read

### For Getting Started
1. **README.md** - Complete overview and setup
2. **SETUP.md** - Detailed setup instructions
3. **This file** (QUICK_START.md) - You're reading it!

### For Development
4. **DATA_MODELS.md** - Understand the data structure
5. **API_TESTING.md** - Test all endpoints
6. **DEV_GUIDE.md** - Development tips and tricks
7. **REFACTOR_EXAMPLE.md** - Use API helpers (NEW!)

### For Reference
8. **ARCHITECTURE.md** - Visual diagrams
9. **MODELS_SUMMARY.md** - Model implementation details
10. **CHECKLIST.md** - Implementation status
11. **UPDATES_SUMMARY.md** - Latest features (NEW!)

### For Deployment
12. **DEPLOYMENT.md** - Deploy to Vercel
13. **PROJECT_SUMMARY.md** - Complete project overview

---

## Common Tasks

### Create a Company
```typescript
// API call
POST /api/companies
Content-Type: application/json

{
  "name": "Acme Corp",
  "industry": "Technology",
  "location": "San Francisco",
  "size": "51-200",
  "website": "https://acme.com"
}
```

### Create a Contact (with Company)
```typescript
// API call
POST /api/contacts
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@acme.com",
  "title": "CEO",
  "company": "COMPANY_ID_HERE"
}
```

### Search Contacts
```typescript
GET /api/contacts?search=john&status=new&page=1&limit=20
```

### Import Contacts from CSV
```typescript
POST /api/contacts/import
Content-Type: application/json

[
  { "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com" },
  { "firstName": "Bob", "lastName": "Johnson", "email": "bob@example.com" }
]
```

---

## Using the New API Helpers

Instead of writing repetitive code, use the new helper utilities:

### Before
```typescript
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    // ... 40+ lines of query building and error handling
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### After (with helpers)
```typescript
import { successResponse, handleMongoError, getPaginationParams, buildQuery } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { page, limit } = getPaginationParams(searchParams);
    const query = buildQuery(searchParams, {
      searchFields: ['name', 'email'],
      filterFields: ['status', 'company']
    });
    
    const [total, items] = await Promise.all([
      Model.countDocuments(query),
      Model.find(query).skip((page - 1) * limit).limit(limit)
    ]);
    
    return successResponse({ items }, calculatePagination(page, limit, total));
  } catch (error: any) {
    return handleMongoError(error);
  }
}
```

**Result**: 60% less code, better error handling, consistent responses!

See `REFACTOR_EXAMPLE.md` for complete guide.

---

## Testing

### Run All Tests Automatically
```powershell
.\scripts\test-api.ps1
```

This tests:
- ✅ Health check
- ✅ Company CRUD
- ✅ Contact CRUD
- ✅ Search and filtering
- ✅ Bulk import
- ✅ Tags and Lists

### Manual Testing
Follow `API_TESTING.md` for detailed HTTP requests.

### Check Health Status
```powershell
curl http://localhost:3000/api/health
```

---

## Next Steps

### For Backend Development
1. ✅ Models created (Company, Contact, Lead, List, Tag)
2. ✅ APIs implemented (all CRUD operations)
3. ✅ Utilities added (API helpers)
4. ⏳ Refactor existing routes with helpers (optional)
5. ⏳ Add authentication/authorization
6. ⏳ Add rate limiting

### For Frontend Development
1. ✅ Homepage built
2. ✅ Leads pages built
3. ✅ Import page built
4. ✅ Lists page built
5. ⏳ Build Companies UI
6. ⏳ Build Contacts UI
7. ⏳ Build Email campaign UI

### For Data
1. ✅ Sample CSV files provided
2. ⏳ Import sample data
3. ⏳ Set up enrichment with Hunter.io
4. ⏳ Configure email sending

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB with `mongod` or check your `MONGODB_URI` in `.env.local`

### TypeScript Errors
**Solution**: All code compiles cleanly. Run `npm run build` to verify.

### Health Check Fails
**Solution**: Make sure dev server is running (`npm run dev`)

### Import Fails
**Solution**: Check that your CSV has the correct columns (see `sample-contacts.csv`)

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Need Help?

1. Check the relevant documentation file (listed above)
2. Run automated tests to verify setup
3. Check health endpoint for system status
4. Review example code in `REFACTOR_EXAMPLE.md`

---

**Ready to start building?** 🚀

Run `npm run dev` and visit http://localhost:3000
