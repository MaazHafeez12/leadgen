import { NextRequest, NextResponse } from 'next/server';
import { CheerioScraper, PlaywrightScraper, checkRobotsTxt } from '@/lib/scraper';

/**
 * POST /api/scrape/company
 * Scrape company website for information
 * 
 * Body: { url, method?: 'cheerio' | 'playwright', checkRobots?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const { url, method = 'cheerio', checkRobots = true } = await req.json();

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    let urlObj: URL;
    try {
      urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check robots.txt if requested
    if (checkRobots) {
      const allowed = await checkRobotsTxt(urlObj.toString());
      if (!allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Scraping this URL is disallowed by robots.txt',
            robotsCompliance: false
          },
          { status: 403 }
        );
      }
    }

    // Scrape based on method
    let result;
    if (method === 'playwright') {
      const scraper = new PlaywrightScraper();
      result = await scraper.scrape(urlObj.toString());
      
      // If successful, parse with Cheerio for company data
      if (result.success && result.data?.html) {
        const cheerioScraper = new CheerioScraper();
        const parseResult = await cheerioScraper.scrapeCompanyWebsite(urlObj.toString());
        result.data = { ...result.data, ...parseResult.data };
      }
    } else {
      const scraper = new CheerioScraper();
      result = await scraper.scrapeCompanyWebsite(urlObj.toString());
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to scrape company website',
          url: urlObj.toString()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        url: urlObj.toString(),
        method: result.method,
        scrapedAt: result.scrapedAt,
        robotsCompliance: checkRobots,
      }
    });

  } catch (error: any) {
    console.error('Company scraping error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
