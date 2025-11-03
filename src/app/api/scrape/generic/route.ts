import { NextRequest, NextResponse } from 'next/server';
import { CheerioScraper, PlaywrightScraper, checkRobotsTxt } from '@/lib/scraper';

/**
 * POST /api/scrape/generic
 * Generic scraping endpoint with custom selectors
 * 
 * Body: { 
 *   url, 
 *   selectors?: string[], 
 *   method?: 'cheerio' | 'playwright',
 *   checkRobots?: boolean,
 *   waitForSelector?: string (for Playwright)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { 
      url, 
      selectors = [], 
      method = 'cheerio', 
      checkRobots = true,
      waitForSelector 
    } = await req.json();

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

    let result;

    if (method === 'playwright') {
      const scraper = new PlaywrightScraper();
      result = await scraper.scrape(urlObj.toString(), waitForSelector);
    } else {
      const scraper = new CheerioScraper();
      
      if (selectors.length > 0) {
        // Extract specific selectors
        result = await scraper.extractText(urlObj.toString(), selectors);
      } else {
        // General scrape
        result = await scraper.scrape(urlObj.toString());
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to scrape URL',
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
        selectorsUsed: selectors.length,
      }
    });

  } catch (error: any) {
    console.error('Generic scraping error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
