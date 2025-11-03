'use client';

import { useState } from 'react';
import { 
  GlobeAltIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface WebScraperProps {
  companyId?: string;
  companyWebsite?: string;
  linkedinUrl?: string;
  onDataScraped?: (data: any) => void;
}

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  warning?: string;
  method?: string;
  scrapedAt?: Date;
}

export default function WebScraper({
  companyId,
  companyWebsite,
  linkedinUrl,
  onDataScraped,
}: WebScraperProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'cheerio' | 'playwright'>('cheerio');

  const handleScrapeWebsite = async () => {
    if (!companyWebsite) {
      setError('Company website is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: companyWebsite,
          method,
          checkRobots: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        
        // Save to company if ID provided
        if (companyId && data.data) {
          await saveScrapedData(data.data);
        }
        
        if (onDataScraped) {
          onDataScraped(data.data);
        }
      } else {
        setError(data.error || 'Failed to scrape website');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeLinkedIn = async () => {
    if (!linkedinUrl) {
      setError('LinkedIn URL is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: linkedinUrl,
          type: 'company',
          method: 'playwright' // LinkedIn requires dynamic rendering
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        
        // Save to company if ID provided
        if (companyId && data.data) {
          await saveScrapedData(data.data);
        }
        
        if (onDataScraped) {
          onDataScraped(data.data);
        }
      } else {
        setError(data.error || 'Failed to scrape LinkedIn');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scrape LinkedIn');
    } finally {
      setLoading(false);
    }
  };

  const saveScrapedData = async (data: any) => {
    if (!companyId) return;
    
    try {
      await fetch(`/api/companies/${companyId}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapedData: data }),
      });
    } catch (error) {
      console.error('Failed to save scraped data:', error);
    }
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <GlobeAltIcon className="w-5 h-5" />
          <span>Web Scraping</span>
        </div>
        
        {/* Method Selector */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-600">Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'cheerio' | 'playwright')}
            className="rounded border-gray-300 text-xs"
            disabled={loading}
          >
            <option value="cheerio">Cheerio (Fast)</option>
            <option value="playwright">Playwright (Dynamic)</option>
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">Scraping Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Respects robots.txt automatically</li>
            <li>Use for enrichment purposes only</li>
            <li>Cheerio: Fast, static HTML only</li>
            <li>Playwright: Slower, handles JavaScript</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleScrapeWebsite}
          disabled={loading || !companyWebsite}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <GlobeAltIcon className="w-4 h-4" />
          )}
          Scrape Website
        </button>

        <button
          onClick={handleScrapeLinkedIn}
          disabled={loading || !linkedinUrl}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <GlobeAltIcon className="w-4 h-4" />
          )}
          Scrape LinkedIn
        </button>
      </div>

      {/* Results */}
      {result && result.success && (
        <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Data Scraped Successfully</span>
            <span className="text-xs text-gray-500">({result.method})</span>
          </div>

          {result.warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
              ⚠️ {result.warning}
            </div>
          )}

          <div className="space-y-2 text-sm">
            {result.data?.description && (
              <div>
                <div className="text-gray-500 font-medium mb-1">Description:</div>
                <div className="text-gray-900 text-xs bg-gray-50 p-2 rounded">
                  {result.data.description}
                </div>
              </div>
            )}

            {result.data?.industry && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Industry:</span>
                <span className="text-gray-900">{result.data.industry}</span>
              </div>
            )}

            {result.data?.size && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Size:</span>
                <span className="text-gray-900">{result.data.size}</span>
              </div>
            )}

            {result.data?.socialLinks && Object.keys(result.data.socialLinks).length > 0 && (
              <div>
                <div className="text-gray-500 font-medium mb-1">Social Links:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.data.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {result.data?.headings && result.data.headings.length > 0 && (
              <div>
                <div className="text-gray-500 font-medium mb-1">Key Headings:</div>
                <div className="text-xs text-gray-700 space-y-1">
                  {result.data.headings.slice(0, 5).map((heading: string, idx: number) => (
                    <div key={idx} className="truncate">• {heading}</div>
                  ))}
                </div>
              </div>
            )}

            {companyId && (
              <div className="pt-2 border-t border-gray-200 text-xs text-green-700">
                ✓ Data saved to company record
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Helper Text */}
      {!result && !error && !loading && (
        <div className="text-xs text-gray-500">
          <p className="mb-1">
            <strong>Scrape Website:</strong> Extract description, social links, and key information from company website.
          </p>
          <p>
            <strong>Scrape LinkedIn:</strong> Get company details from LinkedIn (educational use only - use official API for production).
          </p>
        </div>
      )}
    </div>
  );
}
