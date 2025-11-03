# Tagging and Lead Lists - Complete Guide

This document provides a comprehensive guide to the tagging and lead lists features in the LeadGen MVP application.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Tagging System](#tagging-system)
3. [Lead Lists](#lead-lists)
4. [API Endpoints](#api-endpoints)
5. [UI Components](#ui-components)
6. [Usage Examples](#usage-examples)
7. [Database Operations](#database-operations)

---

## Overview

The tagging and lead lists features allow users to organize and segment their leads effectively:

- **Tags**: Categorize individual contacts and companies with flexible labels
- **Lead Lists**: Group multiple contacts into named collections for outreach campaigns

Both features use MongoDB array operations (`$addToSet`, `$pull`) for efficient updates.

---

## Tagging System

### Features

✅ **Flexible Tags**
- Add multiple tags to contacts and companies
- Tags stored as string arrays in each document
- No predefined tag structure - create tags on the fly

✅ **Visual Display**
- Color-coded badges for easy identification
- 7 distinct colors that cycle through tags
- Remove individual tags with one click

✅ **Tag Input Component**
- Autocomplete suggestions from existing tags
- Press Enter or comma to add tags
- Backspace to remove last tag
- Optional max tags limit

✅ **Tag Filtering**
- Filter contacts and companies by tags
- Dropdown populated from `/api/tags`
- Already integrated in search interfaces

### Tag Storage

```typescript
// Contact Schema
{
  firstName: String,
  lastName: String,
  email: String,
  tags: [String],  // e.g., ['High Priority', 'Decision Maker', 'Q4 Target']
  // ... other fields
}

// Company Schema
{
  name: String,
  industry: String,
  tags: [String],  // e.g., ['Enterprise', 'Hot Lead', 'Competitor']
  // ... other fields
}
```

### Tag Colors

Tags are displayed with rotating colors:

| Color | CSS Classes | Use Case |
|-------|------------|----------|
| Indigo | `bg-indigo-100 text-indigo-800` | Default/General |
| Purple | `bg-purple-100 text-purple-800` | Priority |
| Pink | `bg-pink-100 text-pink-800` | Special |
| Blue | `bg-blue-100 text-blue-800` | Status |
| Green | `bg-green-100 text-green-800` | Qualified |
| Yellow | `bg-yellow-100 text-yellow-800` | Follow-up |
| Red | `bg-red-100 text-red-800` | Urgent |

Colors cycle based on tag index position.

---

## Lead Lists

### Features

✅ **Flexible Grouping**
- Create named lists for any purpose
- Add multiple contacts to a list at once
- Lists can contain contacts, companies, and legacy leads
- Optional description for context

✅ **Bulk Operations**
- Select multiple contacts on Contacts page
- "Add to List" button appears when contacts selected
- Choose existing list or create new one on the fly

✅ **List Management**
- View all lists on Lists page
- See contact/company counts at a glance
- Detailed view shows all list members
- Remove contacts from list individually

✅ **Statistics**
- Total contacts in list
- Total companies in list
- Qualified percentage (contacts with status=qualified)

### List Schema

```typescript
{
  name: String,                          // Required
  description: String,                   // Optional
  contacts: [ObjectId],                  // References to Contact documents
  companies: [ObjectId],                 // References to Company documents
  leads: [ObjectId],                     // References to Lead documents (legacy)
  createdAt: Date,
  updatedAt: Date
}
```

### Bidirectional References

Lists maintain bidirectional relationships:

```typescript
// List document has array of contact IDs
List: {
  _id: "list123",
  contacts: ["contact1", "contact2", "contact3"]
}

// Each contact has array of list IDs it belongs to
Contact: {
  _id: "contact1",
  lists: ["list123", "list456"]
}
```

This allows:
- Finding all contacts in a list: `List.findById(id).populate('contacts')`
- Finding all lists a contact belongs to: `Contact.findById(id).populate('lists')`

---

## API Endpoints

### Tags API

#### Get All Tags
```http
GET /api/tags
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "tag1",
      "name": "High Priority",
      "color": "#3B82F6",
      "description": "Important leads to follow up"
    }
  ]
}
```

#### Create Tag
```http
POST /api/tags
Content-Type: application/json

{
  "name": "Hot Lead",
  "color": "#EF4444",
  "description": "Very interested prospects"
}
```

---

### Contact Tags API

#### Add Tags to Contact
```http
POST /api/contacts/[id]/tags
Content-Type: application/json

{
  "tags": ["High Priority", "Decision Maker"]
}
```

**MongoDB Operation:**
```typescript
Contact.findByIdAndUpdate(
  id,
  { $addToSet: { tags: { $each: tags } } },
  { new: true }
)
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated contact */ },
  "message": "Added 2 tag(s) to contact"
}
```

#### Remove Tags from Contact
```http
DELETE /api/contacts/[id]/tags
Content-Type: application/json

{
  "tags": ["Old Tag"]
}
```

**MongoDB Operation:**
```typescript
Contact.findByIdAndUpdate(
  id,
  { $pull: { tags: { $in: tags } } },
  { new: true }
)
```

---

### Company Tags API

#### Add Tags to Company
```http
POST /api/companies/[id]/tags
Content-Type: application/json

{
  "tags": ["Enterprise", "Target Account"]
}
```

#### Remove Tags from Company
```http
DELETE /api/companies/[id]/tags
Content-Type: application/json

{
  "tags": ["Old Tag"]
}
```

---

### Lists API

#### Get All Lists
```http
GET /api/lists
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "list1",
      "name": "Q4 Prospects",
      "description": "Target accounts for Q4",
      "contacts": ["contact1", "contact2"],
      "companies": ["company1"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create List
```http
POST /api/lists
Content-Type: application/json

{
  "name": "Enterprise Targets",
  "description": "Large companies for enterprise sales"
}
```

#### Get List Details
```http
GET /api/lists/[id]
```

Populates contacts and companies with full details.

#### Update List
```http
PUT /api/lists/[id]
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description"
}
```

#### Delete List
```http
DELETE /api/lists/[id]
```

Removes list and cleans up references in contacts.

---

### List Contacts API

#### Add Contacts to List
```http
POST /api/lists/[id]/contacts
Content-Type: application/json

{
  "contactIds": ["contact1", "contact2", "contact3"]
}
```

**Operations:**
1. Add contacts to list: `List.findByIdAndUpdate(id, { $addToSet: { contacts: { $each: contactIds } } })`
2. Add list to contacts: `Contact.updateMany({ _id: { $in: contactIds } }, { $addToSet: { lists: id } })`

**Response:**
```json
{
  "success": true,
  "data": { /* updated list */ },
  "message": "Added 3 contact(s) to list"
}
```

#### Remove Contacts from List
```http
DELETE /api/lists/[id]/contacts
Content-Type: application/json

{
  "contactIds": ["contact1"]
}
```

**Operations:**
1. Remove contacts from list: `List.findByIdAndUpdate(id, { $pull: { contacts: { $in: contactIds } } })`
2. Remove list from contacts: `Contact.updateMany({ _id: { $in: contactIds } }, { $pull: { lists: id } })`

---

## UI Components

### TagInput Component

**Location:** `src/components/TagInput.tsx`

**Props:**
```typescript
interface TagInputProps {
  tags: string[];                    // Current tags
  onChange: (tags: string[]) => void; // Callback when tags change
  suggestions?: string[];             // Autocomplete suggestions
  placeholder?: string;               // Input placeholder
  maxTags?: number;                   // Optional max tags limit
}
```

**Usage:**
```tsx
import TagInput from '@/components/TagInput';

const [tags, setTags] = useState<string[]>(['Existing Tag']);
const [availableTags, setAvailableTags] = useState<string[]>([]);

// Fetch available tags
useEffect(() => {
  fetch('/api/tags')
    .then(res => res.json())
    .then(result => setAvailableTags(result.data.map(t => t.name)));
}, []);

<TagInput
  tags={tags}
  onChange={setTags}
  suggestions={availableTags}
  placeholder="Add tags..."
  maxTags={10}
/>
```

**Features:**
- Press Enter or comma to add tag
- Backspace on empty input removes last tag
- Click X button to remove specific tag
- Autocomplete dropdown filters as you type
- Colored badges with 7 rotating colors
- Prevents duplicate tags

---

### AddToListDialog Component

**Location:** `src/components/AddToListDialog.tsx`

**Props:**
```typescript
interface AddToListDialogProps {
  isOpen: boolean;                    // Dialog visibility
  onClose: () => void;                // Close callback
  selectedContactIds: string[];       // IDs of selected contacts
  onSuccess?: () => void;             // Success callback
}
```

**Usage:**
```tsx
import AddToListDialog from '@/components/AddToListDialog';

const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
const [showDialog, setShowDialog] = useState(false);

<AddToListDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  selectedContactIds={selectedContacts}
  onSuccess={() => {
    setSelectedContacts([]);
    // Optionally refresh data
  }}
/>
```

**Features:**
- Modal dialog using Headless UI
- Two modes: Select existing list or create new
- Loads all lists on open
- Create new list without leaving dialog
- Shows selected contact count
- Success/error handling

---

## Usage Examples

### Example 1: Add Tags to Contact

**Scenario:** User wants to tag a contact as "High Priority" and "Decision Maker"

**Steps:**
1. Navigate to contact detail page
2. Edit contact
3. In tags field, type "High Priority" and press Enter
4. Type "Decision Maker" and press Enter
5. Save contact

**API Call:**
```typescript
// On save, if tags changed:
const response = await fetch(`/api/contacts/${contactId}/tags`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tags: ['High Priority', 'Decision Maker'] })
});
```

---

### Example 2: Create List and Add Contacts

**Scenario:** User wants to create "Q4 Outreach" list with 5 contacts

**Steps:**
1. Go to Contacts page
2. Check boxes for 5 contacts
3. Click "Add to List (5)"
4. In dialog, click "New List"
5. Enter name "Q4 Outreach" and description
6. Click "Create & Add"

**API Calls:**
```typescript
// 1. Create list
const createResponse = await fetch('/api/lists', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Q4 Outreach',
    description: 'Outreach campaign for Q4 2024'
  })
});

// 2. Add contacts to list
const listId = createResponse.data._id;
await fetch(`/api/lists/${listId}/contacts`, {
  method: 'POST',
  body: JSON.stringify({
    contactIds: ['contact1', 'contact2', 'contact3', 'contact4', 'contact5']
  })
});
```

---

### Example 3: Filter Contacts by Tag

**Scenario:** Find all contacts tagged "Enterprise"

**Steps:**
1. Go to Contacts page
2. Click "Filters" button
3. Select "Enterprise" from Tag dropdown
4. Click "Search"

**API Call:**
```http
GET /api/contacts?tag=Enterprise&page=1&limit=20
```

**Backend Query:**
```typescript
const query: any = {};
if (tag) {
  query.tags = tag;  // Exact match
}
const contacts = await Contact.find(query);
```

---

### Example 4: View List with All Contacts

**Scenario:** View all contacts in "Q4 Outreach" list

**Steps:**
1. Go to Lists page
2. Click on "Q4 Outreach" card
3. View detailed list page with all contacts

**API Call:**
```http
GET /api/lists/[listId]
```

**Backend Population:**
```typescript
const list = await List.findById(id)
  .populate({
    path: 'contacts',
    populate: { path: 'company' }  // Nested populate
  })
  .populate('companies');
```

---

### Example 5: Remove Contact from List

**Scenario:** Remove one contact from list

**Steps:**
1. Open list detail page
2. Find contact in table
3. Click X button next to contact
4. Confirm removal

**API Call:**
```typescript
await fetch(`/api/lists/${listId}/contacts`, {
  method: 'DELETE',
  body: JSON.stringify({ contactIds: [contactId] })
});
```

---

## Database Operations

### MongoDB Array Operations

#### $addToSet
Adds elements to array only if they don't exist (prevents duplicates).

```typescript
// Add tags to contact
Contact.findByIdAndUpdate(
  contactId,
  { $addToSet: { tags: { $each: ['Tag1', 'Tag2'] } } }
);

// Result: Only unique tags are added
// Before: tags: ['Existing']
// After:  tags: ['Existing', 'Tag1', 'Tag2']
```

#### $pull
Removes all instances of specified values from array.

```typescript
// Remove tags from contact
Contact.findByIdAndUpdate(
  contactId,
  { $pull: { tags: { $in: ['Tag1', 'Tag2'] } } }
);

// Result: Specified tags are removed
// Before: tags: ['Tag1', 'Tag2', 'Tag3']
// After:  tags: ['Tag3']
```

#### $push
Adds elements to array (allows duplicates).

```typescript
// Add to array (can create duplicates)
List.findByIdAndUpdate(
  listId,
  { $push: { contacts: contactId } }
);
```

### Bidirectional Updates

When adding contacts to list, update both documents:

```typescript
// 1. Add contacts to list
await List.findByIdAndUpdate(
  listId,
  { $addToSet: { contacts: { $each: contactIds } } }
);

// 2. Add list reference to each contact
await Contact.updateMany(
  { _id: { $in: contactIds } },
  { $addToSet: { lists: listId } }
);
```

When removing:

```typescript
// 1. Remove contacts from list
await List.findByIdAndUpdate(
  listId,
  { $pull: { contacts: { $in: contactIds } } }
);

// 2. Remove list reference from contacts
await Contact.updateMany(
  { _id: { $in: contactIds } },
  { $pull: { lists: listId } }
);
```

---

## Best Practices

### Tags

1. **Consistent Naming**
   - Use Title Case: "High Priority" not "high priority"
   - Be concise: "Decision Maker" not "This is a Decision Maker"
   - Avoid special characters

2. **Tag Management**
   - Create common tags in Tags collection for autocomplete
   - Limit tags to 5-10 per contact/company
   - Review and consolidate similar tags periodically

3. **Performance**
   - Index tags array for faster queries: `contactSchema.index({ tags: 1 })`
   - Use exact match filters, not regex on tags
   - Cache available tags in frontend for autocomplete

### Lists

1. **Naming Conventions**
   - Use descriptive names: "Q4 2024 Enterprise Prospects"
   - Include timeframe if relevant: "January Outreach"
   - Purpose-based: "Webinar Attendees - Product Launch"

2. **List Size**
   - Keep lists under 1000 contacts for performance
   - Split large campaigns into multiple lists
   - Archive old lists instead of deleting

3. **Organization**
   - Use descriptions to document purpose
   - Review lists quarterly and remove outdated ones
   - Create lists for specific campaigns, not general buckets

---

## Testing

### Manual Testing Checklist

**Tags:**
- [ ] Add single tag to contact
- [ ] Add multiple tags at once
- [ ] Remove specific tag
- [ ] Tag autocomplete shows suggestions
- [ ] Tags display with colors
- [ ] Filter contacts by tag
- [ ] Filter companies by tag

**Lists:**
- [ ] Create new list
- [ ] View all lists
- [ ] Open list detail page
- [ ] Add single contact to list
- [ ] Add multiple contacts to list (bulk)
- [ ] Remove contact from list
- [ ] Delete list
- [ ] List stats display correctly
- [ ] Create list from "Add to List" dialog
- [ ] Select existing list from dialog

### API Testing

```bash
# Test adding tags to contact
curl -X POST http://localhost:3000/api/contacts/[id]/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["High Priority", "Decision Maker"]}'

# Test removing tags
curl -X DELETE http://localhost:3000/api/contacts/[id]/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["Old Tag"]}'

# Test creating list
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name": "Test List", "description": "Testing"}'

# Test adding contacts to list
curl -X POST http://localhost:3000/api/lists/[id]/contacts \
  -H "Content-Type: application/json" \
  -d '{"contactIds": ["contact1", "contact2"]}'

# Test removing contacts from list
curl -X DELETE http://localhost:3000/api/lists/[id]/contacts \
  -H "Content-Type: application/json" \
  -d '{"contactIds": ["contact1"]}'
```

---

## Future Enhancements

### Tags
- [ ] Tag analytics (most used tags, tag trends)
- [ ] Tag colors customization
- [ ] Tag categories/hierarchies
- [ ] Bulk tag operations (add tag to all filtered contacts)
- [ ] Tag templates by industry

### Lists
- [ ] Smart lists with dynamic filters
- [ ] List templates (clone existing lists)
- [ ] List sharing/collaboration
- [ ] Export list to CSV
- [ ] Scheduled list updates
- [ ] List activity history
- [ ] Bulk actions on list members (change status, add tags)

---

## Related Files

### API Routes
- `/src/app/api/tags/route.ts` - Tags CRUD
- `/src/app/api/contacts/[id]/tags/route.ts` - Contact tags management
- `/src/app/api/companies/[id]/tags/route.ts` - Company tags management
- `/src/app/api/lists/route.ts` - Lists CRUD
- `/src/app/api/lists/[id]/route.ts` - Single list operations
- `/src/app/api/lists/[id]/contacts/route.ts` - List membership management

### Frontend Pages
- `/src/app/lists/page.tsx` - Lists overview
- `/src/app/lists/[id]/page.tsx` - List detail view
- `/src/app/contacts/page.tsx` - Contacts with bulk selection

### Components
- `/src/components/TagInput.tsx` - Tag input widget
- `/src/components/AddToListDialog.tsx` - Add to list modal

### Models
- `/src/models/Tag.ts` - Tag schema
- `/src/models/List.ts` - List schema
- `/src/models/Contact.ts` - Contact with tags and lists
- `/src/models/Company.ts` - Company with tags

---

## Summary

The tagging and lead lists features provide powerful organization capabilities:

- **Tags**: Flexible categorization with colored badges, autocomplete, and filtering
- **Lists**: Bulk contact management with bidirectional references
- **API**: RESTful endpoints using MongoDB array operations
- **UI**: Reusable components for tag input and list management
- **Integration**: Seamlessly integrated with existing contacts and companies

These features enable users to segment leads effectively for targeted outreach campaigns and better lead management.
