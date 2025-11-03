# Development Tips & Best Practices

## 🛠️ Development Workflow

### Running the App

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check TypeScript types
npm run lint
```

### MongoDB Management

**Local MongoDB:**
```bash
# Start MongoDB
mongod

# Connect with mongo shell
mongosh

# View databases
show dbs

# Use leadgen database
use leadgen

# View collections
show collections

# Query leads
db.leads.find().pretty()

# Count leads
db.leads.countDocuments()

# Drop database (careful!)
db.dropDatabase()
```

**MongoDB Compass (GUI):**
- Download: https://www.mongodb.com/products/compass
- Connect: `mongodb://localhost:27017`
- Visual query builder and data viewer

## 🔍 Testing APIs

### Using VS Code REST Client

Create `test.http` file:

```http
### Get all leads
GET http://localhost:3000/api/leads

### Create a lead
POST http://localhost:3000/api/leads
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "company": "Test Corp",
  "title": "Engineer"
}

### Get single lead (replace with actual ID)
GET http://localhost:3000/api/leads/6734a8b9c2d1e3f4a5b6c7d8

### Update lead
PUT http://localhost:3000/api/leads/6734a8b9c2d1e3f4a5b6c7d8
Content-Type: application/json

{
  "status": "contacted"
}

### Import leads
POST http://localhost:3000/api/leads/import
Content-Type: application/json

{
  "leads": [
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "company": "Example Inc"
    }
  ]
}

### Enrich lead
POST http://localhost:3000/api/leads/enrich
Content-Type: application/json

{
  "leadId": "6734a8b9c2d1e3f4a5b6c7d8",
  "email": "test@example.com"
}
```

### Using curl

```bash
# Get leads
curl http://localhost:3000/api/leads

# Create lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'

# Search leads
curl "http://localhost:3000/api/leads?search=john&status=new"
```

## 🎨 UI Customization

### Tailwind Classes Reference

**Colors:**
- Primary: `bg-blue-600`, `text-blue-600`, `border-blue-600`
- Success: `bg-green-600`, `text-green-600`
- Warning: `bg-yellow-600`, `text-yellow-600`
- Danger: `bg-red-600`, `text-red-600`

**Common Patterns:**
```tsx
// Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">

// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Badge
<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
```

### Adding New Status Colors

Edit `src/app/leads/page.tsx`:

```typescript
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800',
    // Add your custom status here
    nurturing: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
```

## 📝 Common Modifications

### Adding New Fields to Lead Model

1. Update schema in `src/models/Lead.ts`:
```typescript
export interface ILead extends Document {
  // ... existing fields
  customField?: string;  // Add new field
}

const LeadSchema: Schema = new Schema({
  // ... existing fields
  customField: { type: String },  // Add to schema
});
```

2. Update TypeScript interfaces in pages
3. Add to forms and display components

### Creating New API Route

1. Create file: `src/app/api/your-route/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: 'your data' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### Adding New Page

1. Create: `src/app/your-page/page.tsx`
```typescript
export default function YourPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Your Page</h1>
      </div>
    </div>
  );
}
```

2. Add navigation link in other pages

## 🐛 Debugging Tips

### View Server Logs

Terminal running `npm run dev` shows:
- API route execution
- MongoDB queries
- Error stack traces

### Browser DevTools

- **Network tab**: View API requests/responses
- **Console**: Check client-side errors
- **React DevTools**: Inspect component state

### Common Issues

**"Cannot find module":**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**MongoDB connection timeout:**
```typescript
// Check in src/lib/mongodb.ts
// Increase timeout in connection options
{
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
}
```

**TypeScript errors:**
```bash
# Check types
npx tsc --noEmit

# Fix auto-fixable issues
npm run lint -- --fix
```

## 📊 Database Indexes

Already created indexes for performance:
- Lead email (unique)
- Lead status
- Lead company
- Text search on firstName, lastName, company

Add more indexes if needed:
```typescript
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ 'enrichmentData.score': -1 });
```

## 🔐 Environment Variables

**Never commit secrets!**

Always use:
- `.env.local` for local development (gitignored)
- Vercel dashboard for production
- `NEXT_PUBLIC_` prefix for client-side variables

## 🚀 Performance Tips

1. **Pagination**: Already implemented, adjust `limit` as needed
2. **Indexes**: Add for frequently queried fields
3. **Caching**: Consider Redis for production
4. **Images**: Use Next.js Image component
5. **API Routes**: Keep response sizes small

## 📚 Useful Commands

```bash
# Check bundle size
npm run build

# Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Format code (if prettier installed)
npx prettier --write .

# Update dependencies
npm update

# Check for security issues
npm audit
```

## 🎯 Next Steps for Development

1. **Add Authentication**
   - NextAuth.js for user login
   - Protect API routes
   - User-specific leads

2. **Add File Upload**
   - Use FormData for CSV files
   - Store files in cloud storage

3. **Add Real-time Updates**
   - WebSockets or Server-Sent Events
   - Live lead status updates

4. **Add Tests**
   - Jest for unit tests
   - Playwright for E2E tests

5. **Add Analytics**
   - Track user actions
   - Lead conversion metrics
   - Dashboard with charts

## 💡 Pro Tips

- Use TypeScript strict mode for better type safety
- Keep API routes thin, move logic to services
- Use React hooks for state management
- Implement error boundaries for resilience
- Add loading states for better UX
- Use optimistic updates for instant feedback
- Cache API responses when appropriate
- Implement proper error logging
- Add request validation middleware
- Use environment-specific configs

---

Happy coding! 🚀
