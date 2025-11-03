# API Testing Guide - Companies & Contacts

## Prerequisites

- Server running on `http://localhost:3000`
- MongoDB connected
- Use REST client (VS Code REST Client, Postman, or curl)

## Quick Start: Automated Testing

Run the automated test suite to verify all endpoints:

```powershell
# PowerShell
.\scripts\test-api.ps1
```

Or directly with Node.js:

```bash
node scripts/test-api.js
```

This will test all endpoints automatically and show results in the terminal.

---

## Manual API Testing

Below are detailed examples for testing each endpoint manually.

## Company API Tests

### 1. Create Companies

```http
### Create first company
POST http://localhost:3000/api/companies
Content-Type: application/json

{
  "name": "Acme Corporation",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "size": "51-200",
  "website": "https://acme.com",
  "description": "Leading SaaS platform for enterprise solutions",
  "tags": ["saas", "b2b", "enterprise"]
}

### Create second company
POST http://localhost:3000/api/companies
Content-Type: application/json

{
  "name": "TechCo Inc",
  "industry": "Software",
  "location": "New York, NY",
  "size": "201-500",
  "website": "https://techco.io",
  "tags": ["cloud", "devops"]
}
```

### 2. Get All Companies

```http
### Get all companies
GET http://localhost:3000/api/companies

### Get companies with pagination
GET http://localhost:3000/api/companies?page=1&limit=10

### Search companies
GET http://localhost:3000/api/companies?search=acme

### Filter by industry
GET http://localhost:3000/api/companies?industry=technology

### Filter by size
GET http://localhost:3000/api/companies?size=51-200

### Filter by tag
GET http://localhost:3000/api/companies?tag=saas

### Combined filters
GET http://localhost:3000/api/companies?industry=technology&size=51-200&search=acme
```

### 3. Get Single Company

```http
### Get company by ID (replace with actual ID)
GET http://localhost:3000/api/companies/6734a8b9c2d1e3f4a5b6c7d8
```

### 4. Update Company

```http
### Update company
PUT http://localhost:3000/api/companies/6734a8b9c2d1e3f4a5b6c7d8
Content-Type: application/json

{
  "description": "Updated description for Acme Corporation",
  "revenue": "$50M-$100M",
  "tags": ["saas", "b2b", "enterprise", "ai"]
}
```

### 5. Delete Company

```http
### Delete company
DELETE http://localhost:3000/api/companies/6734a8b9c2d1e3f4a5b6c7d8
```

---

## Contact API Tests

### 1. Create Contacts

**Note:** Replace `COMPANY_ID` with actual company ID from previous step

```http
### Create first contact
POST http://localhost:3000/api/contacts
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0101",
  "title": "CEO",
  "company": "COMPANY_ID",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "location": "San Francisco, CA",
  "status": "qualified",
  "tags": ["decision-maker", "hot-lead"]
}

### Create second contact
POST http://localhost:3000/api/contacts
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@techco.io",
  "phone": "+1-555-0102",
  "title": "CTO",
  "company": "COMPANY_ID",
  "status": "contacted",
  "tags": ["technical", "influencer"]
}
```

### 2. Get All Contacts

```http
### Get all contacts
GET http://localhost:3000/api/contacts

### Get contacts with pagination
GET http://localhost:3000/api/contacts?page=1&limit=10

### Search contacts
GET http://localhost:3000/api/contacts?search=john

### Filter by status
GET http://localhost:3000/api/contacts?status=qualified

### Filter by company
GET http://localhost:3000/api/contacts?company=COMPANY_ID

### Filter by tag
GET http://localhost:3000/api/contacts?tag=decision-maker

### Combined filters
GET http://localhost:3000/api/contacts?status=qualified&search=john
```

### 3. Get Single Contact

```http
### Get contact by ID (includes populated company)
GET http://localhost:3000/api/contacts/6734a8b9c2d1e3f4a5b6c7d9
```

### 4. Update Contact

```http
### Update contact status
PUT http://localhost:3000/api/contacts/6734a8b9c2d1e3f4a5b6c7d9
Content-Type: application/json

{
  "status": "converted",
  "notes": "Successfully closed the deal!"
}

### Update contact company
PUT http://localhost:3000/api/contacts/6734a8b9c2d1e3f4a5b6c7d9
Content-Type: application/json

{
  "company": "NEW_COMPANY_ID",
  "title": "VP of Engineering"
}
```

### 5. Delete Contact

```http
### Delete contact
DELETE http://localhost:3000/api/contacts/6734a8b9c2d1e3f4a5b6c7d9
```

### 6. Bulk Import Contacts

```http
### Import multiple contacts
POST http://localhost:3000/api/contacts/import
Content-Type: application/json

{
  "contacts": [
    {
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@example.com",
      "company": "COMPANY_ID",
      "status": "new"
    },
    {
      "firstName": "Bob",
      "lastName": "Williams",
      "email": "bob@example.com",
      "company": "COMPANY_ID",
      "status": "new"
    }
  ]
}
```

---

## Testing with curl

### Company Operations

```bash
# Create company
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "industry": "Technology",
    "size": "51-200"
  }'

# Get companies
curl http://localhost:3000/api/companies

# Search companies
curl "http://localhost:3000/api/companies?search=test&industry=technology"

# Get single company
curl http://localhost:3000/api/companies/COMPANY_ID

# Update company
curl -X PUT http://localhost:3000/api/companies/COMPANY_ID \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'

# Delete company
curl -X DELETE http://localhost:3000/api/companies/COMPANY_ID
```

### Contact Operations

```bash
# Create contact
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "COMPANY_ID"
  }'

# Get contacts
curl http://localhost:3000/api/contacts

# Search contacts
curl "http://localhost:3000/api/contacts?search=test&status=new"

# Get single contact (with populated company)
curl http://localhost:3000/api/contacts/CONTACT_ID

# Update contact
curl -X PUT http://localhost:3000/api/contacts/CONTACT_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'

# Delete contact
curl -X DELETE http://localhost:3000/api/contacts/CONTACT_ID
```

---

## Testing Workflow

### Complete Testing Sequence

1. **Create a Company**
   ```
   POST /api/companies
   → Save the returned _id
   ```

2. **Create Contacts for that Company**
   ```
   POST /api/contacts (use company _id)
   → Save contact _ids
   ```

3. **Search and Filter**
   ```
   GET /api/companies?search=...
   GET /api/contacts?company=COMPANY_ID
   ```

4. **View Details**
   ```
   GET /api/contacts/CONTACT_ID
   → Verify company is populated
   ```

5. **Update Status**
   ```
   PUT /api/contacts/CONTACT_ID
   → Change status to 'contacted'
   ```

6. **Create a List**
   ```
   POST /api/lists
   → Include company and contact IDs
   ```

---

## Expected Responses

### Successful Company Creation

```json
{
  "success": true,
  "data": {
    "_id": "6734a8b9c2d1e3f4a5b6c7d8",
    "name": "Acme Corporation",
    "industry": "Technology",
    "tags": ["saas", "b2b"],
    "createdAt": "2024-11-03T...",
    "updatedAt": "2024-11-03T..."
  }
}
```

### Successful Contact Creation (with populated company)

```json
{
  "success": true,
  "data": {
    "_id": "6734a8b9c2d1e3f4a5b6c7d9",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com",
    "company": {
      "_id": "6734a8b9c2d1e3f4a5b6c7d8",
      "name": "Acme Corporation",
      "industry": "Technology"
    },
    "status": "new",
    "createdAt": "2024-11-03T...",
    "updatedAt": "2024-11-03T..."
  }
}
```

### List with Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

## Common Testing Scenarios

### Scenario 1: Company with Multiple Contacts

```http
# Step 1: Create company
POST /api/companies
{ "name": "Big Corp", "industry": "Finance" }

# Step 2: Create multiple contacts
POST /api/contacts
{ "email": "ceo@bigcorp.com", "company": "COMPANY_ID" }

POST /api/contacts
{ "email": "cto@bigcorp.com", "company": "COMPANY_ID" }

# Step 3: Get all contacts for company
GET /api/contacts?company=COMPANY_ID
```

### Scenario 2: Contact Status Progression

```http
# Create contact
POST /api/contacts
{ "email": "lead@company.com", "status": "new" }

# Update to contacted
PUT /api/contacts/CONTACT_ID
{ "status": "contacted" }

# Update to qualified
PUT /api/contacts/CONTACT_ID
{ "status": "qualified" }

# Update to converted
PUT /api/contacts/CONTACT_ID
{ "status": "converted" }
```

### Scenario 3: Tag-based Filtering

```http
# Create contacts with tags
POST /api/contacts
{ "email": "vip@company.com", "tags": ["vip", "decision-maker"] }

# Filter by tag
GET /api/contacts?tag=vip
```

---

## Troubleshooting

### Contact Creation Fails

**Problem:** "Email already exists"
**Solution:** Each contact email must be unique

**Problem:** "Company not found"
**Solution:** Verify company ID exists

### Population Not Working

**Problem:** Company is just an ID, not populated object
**Solution:** Check API route uses `.populate('company')`

### Search Not Working

**Problem:** No results for text search
**Solution:** MongoDB text indexes may need time to build

---

## Performance Testing

### Load Test with ab (Apache Bench)

```bash
# Test company list endpoint
ab -n 1000 -c 10 http://localhost:3000/api/companies

# Test contact search
ab -n 1000 -c 10 "http://localhost:3000/api/contacts?search=john"
```

### Response Time Monitoring

Expected response times:
- Simple list: < 200ms
- Search query: < 300ms
- With population: < 500ms
- Bulk import: < 2s for 100 records

---

## Next Steps

1. Test all CRUD operations for both models
2. Verify search and filter functionality
3. Test relationship population (Contact → Company)
4. Import sample data from CSV files
5. Create lists with companies and contacts
6. Build frontend UI for companies and contacts

---

**Happy Testing! 🚀**
