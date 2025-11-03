# Search and Filtering Interface

This document describes the enhanced search and filtering capabilities in the LeadGen MVP application.

## Overview

Both the **Companies** and **Contacts** pages feature comprehensive search and filtering interfaces that allow users to narrow down results based on multiple criteria. Filters are sent as query parameters to the API routes and processed server-side using MongoDB queries.

---

## Companies Page Filters

### Available Filters

1. **Global Search** (Text Input)
   - Searches across: Company Name, Industry, Location
   - Case-insensitive regex matching
   - Query param: `search`

2. **Industry** (Text Input)
   - Filter by specific industry
   - Case-insensitive regex matching
   - Query param: `industry`
   - Example: "Technology", "Healthcare", "Finance"

3. **Location/Region** (Text Input)
   - Filter by location or region
   - Case-insensitive regex matching
   - Query param: `location`
   - Example: "San Francisco", "EU", "New York"

4. **Company Size** (Dropdown)
   - Filter by employee count range
   - Exact match
   - Query param: `size`
   - Options:
     - 1-10 employees
     - 11-50 employees
     - 51-200 employees
     - 201-500 employees
     - 501-1000 employees
     - 1001-5000 employees
     - 5000+ employees

5. **Tag** (Dropdown)
   - Filter by assigned tags
   - Exact match
   - Query param: `tag`
   - Dynamically populated from Tags API

### UI Features

- **Collapsible Filters**: Click "Filters" button to show/hide advanced filters
- **Active Filter Counter**: Shows how many filters are currently applied
- **Clear All**: One-click to reset all filters
- **Results Summary**: Displays "Showing X of Y companies"
- **Pagination**: Navigate through filtered results

### API Endpoint

```
GET /api/companies?search=tech&industry=technology&location=SF&size=51-200&tag=enterprise&page=1&limit=20
```

### Backend Implementation

```typescript
// In /api/companies/route.ts
const query: any = {};

// Global search
if (search) {
  query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { industry: { $regex: search, $options: 'i' } },
    { location: { $regex: search, $options: 'i' } },
  ];
}

// Specific filters
if (industry) query.industry = { $regex: industry, $options: 'i' };
if (location) query.location = { $regex: location, $options: 'i' };
if (size) query.size = size;
if (tag) query.tags = tag;

const companies = await Company.find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
```

---

## Contacts Page Filters

### Available Filters

1. **Global Search** (Text Input)
   - Searches across: First Name, Last Name, Email, Job Title
   - Case-insensitive regex matching
   - Query param: `search`

2. **Job Title** (Text Input)
   - Filter by job title/position
   - Case-insensitive regex matching
   - Query param: `title`
   - Example: "CEO", "CTO", "Manager", "Director"

3. **Status** (Dropdown)
   - Filter by contact status
   - Exact match
   - Query param: `status`
   - Options:
     - New
     - Contacted
     - Qualified
     - Unqualified
     - Converted

4. **Company** (Dropdown)
   - Filter by associated company
   - Exact match (ObjectId)
   - Query param: `company`
   - Dynamically populated from Companies API

5. **Tag** (Dropdown)
   - Filter by assigned tags
   - Exact match
   - Query param: `tag`
   - Dynamically populated from Tags API

### UI Features

- **Collapsible Filters**: Click "Filters" button to show/hide advanced filters
- **Active Filter Counter**: Shows how many filters are currently applied
- **Clear All**: One-click to reset all filters
- **Results Summary**: Displays "Showing X of Y contacts"
- **Status Badges**: Color-coded status indicators in results
- **Pagination**: Navigate through filtered results

### API Endpoint

```
GET /api/contacts?search=john&title=ceo&status=qualified&company=12345&tag=decision-maker&page=1&limit=20
```

### Backend Implementation

```typescript
// In /api/contacts/route.ts
const query: any = {};

// Global search
if (search) {
  query.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { title: { $regex: search, $options: 'i' } },
  ];
}

// Specific filters
if (status) query.status = status;
if (title) query.title = { $regex: title, $options: 'i' };
if (company) query.company = company; // ObjectId
if (tag) query.tags = tag;

const contacts = await Contact.find(query)
  .populate('company')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
```

---

## Usage Examples

### Example 1: Find Tech Companies in San Francisco

**Frontend:**
```typescript
// User inputs
search: ""
industry: "Technology"
location: "San Francisco"
size: "51-200"
tag: ""

// API Request
GET /api/companies?industry=Technology&location=San Francisco&size=51-200&page=1&limit=20
```

### Example 2: Find Qualified CTOs at Specific Company

**Frontend:**
```typescript
// User inputs
search: ""
title: "CTO"
status: "qualified"
company: "507f1f77bcf86cd799439011"
tag: ""

// API Request
GET /api/contacts?title=CTO&status=qualified&company=507f1f77bcf86cd799439011&page=1&limit=20
```

### Example 3: Global Search with Multiple Filters

**Frontend:**
```typescript
// User inputs
search: "enterprise"
industry: "SaaS"
location: "EU"
size: "1001-5000"
tag: "enterprise"

// API Request
GET /api/companies?search=enterprise&industry=SaaS&location=EU&size=1001-5000&tag=enterprise&page=1&limit=20
```

---

## Technical Implementation

### Frontend State Management

```typescript
// Companies Page
const [search, setSearch] = useState('');
const [industry, setIndustry] = useState('');
const [location, setLocation] = useState('');
const [size, setSize] = useState('');
const [tag, setTag] = useState('');

// Trigger fetch on filter change
useEffect(() => {
  fetchCompanies();
}, [pagination.page, search, industry, location, size, tag]);
```

### Dynamic Filter Population

```typescript
// Fetch available tags
const fetchAvailableTags = async () => {
  const response = await fetch('/api/tags');
  const result = await response.json();
  if (result.success && result.data) {
    setAvailableTags(result.data.map((t: any) => t.name));
  }
};

// Fetch companies for dropdown
const fetchCompanies = async () => {
  const response = await fetch('/api/companies?limit=1000');
  const result = await response.json();
  if (result.success && result.data) {
    setCompanies(result.data);
  }
};
```

### Query Building

```typescript
const params = new URLSearchParams({
  page: pagination.page.toString(),
  limit: pagination.limit.toString(),
});

if (search) params.append('search', search);
if (industry) params.append('industry', industry);
if (location) params.append('location', location);
if (size) params.append('size', size);
if (tag) params.append('tag', tag);

const response = await fetch(`/api/companies?${params.toString()}`);
```

---

## Performance Considerations

### MongoDB Indexes

To optimize search and filtering performance, ensure indexes are created:

```typescript
// In Company.ts model
companySchema.index({ name: 'text', industry: 'text', location: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });
companySchema.index({ size: 1 });
companySchema.index({ tags: 1 });

// In Contact.ts model
contactSchema.index({ firstName: 'text', lastName: 'text', email: 'text', title: 'text' });
contactSchema.index({ status: 1 });
contactSchema.index({ title: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ tags: 1 });
```

### Pagination

- Default limit: 20 records per page
- Maximum recommended: 100 records per page
- Total count calculated for pagination controls

### Filter Loading

- Tags and Companies are loaded once on component mount
- Cached in component state for dropdown population
- Reduces API calls during user interaction

---

## UI/UX Best Practices

### Visual Feedback

1. **Loading States**: Spinner shown while fetching data
2. **Empty States**: Helpful messages when no results found
3. **Active Filter Indicator**: Badge showing number of active filters
4. **Clear Filters**: Prominent button to reset all filters

### Accessibility

- All inputs have proper labels
- Keyboard navigation supported
- Form submit on Enter key
- Semantic HTML elements

### Responsive Design

- Grid layout adapts to screen size:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 4 columns
- Filter panel collapses on mobile
- Table scrolls horizontally on small screens

---

## Future Enhancements

### Potential Improvements

1. **URL Query Sync**: Reflect filters in browser URL for shareable links
2. **Saved Filters**: Save frequently used filter combinations
3. **Advanced Search**: Boolean operators (AND/OR), exact match, exclude
4. **Date Range Filters**: Filter by created/updated date
5. **Multi-Select**: Select multiple tags or statuses
6. **Auto-Complete**: Suggestions as user types in text inputs
7. **Export Filtered Results**: Download CSV of current filtered view
8. **Filter Presets**: Quick filters like "My Leads", "Hot Leads", "Follow-up"

### MongoDB Text Search

For more advanced full-text search:

```typescript
// Create text index
companySchema.index({ name: 'text', industry: 'text', description: 'text' });

// Use $text operator
if (search) {
  query.$text = { $search: search };
}
```

---

## Troubleshooting

### Common Issues

**Issue**: Filters not applying
- **Solution**: Check browser console for API errors
- **Solution**: Verify query params in Network tab

**Issue**: Dropdown showing no options
- **Solution**: Check if Tags API is returning data
- **Solution**: Verify Companies API is accessible

**Issue**: Slow filtering performance
- **Solution**: Add MongoDB indexes (see Performance section)
- **Solution**: Reduce limit parameter if fetching too many records

**Issue**: Pagination broken after filtering
- **Solution**: Ensure `page` resets to 1 when filters change

---

## Related Files

### Frontend
- `/src/app/companies/page.tsx` - Companies list with filters
- `/src/app/contacts/page.tsx` - Contacts list with filters

### Backend
- `/src/app/api/companies/route.ts` - Companies API with query building
- `/src/app/api/contacts/route.ts` - Contacts API with query building
- `/src/app/api/tags/route.ts` - Tags API for filter dropdowns

### Models
- `/src/models/Company.ts` - Company schema with indexes
- `/src/models/Contact.ts` - Contact schema with indexes
- `/src/models/Tag.ts` - Tag schema

---

## Testing

### Manual Testing Checklist

- [ ] Global search returns relevant results
- [ ] Industry filter works correctly
- [ ] Location filter works correctly
- [ ] Size dropdown filters properly
- [ ] Tag dropdown filters properly
- [ ] Status filter works for contacts
- [ ] Job title filter works for contacts
- [ ] Company filter works for contacts
- [ ] Multiple filters work together (AND logic)
- [ ] Clear filters resets all inputs
- [ ] Pagination works with active filters
- [ ] Results count displays correctly
- [ ] Empty state shows when no results
- [ ] Collapsible filters toggle correctly
- [ ] Active filter counter updates

### API Testing

```bash
# Test Companies API
curl "http://localhost:3000/api/companies?search=tech&industry=technology&page=1&limit=20"

# Test Contacts API
curl "http://localhost:3000/api/contacts?search=john&status=qualified&title=ceo&page=1&limit=20"

# Test Tags API
curl "http://localhost:3000/api/tags"
```

---

## Summary

The search and filtering interface provides users with powerful tools to find relevant companies and contacts quickly. The implementation uses:

- **Frontend**: React state, useEffect for reactive updates, URLSearchParams for query building
- **Backend**: MongoDB regex queries, exact match filters, pagination support
- **UI**: Tailwind CSS, collapsible sections, responsive grid layouts
- **UX**: Clear filters, active count, loading states, empty states

This creates a smooth, Apollo.io-style filtering experience that scales to large databases.
