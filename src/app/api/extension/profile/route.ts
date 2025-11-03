import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

/**
 * API endpoint for Chrome Extension to submit LinkedIn profile data
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
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Extract LinkedIn username from URL
    let linkedInUsername = '';
    if (data.url) {
      const urlMatch = data.url.match(/linkedin\.com\/in\/([^/?]+)/);
      if (urlMatch) {
        linkedInUsername = urlMatch[1];
      }
    }
    
    // Parse name into first and last name
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Prepare contact data
    const contactData = {
      firstName,
      lastName,
      email: data.email || '',
      title: data.title || '',
      company: data.company || '',
      location: data.location || '',
      phone: '',
      status: 'new',
      source: 'Chrome Extension',
      notes: data.about || '',
      linkedInUrl: data.url || '',
      tags: ['linkedin-scrape'],
      customFields: {
        linkedInUsername,
        currentPosition: data.currentPosition || data.title,
        experience: data.experience || [],
        scrapedAt: new Date().toISOString(),
        scrapedFrom: 'chrome-extension'
      }
    };
    
    // Check if contact already exists (by LinkedIn URL or email)
    let existingContact = null;
    
    if (data.url) {
      existingContact = await Contact.findOne({ linkedInUrl: data.url });
    }
    
    if (!existingContact && data.email) {
      existingContact = await Contact.findOne({ email: data.email });
    }
    
    let contact;
    
    if (existingContact) {
      // Update existing contact
      contact = await Contact.findByIdAndUpdate(
        existingContact._id,
        {
          $set: contactData,
          $addToSet: { tags: 'linkedin-scrape' }
        },
        { new: true, runValidators: true }
      );
      
      if (!contact) {
        throw new Error('Failed to update contact');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Contact updated successfully',
        id: contact._id,
        contact,
        isNew: false
      }, { status: 200 });
      
    } else {
      // Create new contact
      contact = await Contact.create(contactData);
      
      return NextResponse.json({
        success: true,
        message: 'Contact created successfully',
        id: contact._id,
        contact,
        isNew: true
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Error processing LinkedIn profile data:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to save profile data',
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
    endpoint: 'extension/profile',
    message: 'LinkedIn Profile data submission endpoint is active',
    requiredHeaders: ['X-API-Key'],
    requiredFields: ['name']
  });
}
