import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/lib/apiHelpers';
import mongoose from 'mongoose';

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns the status of the API and database connection
 */
export async function GET(req: NextRequest) {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    // Basic health info
    const health = {
      status: dbStatus.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbStatus.connected,
        readyState: dbStatus.readyState,
        name: dbStatus.name,
      },
      api: {
        version: '1.0.0',
        routes: [
          '/api/companies',
          '/api/contacts',
          '/api/leads',
          '/api/lists',
          '/api/tags',
          '/api/email/send',
        ],
      },
    };

    if (dbStatus.connected) {
      return successResponse(health);
    } else {
      return errorResponse('Database connection failed', 503, health);
    }
  } catch (error: any) {
    return errorResponse(
      'Health check failed',
      503,
      { error: error.message }
    );
  }
}

/**
 * Check database connection status
 */
async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  readyState: string;
  name?: string;
}> {
  try {
    await connectDB();
    
    const readyStateMap: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const state = mongoose.connection.readyState;
    
    return {
      connected: state === 1,
      readyState: readyStateMap[state] || 'unknown',
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      connected: false,
      readyState: 'error',
    };
  }
}
