# Data Models Documentation

## Overview

The lead generation platform now supports a more sophisticated data model architecture similar to Apollo.io, with separate entities for Companies, Contacts, and the original Leads for backward compatibility.

## Model Architecture

```
Company (Organization)
    ├── Contacts (People who work at the company)
    └── Metadata (Industry, size, location, etc.)

Contact (Person)
    ├── company → Company reference
    ├── tags → String array
    └── lists → List references

Lead (Legacy)
    ├── company → String or Company reference
    └── Legacy fields maintained

List (Saved Searches/Campaigns)
    ├── leads → Lead references (legacy)
    ├── contacts → Contact references (new)
    └── companies → Company references

Tag (Shared)
    └── Referenced by both Leads and Contacts
```

---

## 1. Company Model

**Purpose:** Represents organizations/businesses

**Collection:** `companies`

### Schema

```typescript
{
  name: String (required, indexed)
  industry: String (indexed)
  location: String
  size: String (enum: '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+')
  website: String
  description: String
  linkedinUrl: String
  revenue: String
  foundedYear: Number
  tags: [String]
  enrichmentData: {
    verified: Boolean
    employeeCount: Number
    lastEnriched: Date
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes

- Text search: `name`, `industry`, `location`
- Single field: `website`, `tags`

### Example

```json
{
  "_id": "6734a8b9c2d1e3f4a5b6c7d8",
  "name": "Acme Corporation",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "size": "51-200",
  "website": "https://acme.com",
  "tags": ["saas", "b2b"],
  "enrichmentData": {
    "verified": true,
    "employeeCount": 150
  }
}
```

---

## 2. Contact Model

**Purpose:** Represents individual people (leads/prospects)

**Collection:** `contacts`

### Schema

```typescript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique, lowercase, indexed)
  phone: String
  title: String
  company: ObjectId (ref: 'Company') // Key relationship!
  linkedinUrl: String
  location: String
  status: String (enum: 'new', 'contacted', 'qualified', 'unqualified', 'converted')
  source: String (enum: 'manual', 'import', 'scrape', 'extension')
  tags: [String]
  lists: [ObjectId] (ref: 'List')
  notes: String
  enrichmentData: {
    verified: Boolean
    score: Number
    lastEnriched: Date
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes

- `email` (unique)
- `company` (for filtering by company)
- `status`
- Text search: `firstName`, `lastName`
- `tags`

### Example

```json
{
  "_id": "6734a8b9c2d1e3f4a5b6c7d9",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "title": "CEO",
  "company": "6734a8b9c2d1e3f4a5b6c7d8", // Reference to Company
  "status": "qualified",
  "tags": ["decision-maker", "hot-lead"],
  "enrichmentData": {
    "verified": true,
    "score": 85
  }
}
```

---

## 3. Lead Model (Legacy)

**Purpose:** Backward compatibility with existing implementation

**Collection:** `leads`

### Schema

```typescript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  phone: String
  company: Mixed (String or ObjectId) // Can be text or reference
  companyName: String // Denormalized for display
  title: String
  industry: String
  location: String
  website: String
  linkedinUrl: String
  status: String (enum)
  source: String (enum)
  tags: [ObjectId] (ref: 'Tag')
  lists: [ObjectId] (ref: 'List')
  notes: String
  enrichmentData: Object
  createdAt: Date
  updatedAt: Date
}
```

### Migration Path

**New implementations should use Contact + Company models.**

The Lead model is maintained for:
- Backward compatibility
- Existing data migration
- Simple use cases not requiring company hierarchy

---

## 4. List Model (Enhanced)

**Purpose:** Organize leads/contacts/companies into saved lists or campaigns

**Collection:** `lists`

### Schema

```typescript
{
  name: String (required)
  description: String
  leads: [ObjectId] (ref: 'Lead') // Legacy support
  contacts: [ObjectId] (ref: 'Contact') // New
  companies: [ObjectId] (ref: 'Company') // New
  createdAt: Date
  updatedAt: Date
}
```

### Example

```json
{
  "_id": "6734a8b9c2d1e3f4a5b6c7e0",
  "name": "Q4 Enterprise Prospects",
  "description": "High-value enterprise leads for Q4 campaign",
  "contacts": ["6734a...", "6734b..."],
  "companies": ["6734c...", "6734d..."],
  "leads": [] // Empty for new lists
}
```

---

## 5. Tag Model (Existing)

**Purpose:** Categorization and filtering

**Collection:** `tags`

### Schema

```typescript
{
  name: String (required, unique)
  color: String (default: '#3B82F6')
  description: String
  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints

### Companies

```
GET    /api/companies              List companies (with filters)
POST   /api/companies              Create company
GET    /api/companies/[id]         Get single company
PUT    /api/companies/[id]         Update company
DELETE /api/companies/[id]         Delete company
```

**Query Parameters:**
- `search` - Search name, industry, location
- `industry` - Filter by industry
- `location` - Filter by location
- `size` - Filter by company size
- `tag` - Filter by tag
- `page`, `limit` - Pagination

### Contacts

```
GET    /api/contacts               List contacts (with filters)
POST   /api/contacts               Create contact
GET    /api/contacts/[id]          Get single contact
PUT    /api/contacts/[id]          Update contact
DELETE /api/contacts/[id]          Delete contact
POST   /api/contacts/import        Bulk import contacts
```

**Query Parameters:**
- `search` - Search name, email, title
- `status` - Filter by status
- `company` - Filter by company ID
- `tag` - Filter by tag
- `page`, `limit` - Pagination

---

## Relationships & Population

### Contact → Company

**Populate company details when fetching contacts:**

```typescript
const contact = await Contact.findById(id).populate('company');

// Result includes full company object:
{
  firstName: "John",
  lastName: "Doe",
  company: {
    name: "Acme Corp",
    industry: "Technology",
    website: "https://acme.com"
  }
}
```

### List → Contacts & Companies

**Populate list members:**

```typescript
const list = await List.findById(id)
  .populate('contacts')
  .populate('companies');
```

---

## Data Modeling Best Practices

### 1. When to Use Contact vs Lead

**Use Contact Model when:**
- You need company hierarchy
- Tracking multiple contacts per company
- Building account-based marketing campaigns
- Need sophisticated filtering by company attributes

**Use Lead Model when:**
- Simple, flat lead tracking
- Migrating existing data
- Don't need company relationships
- Backward compatibility required

### 2. Denormalization Strategy

**Company Name in Contact:**
While Contact has a company reference, you might want to denormalize the company name for performance:

```typescript
const contact = await Contact.create({
  firstName: "John",
  lastName: "Doe",
  company: companyId,
  // Consider adding:
  companyName: "Acme Corp" // Denormalized for quick display
});
```

### 3. Tags: String Array vs Collection

**Current Approach:**
- Tags in Contact/Company: String arrays `["saas", "b2b"]`
- Tags collection: Separate model for UI management

**Benefits:**
- Simple querying: `{ tags: "saas" }`
- No additional joins
- Easy to add/remove tags

**Trade-offs:**
- No centralized tag management in database
- Tags collection used only for UI dropdowns

### 4. List Management

**Adding contacts to a list:**

```typescript
// Add contact to list
await List.findByIdAndUpdate(listId, {
  $addToSet: { contacts: contactId }
});

// Add list to contact
await Contact.findByIdAndUpdate(contactId, {
  $addToSet: { lists: listId }
});
```

---

## Query Examples

### Find all contacts at a company

```typescript
const contacts = await Contact.find({ 
  company: companyId 
}).populate('company');
```

### Find companies in an industry

```typescript
const companies = await Company.find({ 
  industry: /technology/i 
});
```

### Find contacts with specific status and company size

```typescript
const contacts = await Contact.find({ 
  status: 'qualified' 
})
.populate({
  path: 'company',
  match: { size: '51-200' }
});
```

### Search across contacts and companies

```typescript
const results = await Contact.find({
  $text: { $search: 'john acme' }
}).populate('company');
```

---

## Migration Guide

### From Leads to Contacts

If you have existing Lead data and want to migrate to the Contact + Company model:

1. **Create companies** from unique company names
2. **Create contacts** from leads, linking to companies
3. **Update lists** to reference contacts instead of leads
4. **Keep leads** for backward compatibility if needed

**Example migration script:**

```typescript
async function migratLeadsToContacts() {
  const leads = await Lead.find();
  
  for (const lead of leads) {
    // Create or find company
    let company = await Company.findOne({ 
      name: lead.company 
    });
    
    if (!company) {
      company = await Company.create({
        name: lead.company,
        industry: lead.industry,
        website: lead.website
      });
    }
    
    // Create contact
    await Contact.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      title: lead.title,
      company: company._id,
      status: lead.status,
      tags: lead.tags,
      notes: lead.notes
    });
  }
}
```

---

## Performance Considerations

1. **Indexes** - All critical fields are indexed
2. **Population** - Use `.populate()` selectively, not on every query
3. **Pagination** - Always paginate large result sets
4. **Denormalization** - Consider denormalizing frequently accessed data
5. **Caching** - Cache company lookups for frequently accessed companies

---

## Summary

The new data model provides:
- ✅ Proper relational structure (Company ← Contact)
- ✅ Backward compatibility (Lead model retained)
- ✅ Flexible tagging (string arrays)
- ✅ Advanced filtering and search
- ✅ List management for campaigns
- ✅ Full CRUD APIs for all entities
- ✅ Performance optimized with indexes

**Recommended approach:** Use Contact + Company for new features, maintain Lead for legacy support.
