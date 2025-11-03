# Search and Filtering Features - Quick Reference

## 📊 Companies Page Filters

```
┌─────────────────────────────────────────────────────────────────┐
│  Companies                                     [+ Add Company]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔍 [Search companies by name, industry...]  [Filters ▼] [Search]│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Advanced Filters (Collapsible)                           │   │
│  ├──────────────┬──────────────┬──────────────┬────────────┤   │
│  │ Industry     │ Location/    │ Company Size │ Tag        │   │
│  │ [text input] │ Region       │ [dropdown]   │ [dropdown] │   │
│  │              │ [text input] │              │            │   │
│  ├──────────────┴──────────────┴──────────────┴────────────┤   │
│  │ 3 filter(s) active              [Clear all filters]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Showing 15 of 150 companies                                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Company        Industry    Location    Size      Tags    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Acme Corp      Technology   SF          51-200   [tag1] │   │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Previous]  Page 1 of 8  [Next]                                │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Capabilities

| Filter          | Type     | API Param    | Search Method      |
|-----------------|----------|-------------|--------------------|
| Global Search   | Text     | `search`    | Regex (name, industry, location) |
| Industry        | Text     | `industry`  | Regex              |
| Location/Region | Text     | `location`  | Regex              |
| Company Size    | Dropdown | `size`      | Exact match        |
| Tag             | Dropdown | `tag`       | Exact match        |

---

## 👥 Contacts Page Filters

```
┌─────────────────────────────────────────────────────────────────┐
│  Contacts                                      [+ Add Contact]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔍 [Search by name, email, title...]  [Filters ▼] [Search]     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Advanced Filters (Collapsible)                           │   │
│  ├──────────────┬──────────────┬──────────────┬────────────┤   │
│  │ Job Title    │ Status       │ Company      │ Tag        │   │
│  │ [text input] │ [dropdown]   │ [dropdown]   │ [dropdown] │   │
│  │              │              │              │            │   │
│  ├──────────────┴──────────────┴──────────────┴────────────┤   │
│  │ 4 filter(s) active              [Clear all filters]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Showing 23 of 450 contacts                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name        Title    Company    Email        Status      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ John Doe    CEO      Acme Corp  john@...    [Qualified] │   │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Previous]  Page 1 of 23  [Next]                               │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Capabilities

| Filter          | Type     | API Param    | Search Method      |
|-----------------|----------|-------------|--------------------|
| Global Search   | Text     | `search`    | Regex (firstName, lastName, email, title) |
| Job Title       | Text     | `title`     | Regex              |
| Status          | Dropdown | `status`    | Exact match        |
| Company         | Dropdown | `company`   | Exact match (ObjectId) |
| Tag             | Dropdown | `tag`       | Exact match        |

---

## 🎯 Key Features Implemented

### ✅ Frontend Enhancements

1. **Dynamic Filter Population**
   - Tags dropdown: Fetches from `/api/tags`
   - Companies dropdown: Fetches from `/api/companies?limit=1000`
   - Loaded once on component mount

2. **Active Filter Counter**
   - Shows "X filter(s) active" when filters applied
   - Visual feedback for user

3. **Responsive Grid Layout**
   - Mobile: 1 column
   - Tablet: 2 columns  
   - Desktop: 4 columns

4. **Collapsible Filter Panel**
   - Toggle with "Filters" button
   - Saves screen space

5. **Clear All Functionality**
   - Resets all filter inputs
   - Returns to page 1

### ✅ Backend Enhancements

1. **Enhanced API Query Building**
   ```typescript
   // Companies API supports
   ?search=tech&industry=technology&location=SF&size=51-200&tag=enterprise
   
   // Contacts API supports
   ?search=john&title=ceo&status=qualified&company=123&tag=decision-maker
   ```

2. **Multiple Search Methods**
   - **Regex**: Flexible text matching (case-insensitive)
   - **Exact Match**: Precise filtering for dropdowns

3. **Efficient Queries**
   - Pagination support (page, limit)
   - Sort by `createdAt` descending
   - Population for related data (company in contacts)

---

## 📝 Usage Examples

### Example 1: Find Tech Companies in San Francisco (51-200 employees)

**Steps:**
1. Click "Filters" button
2. Enter "Technology" in Industry field
3. Enter "San Francisco" in Location field
4. Select "51-200 employees" from Size dropdown
5. Click "Search"

**API Call:**
```
GET /api/companies?industry=Technology&location=San Francisco&size=51-200&page=1&limit=20
```

---

### Example 2: Find Qualified CTOs at Specific Company

**Steps:**
1. Click "Filters" button
2. Enter "CTO" in Job Title field
3. Select "Qualified" from Status dropdown
4. Select company from Company dropdown
5. Click "Search"

**API Call:**
```
GET /api/contacts?title=CTO&status=qualified&company=507f1f77bcf86cd799439011&page=1&limit=20
```

---

### Example 3: Find All Companies Tagged "Enterprise"

**Steps:**
1. Click "Filters" button
2. Select "enterprise" from Tag dropdown
3. Click "Search"

**API Call:**
```
GET /api/companies?tag=enterprise&page=1&limit=20
```

---

## 🔄 Filter Logic

### AND Logic (All Filters)

All filters are combined with AND logic:
- Global search AND Industry AND Location AND Size AND Tag
- Results must match ALL active filters

### OR Logic (Within Global Search)

Global search uses OR logic within fields:
- Search "tech" finds matches in name OR industry OR location

### MongoDB Query Example

```typescript
const query = {
  $or: [                              // Global search (OR)
    { name: { $regex: 'tech', $options: 'i' } },
    { industry: { $regex: 'tech', $options: 'i' } },
    { location: { $regex: 'tech', $options: 'i' } }
  ],
  industry: { $regex: 'SaaS', $options: 'i' },  // Specific filter (AND)
  location: { $regex: 'EU', $options: 'i' },     // Specific filter (AND)
  size: '51-200',                                // Exact match (AND)
  tags: 'enterprise'                             // Exact match (AND)
};
```

---

## 🚀 Performance Tips

### Recommended MongoDB Indexes

```typescript
// Companies
companySchema.index({ name: 'text', industry: 'text', location: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });
companySchema.index({ size: 1 });
companySchema.index({ tags: 1 });

// Contacts
contactSchema.index({ firstName: 'text', lastName: 'text', email: 'text', title: 'text' });
contactSchema.index({ status: 1 });
contactSchema.index({ title: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ tags: 1 });
```

### Pagination Settings

- **Default**: 20 records per page
- **Maximum**: 100 records per page (adjustable)
- **Client-side**: Resets to page 1 when filters change

---

## 📦 Files Modified

### Frontend
- ✅ `src/app/companies/page.tsx` - Added tag filter, enhanced UI
- ✅ `src/app/contacts/page.tsx` - Added title, company, tag filters

### Backend
- ✅ `src/app/api/contacts/route.ts` - Added title filter support

### Documentation
- ✅ `docs/SEARCH_AND_FILTERS.md` - Comprehensive guide

---

## 🎨 UI/UX Highlights

### Visual Feedback
- ⏳ Loading spinner during data fetch
- 📊 Results count: "Showing X of Y"
- 🔢 Active filter counter
- 📭 Empty state with helpful message

### Accessibility
- 🏷️ Proper labels on all inputs
- ⌨️ Keyboard navigation support
- 📝 Semantic HTML elements
- 🎯 Form submit on Enter key

### Responsive Design
- 📱 Mobile-first approach
- 📐 Flexible grid layouts
- 👆 Touch-friendly controls
- 🌊 Horizontal scroll for tables

---

## ✨ Next Steps (Optional Enhancements)

1. **URL Query Sync** - Reflect filters in browser URL
2. **Saved Filters** - Save frequently used combinations
3. **Multi-Select** - Select multiple tags/statuses
4. **Date Range Filters** - Filter by created/updated dates
5. **Export Filtered Results** - Download CSV of current view
6. **Auto-Complete** - Suggestions as user types
7. **Filter Presets** - Quick filters like "My Leads", "Hot Leads"

---

## 🧪 Testing Checklist

- [x] Global search works on all pages
- [x] Industry filter (Companies)
- [x] Location filter (Companies)
- [x] Size filter (Companies)
- [x] Tag filter (Companies)
- [x] Job Title filter (Contacts)
- [x] Status filter (Contacts)
- [x] Company filter (Contacts)
- [x] Tag filter (Contacts)
- [x] Multiple filters work together
- [x] Clear filters resets all inputs
- [x] Pagination with active filters
- [x] Active filter counter updates
- [x] Collapsible filters toggle
- [x] Results summary displays correctly
- [x] Empty state shows when no results

---

## 📚 Related Documentation

- **Full Guide**: `docs/SEARCH_AND_FILTERS.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Architecture**: `docs/ARCHITECTURE.md`

---

**Status**: ✅ **COMPLETE** - All search and filtering features implemented and tested!
