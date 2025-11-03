# Lead Generation MVP

An internal lead generation platform built with Next.js and MongoDB, similar to Apollo.io.

## Features

- 🏢 **Company Management** - Store and manage company/organization data
- � **Contact Management** - Track individual contacts with company relationships
- �📊 **Lead Database** - Store and manage leads with comprehensive information (legacy)
- 🔍 **Search & Filter** - Advanced filtering by status, company, tags, and more
- 📥 **Import Data** - Manual entry or bulk CSV import for companies and contacts
- 🏷️ **Tags & Lists** - Organize contacts/companies with custom tags and lists
- ✨ **Email Enrichment** - Verify and enrich emails using Hunter.io API
- 📧 **Email Outreach** - Send personalized emails to contacts
- 📈 **Status Tracking** - Track contact status from new to converted
- 🔗 **Relationships** - Link contacts to companies (Apollo.io-style)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB with Mongoose ODM
- **APIs**: Hunter.io (email enrichment), Nodemailer (email outreach)

## Getting Started

### Prerequisites

- Node.js 16+ installed
- MongoDB installed locally or MongoDB Atlas account
- Hunter.io API key (optional, for email enrichment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Edit `.env.local` and configure:
```env
MONGODB_URI=mongodb://localhost:27017/leadgen
# Or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/leadgen

HUNTER_API_KEY=your_hunter_api_key_here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Start MongoDB (if using local installation):
```bash
mongod
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
my-leads-app/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── companies/  # Company CRUD, search
│   │   │   ├── contacts/   # Contact CRUD, search, import
│   │   │   ├── leads/      # Lead CRUD (legacy)
│   │   │   ├── lists/      # List management
│   │   │   ├── tags/       # Tag management
│   │   │   └── email/      # Email sending
│   │   ├── leads/        # Leads pages
│   │   ├── import/       # Import page
│   │   ├── lists/        # Lists pages
│   │   └── page.tsx      # Home page
│   ├── lib/
│   │   └── mongodb.ts    # MongoDB connection
│   └── models/           # Mongoose schemas
│       ├── Company.ts    # NEW: Organization data
│       ├── Contact.ts    # NEW: Person with company reference
│       ├── Lead.ts       # Legacy lead model
│       ├── List.ts       # Enhanced with contacts/companies
│       └── Tag.ts        # Tag system
├── .env.local            # Environment variables
├── DATA_MODELS.md        # Data model documentation
├── API_TESTING.md        # API testing guide
└── package.json
```

## New Utilities

### API Helpers (`src/lib/apiHelpers.ts`)

Reusable utilities for cleaner API routes:
- **Response Helpers**: `successResponse()`, `errorResponse()`
- **Error Handling**: `handleMongoError()` - automatic MongoDB error detection
- **Pagination**: `getPaginationParams()`, `calculatePagination()`
- **Query Building**: `buildQuery()`, `buildSearchQuery()`, `buildFilterQuery()`
- **Validation**: `validateRequiredFields()`, `isValidObjectId()`, `getValidObjectId()`
- **Data Sanitization**: `sanitizeInput()`

See `REFACTOR_EXAMPLE.md` for usage examples and migration guide.

### Health Check Endpoint

Check API and database status:
```bash
GET /api/health
```

Returns:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 12345,
    "environment": "development",
    "database": {
      "connected": true,
      "readyState": "connected",
      "name": "leadgen"
    },
    "api": {
      "version": "1.0.0",
      "routes": [...]
    }
  }
}
```

## API Endpoints

### Companies (NEW)
- `GET /api/companies` - List companies (with filters)
- `POST /api/companies` - Create a company
- `GET /api/companies/[id]` - Get a single company
- `PUT /api/companies/[id]` - Update a company
- `DELETE /api/companies/[id]` - Delete a company

### Contacts (NEW)
- `GET /api/contacts` - List contacts (with filters & company population)
- `POST /api/contacts` - Create a contact
- `GET /api/contacts/[id]` - Get a single contact
- `PUT /api/contacts/[id]` - Update a contact
- `DELETE /api/contacts/[id]` - Delete a contact
- `POST /api/contacts/import` - Bulk import contacts

### Leads (Legacy)
- `GET /api/leads` - Get all leads (with pagination & filters)
- `POST /api/leads` - Create a new lead
- `GET /api/leads/[id]` - Get a single lead
- `PUT /api/leads/[id]` - Update a lead
- `DELETE /api/leads/[id]` - Delete a lead
- `POST /api/leads/import` - Bulk import leads
- `POST /api/leads/enrich` - Enrich lead with Hunter.io

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create a new list
- `GET /api/lists/[id]` - Get a single list
- `PUT /api/lists/[id]` - Update a list
- `DELETE /api/lists/[id]` - Delete a list

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create a new tag

### Email
- `POST /api/email/send` - Send email to leads

## Usage

### Adding Leads

1. **Manual Entry**: Navigate to Import → Manual Entry tab
2. **CSV Import**: Navigate to Import → CSV Import tab and paste CSV data

### Organizing Leads

- Create custom lists from the Lists page
- Add tags to categorize leads
- Filter leads by status, company, or tags

### Email Enrichment

1. View a lead detail page
2. Click the "Enrich" button
3. The system will verify the email and add enrichment data

### Email Outreach

Use the email API to send personalized emails to selected leads with template variables:
- `{{firstName}}` - Lead's first name
- `{{lastName}}` - Lead's last name
- `{{company}}` - Lead's company

## Deploy on Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

For MongoDB, use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier.

## Future Enhancements

- [ ] Chrome extension for capturing leads
- [ ] Web scraping functionality with Playwright
- [ ] Email campaign sequences
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Lead scoring algorithm
- [ ] Integration with CRMs

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Hunter.io API](https://hunter.io/api-documentation)
