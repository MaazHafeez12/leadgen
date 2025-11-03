import { NextRequest, NextResponse } from 'next/server';
import { CheerioScraper, PlaywrightScraper } from '@/lib/scraper';

/**
 * POST /api/scrape/linkedin
 * Scrape LinkedIn profile or company page
 * 
 * Body: { url, type: 'profile' | 'company', method?: 'cheerio' | 'playwright' }
 * 
 * NOTE: LinkedIn heavily restricts scraping. This is for educational purposes.
 * Use LinkedIn's official API or Hunter.io for production applications.
 */
export async function POST(req: NextRequest) {
  try {
    const { url, type = 'profile', method = 'playwright' } = await req.json();

    // Validate inputs
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!['profile', 'company'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "profile" or "company"' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL
    if (!url.includes('linkedin.com')) {
      return NextResponse.json(
        { success: false, error: 'URL must be a LinkedIn URL' },
        { status: 400 }
      );
    }

    // Warning about LinkedIn scraping
    const warning = 'LinkedIn restricts automated scraping. Use their official API or this for educational/personal use only.';

    let result;
    
    if (method === 'playwright') {
      const scraper = new PlaywrightScraper();
      
      if (type === 'company') {
        result = await scraper.scrapeLinkedInCompany(url);
      } else {
        // For profiles, we need the rendered content
        result = await scraper.scrape(url, 'h1');
      }
    } else {
      const scraper = new CheerioScraper();
      result = await scraper.scrapeLinkedInProfile(url);
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to scrape LinkedIn',
          warning,
          url
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      warning,
      meta: {
        url,
        type,
        method: result.method,
        scrapedAt: result.scrapedAt,
      }
    });

  } catch (error: any) {
    console.error('LinkedIn scraping error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        warning: 'LinkedIn restricts automated scraping. Consider using their official API.'
      },
      { status: 500 }
    );
  }
}
