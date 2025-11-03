# API Refactoring Example

This document shows how to refactor existing API routes to use the new `apiHelpers` utility functions for cleaner, more maintainable code.

## Before: Original Companies Route

```typescript
// src/app/api/companies/route.ts (ORIGINAL)
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const size = searchParams.get('size');
    const tag = searchParams.get('tag');
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (industry) query.industry = { $regex: industry, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (size) query.size = size;
    if (tag) query.tags = tag;
    
    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    
    const company = await Company.create(body);
    return NextResponse.json(company, { status: 201 });
    
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Company already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## After: Refactored with API Helpers

```typescript
// src/app/api/companies/route.ts (REFACTORED)
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import {
  successResponse,
  errorResponse,
  handleMongoError,
  getPaginationParams,
  calculatePagination,
  buildQuery,
  validateRequiredFields,
} from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const { page, limit } = getPaginationParams(searchParams);
    const skip = (page - 1) * limit;
    
    // Build query using helper
    const query = buildQuery(searchParams, {
      searchFields: ['name', 'industry', 'location'],
      filterFields: ['industry', 'location', 'size', 'tags'],
    });
    
    // Execute query with pagination
    const [total, companies] = await Promise.all([
      Company.countDocuments(query),
      Company.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
    ]);
    
    // Return with standard format
    return successResponse(
      { companies },
      calculatePagination(page, limit, total)
    );
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['name']);
    if (!validation.valid) {
      return errorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400
      );
    }
    
    // Create company
    const company = await Company.create(body);
    
    return successResponse(company, undefined, 201);
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}
```

## Benefits of Refactoring

### 1. **Reduced Code Duplication**
- Pagination logic extracted to `getPaginationParams()` and `calculatePagination()`
- Query building logic centralized in `buildQuery()`
- Error handling unified in `handleMongoError()`

### 2. **Consistent Response Format**
```typescript
// All successful responses have this format:
{
  success: true,
  data: { /* your data */ },
  pagination?: { page, limit, total, pages }
}

// All error responses have this format:
{
  success: false,
  error: "Error message",
  details?: { /* additional context */ }
}
```

### 3. **Better Error Handling**
- Automatic detection of MongoDB duplicate key errors (code 11000)
- Validation error details extraction
- Cast error handling for invalid ObjectIds
- Consistent error messages

### 4. **Type Safety**
- All helpers are fully typed
- Response types are standardized
- Pagination parameters are validated

### 5. **Easier Testing**
- Small, focused functions are easier to test
- Mock helpers instead of entire routes
- Predictable response formats

## Refactoring Other Routes

### Example: Contacts with Population

```typescript
// src/app/api/contacts/route.ts (REFACTORED)
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import {
  successResponse,
  handleMongoError,
  getPaginationParams,
  calculatePagination,
  buildQuery,
} from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const { page, limit } = getPaginationParams(searchParams);
    const skip = (page - 1) * limit;
    
    const query = buildQuery(searchParams, {
      searchFields: ['firstName', 'lastName', 'email', 'title'],
      filterFields: ['status', 'company'],
    });
    
    // Handle tags array filter
    const tag = searchParams.get('tag');
    if (tag) query.tags = tag;
    
    const [total, contacts] = await Promise.all([
      Contact.countDocuments(query),
      Contact.find(query)
        .populate('company')
        .populate('lists')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
    ]);
    
    return successResponse(
      { contacts },
      calculatePagination(page, limit, total)
    );
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}
```

### Example: Single Resource with ID Validation

```typescript
// src/app/api/companies/[id]/route.ts (REFACTORED)
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import {
  successResponse,
  errorResponse,
  handleMongoError,
  getValidObjectId,
} from '@/lib/apiHelpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ObjectId
    const validation = getValidObjectId(params.id);
    if (!validation.valid) {
      return validation.error!;
    }
    
    await connectDB();
    const company = await Company.findById(params.id);
    
    if (!company) {
      return errorResponse('Company not found', 404);
    }
    
    return successResponse(company);
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = getValidObjectId(params.id);
    if (!validation.valid) {
      return validation.error!;
    }
    
    await connectDB();
    const body = await req.json();
    
    const company = await Company.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return errorResponse('Company not found', 404);
    }
    
    return successResponse(company);
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = getValidObjectId(params.id);
    if (!validation.valid) {
      return validation.error!;
    }
    
    await connectDB();
    const company = await Company.findByIdAndDelete(params.id);
    
    if (!company) {
      return errorResponse('Company not found', 404);
    }
    
    return successResponse({ message: 'Company deleted successfully', company });
    
  } catch (error: any) {
    return handleMongoError(error);
  }
}
```

## Migration Strategy

1. **Start with new routes** - Use helpers for all new API endpoints
2. **Refactor gradually** - Update existing routes one at a time
3. **Test thoroughly** - Ensure behavior is identical after refactoring
4. **Keep documentation updated** - Update API_TESTING.md with new response formats

## Additional Helpers to Consider

### Request Body Validation

```typescript
// Add to apiHelpers.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Query Optimization

```typescript
// Add to apiHelpers.ts
export function buildSortQuery(
  searchParams: URLSearchParams,
  defaultSort: string = '-createdAt'
): any {
  const sortBy = searchParams.get('sortBy') || defaultSort;
  const order = searchParams.get('order') === 'asc' ? 1 : -1;
  
  return { [sortBy.replace('-', '')]: order };
}
```

### Response Caching

```typescript
// Add to apiHelpers.ts
export function cacheResponse(
  response: NextResponse,
  maxAge: number = 60
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate`
  );
  return response;
}
```

## Next Steps

1. Review the new `apiHelpers.ts` utility functions
2. Gradually refactor existing API routes using these helpers
3. Add unit tests for helper functions
4. Consider adding middleware for authentication/authorization
5. Implement rate limiting using helpers

The helper utilities are ready to use in any API route for cleaner, more maintainable code!
