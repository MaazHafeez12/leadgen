import * as cheerio from 'cheerio';
import axios from 'axios';

/**
 * ScraperService - Utility for web scraping
 * Supports both Cheerio (static HTML) and Playwright (dynamic content)
 */

// Types
export interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  url: string;
  scrapedAt: Date;
  method: 'cheerio' | 'playwright';
}

export interface CompanyScrapedData {
  description?: string;
  about?: string;
  industry?: string;
  size?: string;
  founded?: string;
  headquarters?: string;
  website?: string;
  specialties?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface LinkedInScrapedData {
  name?: string;
  title?: string;
  company?: string;
  location?: string;
  about?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration?: string;
  }>;
  education?: string[];
}

/**
 * Cheerio-based scraper for static HTML content
 * Fast and lightweight, works for sites without heavy JavaScript
 */
export class CheerioScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Fetch and parse HTML with Cheerio
   */
  async scrape(url: string, timeout: number = 10000): Promise<ScrapeResult> {
    try {
      const { data: html } = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      const $ = cheerio.load(html);

      return {
        success: true,
        data: { html, $ },
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to scrape with Cheerio',
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    }
  }

  /**
   * Extract company information from website
   */
  async scrapeCompanyWebsite(url: string): Promise<ScrapeResult> {
    const result = await this.scrape(url);
    
    if (!result.success || !result.data) {
      return result;
    }

    const { $ } = result.data;
    const companyData: CompanyScrapedData = {};

    try {
      // Common patterns for company information
      
      // Description/About - try multiple selectors
      const descriptionSelectors = [
        'meta[name="description"]',
        'meta[property="og:description"]',
        '.company-description',
        '.about-us',
        '#about',
        '[itemprop="description"]',
      ];
      
      for (const selector of descriptionSelectors) {
        const text = $(selector).attr('content') || $(selector).text().trim();
        if (text && text.length > 20) {
          companyData.description = text;
          break;
        }
      }

      // Title (could indicate industry)
      const title = $('title').text().trim();
      if (title) {
        companyData.about = title;
      }

      // Look for social links
      const socialLinks: any = {};
      $('a[href*="linkedin.com"]').each((_: any, el: any) => {
        const href = $(el).attr('href');
        if (href && !socialLinks.linkedin) {
          socialLinks.linkedin = href;
        }
      });
      $('a[href*="twitter.com"], a[href*="x.com"]').each((_: any, el: any) => {
        const href = $(el).attr('href');
        if (href && !socialLinks.twitter) {
          socialLinks.twitter = href;
        }
      });
      $('a[href*="facebook.com"]').each((_: any, el: any) => {
        const href = $(el).attr('href');
        if (href && !socialLinks.facebook) {
          socialLinks.facebook = href;
        }
      });
      
      if (Object.keys(socialLinks).length > 0) {
        companyData.socialLinks = socialLinks;
      }

      // Extract all headings for context
      const headings: string[] = [];
      $('h1, h2, h3').each((_: any, el: any) => {
        const text = $(el).text().trim();
        if (text.length > 3 && text.length < 100) {
          headings.push(text);
        }
      });

      return {
        success: true,
        data: {
          ...companyData,
          headings: headings.slice(0, 10), // Top 10 headings
          rawTitle: title,
        },
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to extract company data: ${error.message}`,
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    }
  }

  /**
   * Extract LinkedIn profile data (public profiles only)
   */
  async scrapeLinkedInProfile(url: string): Promise<ScrapeResult> {
    const result = await this.scrape(url);
    
    if (!result.success || !result.data) {
      return result;
    }

    const { $ } = result.data;
    const profileData: LinkedInScrapedData = {};

    try {
      // Note: LinkedIn heavily uses JavaScript, so this will only work
      // for very basic public profile data. Most content requires Playwright.
      
      profileData.name = $('h1').first().text().trim() || 
                        $('[class*="name"]').first().text().trim();
      
      profileData.title = $('[class*="headline"]').first().text().trim() ||
                         $('h2').first().text().trim();

      // Meta tags might have some data
      const ogTitle = $('meta[property="og:title"]').attr('content');
      if (ogTitle) {
        profileData.name = ogTitle.split('-')[0]?.trim() || profileData.name;
      }

      return {
        success: true,
        data: profileData,
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to extract LinkedIn data: ${error.message}`,
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    }
  }

  /**
   * Generic text extraction from any webpage
   */
  async extractText(url: string, selectors: string[]): Promise<ScrapeResult> {
    const result = await this.scrape(url);
    
    if (!result.success || !result.data) {
      return result;
    }

    const { $ } = result.data;
    const extracted: any = {};

    try {
      selectors.forEach((selector, index) => {
        const element = $(selector);
        extracted[`selector_${index}`] = {
          selector,
          text: element.text().trim(),
          html: element.html(),
          count: element.length,
        };
      });

      return {
        success: true,
        data: extracted,
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to extract text: ${error.message}`,
        url,
        scrapedAt: new Date(),
        method: 'cheerio',
      };
    }
  }
}

/**
 * Playwright-based scraper for dynamic content
 * Handles JavaScript-heavy sites, slower but more powerful
 */
export class PlaywrightScraper {
  /**
   * Scrape with Playwright (headless browser)
   * Note: This requires @sparticuz/chromium for serverless deployment
   */
  async scrape(url: string, waitForSelector?: string): Promise<ScrapeResult> {
    let browser;
    
    try {
      // Dynamic import to avoid issues if not installed
      const { chromium } = await import('playwright-core');
      
      // Check if running in serverless environment
      let executablePath: string | undefined;
      let args: string[] = [];
      
      try {
        const chromiumBinary = await import('@sparticuz/chromium');
        executablePath = await chromiumBinary.default.executablePath();
        args = chromiumBinary.default.args;
      } catch {
        // Running locally, use system Chromium
        executablePath = undefined;
        args = ['--no-sandbox', '--disable-setuid-sandbox'];
      }

      browser = await chromium.launch({
        args,
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();
      
      // Set realistic user agent
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for specific selector if provided
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {});
      }

      const content = await page.content();
      const title = await page.title();

      await browser.close();

      return {
        success: true,
        data: { html: content, title },
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    } catch (error: any) {
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      return {
        success: false,
        error: error.message || 'Failed to scrape with Playwright',
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    }
  }

  /**
   * Scrape company LinkedIn page (requires dynamic rendering)
   */
  async scrapeLinkedInCompany(url: string): Promise<ScrapeResult> {
    const result = await this.scrape(url, '[class*="org-top-card"]');
    
    if (!result.success || !result.data) {
      return result;
    }

    const { html } = result.data;
    const $ = cheerio.load(html);
    const companyData: CompanyScrapedData = {};

    try {
      // Extract company information from rendered page
      companyData.description = $('[class*="org-about-us-organization-description"]').text().trim();
      companyData.industry = $('[class*="org-page-details__definition-text"]').first().text().trim();
      companyData.size = $('[class*="org-about-company-module__company-size-definition"]').text().trim();
      
      // Website link
      const websiteLink = $('a[href*="http"]').filter((_, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('website') || text.includes('www');
      }).attr('href');
      
      if (websiteLink) {
        companyData.website = websiteLink;
      }

      return {
        success: true,
        data: companyData,
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to extract LinkedIn company data: ${error.message}`,
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    }
  }

  /**
   * Screenshot functionality (useful for debugging)
   */
  async screenshot(url: string, outputPath: string): Promise<ScrapeResult> {
    let browser;
    
    try {
      const { chromium } = await import('playwright-core');
      
      let executablePath: string | undefined;
      let args: string[] = [];
      
      try {
        const chromiumBinary = await import('@sparticuz/chromium');
        executablePath = await chromiumBinary.default.executablePath();
        args = chromiumBinary.default.args;
      } catch {
        executablePath = undefined;
        args = ['--no-sandbox', '--disable-setuid-sandbox'];
      }

      browser = await chromium.launch({ args, executablePath, headless: true });
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: outputPath, fullPage: true });
      
      await browser.close();

      return {
        success: true,
        data: { screenshotPath: outputPath },
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    } catch (error: any) {
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      return {
        success: false,
        error: error.message,
        url,
        scrapedAt: new Date(),
        method: 'playwright',
      };
    }
  }
}

/**
 * Factory function to get appropriate scraper
 */
export function getScraper(method: 'cheerio' | 'playwright' = 'cheerio') {
  if (method === 'playwright') {
    return new PlaywrightScraper();
  }
  return new CheerioScraper();
}

/**
 * Utility to check robots.txt compliance
 */
export async function checkRobotsTxt(url: string, userAgent: string = '*'): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.origin}/robots.txt`;
    
    const { data } = await axios.get(robotsUrl, { timeout: 5000 });
    const robotsTxt = data.toString();
    
    // Very basic robots.txt parsing
    // In production, use a proper robots.txt parser library
    const lines = robotsTxt.split('\n');
    let currentUserAgent = '';
    let disallowed: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        currentUserAgent = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('disallow:') && (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
        const path = trimmed.split(':')[1].trim();
        disallowed.push(path);
      }
    }
    
    // Check if URL path is disallowed
    const path = urlObj.pathname;
    for (const disallow of disallowed) {
      if (disallow === '/' || path.startsWith(disallow)) {
        return false; // Not allowed
      }
    }
    
    return true; // Allowed
  } catch {
    // If robots.txt doesn't exist, assume allowed
    return true;
  }
}

export default {
  CheerioScraper,
  PlaywrightScraper,
  getScraper,
  checkRobotsTxt,
};
