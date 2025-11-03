import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

/**
 * API endpoint for Chrome Extension to submit LinkedIn company data
 * Requires X-API-Key header for authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Please provide X-API-Key header.' },
        { status: 401 }
      );
    }
    
    // TODO: Validate API key against database
    // For now, we'll accept any non-empty API key
    // In production, you should validate against user's API key in database
    const validApiKey = process.env.EXTENSION_API_KEY || 'dev-key-12345';
    
    if (apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Parse company size
    let companySize = '';
    let companySizeMin = 0;
    let companySizeMax = 0;
    
    if (data.size) {
      companySize = data.size;
      // Extract numbers from size string (e.g., "51-200 employees" -> min: 51, max: 200)
      const sizeMatch = data.size.match(/(\d+)-(\d+)/);
      if (sizeMatch) {
        companySizeMin = parseInt(sizeMatch[1]);
        companySizeMax = parseInt(sizeMatch[2]);
      } else {
        // Single number (e.g., "50+ employees")
        const singleMatch = data.size.match(/(\d+)/);
        if (singleMatch) {
          companySizeMin = parseInt(singleMatch[1]);
        }
      }
    }
    
    // Prepare company data
    const companyData = {
      name: data.company,
      industry: data.industry || '',
      website: data.website || '',
      location: data.location || '',
      description: data.description || '',
      employeeCount: companySizeMin || undefined,
      tags: ['linkedin-scrape'],
      scrapedData: {
        description: data.description || '',
        industry: data.industry || '',
        size: companySize,
        sizeMin: companySizeMin || undefined,
        sizeMax: companySizeMax || undefined,
        socialLinks: {
          linkedin: data.url || ''
        },
        logo: data.logo || '',
        lastScraped: new Date().toISOString(),
        method: 'chrome-extension',
        source: data.url || ''
      },
      customFields: {
        linkedInUrl: data.url || '',
        scrapedAt: new Date().toISOString(),
        scrapedFrom: 'chrome-extension'
      }
    };
    
    // Check if company already exists (by name or LinkedIn URL)
    let existingCompany = null;
    
    if (data.url) {
      existingCompany = await Company.findOne({
        'scrapedData.socialLinks.linkedin': data.url
      });
    }
    
    if (!existingCompany) {
      existingCompany = await Company.findOne({
        name: { $regex: new RegExp(`^${data.company}$`, 'i') }
      });
    }
    
    let company;
    
    if (existingCompany) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        existingCompany._id,
        {
          $set: companyData,
          $addToSet: { tags: 'linkedin-scrape' }
        },
        { new: true, runValidators: true }
      );
      
      if (!company) {
        throw new Error('Failed to update company');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Company updated successfully',
        id: company._id,
        company,
        isNew: false
      }, { status: 200 });
      
    } else {
      // Create new company
      company = await Company.create(companyData);
      
      return NextResponse.json({
        success: true,
        message: 'Company created successfully',
        id: company._id,
        company,
        isNew: true
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Error processing LinkedIn company data:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to save company data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check API health
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'extension/company',
    message: 'LinkedIn Company data submission endpoint is active',
    requiredHeaders: ['X-API-Key'],
    requiredFields: ['company']
  });
}
