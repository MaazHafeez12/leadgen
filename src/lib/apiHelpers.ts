import { NextResponse } from 'next/server';

/**
 * Standard API response helpers
 * Ensures consistent response format across all endpoints
 */

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Success response with optional pagination
 */
export function successResponse<T>(
  data: T,
  pagination?: SuccessResponse['pagination'],
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return NextResponse.json(response, { status });
}

/**
 * Error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle common MongoDB errors
 */
export function handleMongoError(error: any): NextResponse<ErrorResponse> {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return errorResponse(
      `${field || 'Field'} already exists`,
      400,
      { field, value: error.keyValue }
    );
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse('Validation failed', 400, { errors });
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return errorResponse(
      `Invalid ${error.path}: ${error.value}`,
      400,
      { field: error.path }
    );
  }

  // Generic error
  return errorResponse(error.message || 'Internal server error', 500);
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  
  return { page, limit };
}

export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit),
  };
}

/**
 * Build MongoDB query from search params
 */
export function buildSearchQuery(
  searchParams: URLSearchParams,
  searchFields: string[]
): any {
  const search = searchParams.get('search');
  if (!search) return {};

  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: search, $options: 'i' }
    }))
  };
}

/**
 * Build filter query from search params
 */
export function buildFilterQuery(
  searchParams: URLSearchParams,
  filterableFields: string[]
): any {
  const query: any = {};

  for (const field of filterableFields) {
    const value = searchParams.get(field);
    if (value) {
      // Check if it's a regex search (contains special characters)
      if (value.includes('*') || value.includes('%')) {
        query[field] = { 
          $regex: value.replace(/[*%]/g, '.*'), 
          $options: 'i' 
        };
      } else {
        query[field] = value;
      }
    }
  }

  return query;
}

/**
 * Combine search and filter queries
 */
export function buildQuery(
  searchParams: URLSearchParams,
  options: {
    searchFields?: string[];
    filterFields?: string[];
  }
): any {
  const query: any = {};

  // Add search conditions
  if (options.searchFields) {
    const searchQuery = buildSearchQuery(searchParams, options.searchFields);
    if (Object.keys(searchQuery).length > 0) {
      Object.assign(query, searchQuery);
    }
  }

  // Add filter conditions
  if (options.filterFields) {
    const filterQuery = buildFilterQuery(searchParams, options.filterFields);
    Object.assign(query, filterQuery);
  }

  return query;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

/**
 * Sanitize input data (remove undefined/null values)
 */
export function sanitizeInput<T extends Record<string, any>>(data: T): Partial<T> {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check if ObjectId is valid
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Extract and validate ObjectId from params
 */
export function getValidObjectId(
  id: string
): { valid: boolean; id?: string; error?: NextResponse<ErrorResponse> } {
  if (!isValidObjectId(id)) {
    return {
      valid: false,
      error: errorResponse('Invalid ID format', 400, { id }),
    };
  }
  
  return { valid: true, id };
}
