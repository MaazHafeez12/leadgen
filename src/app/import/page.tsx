'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [loading, setLoading] = useState(false);
  
  // Manual form state
  const [formData, setFormData] = useState<LeadInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    industry: '',
    location: '',
    website: '',
    linkedinUrl: '',
  });

  // CSV import state
  const [csvData, setCsvData] = useState('');
  const [importResults, setImportResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Lead created successfully!');
        router.push('/leads');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse CSV (simple implementation - assumes comma-separated with headers)
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must have headers and at least one data row');
        setLoading(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const leads = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const lead: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Map common CSV headers to our lead fields
          if (header.includes('first') && header.includes('name')) {
            lead.firstName = value;
          } else if (header.includes('last') && header.includes('name')) {
            lead.lastName = value;
          } else if (header.includes('email')) {
            lead.email = value;
          } else if (header.includes('phone')) {
            lead.phone = value;
          } else if (header.includes('company')) {
            lead.company = value;
          } else if (header.includes('title') || header.includes('position')) {
            lead.title = value;
          } else if (header.includes('industry')) {
            lead.industry = value;
          } else if (header.includes('location') || header.includes('city')) {
            lead.location = value;
          } else if (header.includes('website')) {
            lead.website = value;
          } else if (header.includes('linkedin')) {
            lead.linkedinUrl = value;
          }
        });

        return lead;
      }).filter(lead => lead.email); // Only include leads with email

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });

      const data = await response.json();

      if (data.success) {
        setImportResults(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      alert('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            ← Back to Leads
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Leads</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-8 text-sm font-medium border-b-2 ${
                  activeTab === 'manual'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                className={`py-4 px-8 text-sm font-medium border-b-2 ${
                  activeTab === 'csv'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                CSV Import
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Paste your CSV data below. First row should contain headers.
                    Required: First Name, Last Name, Email
                  </p>
                  <p className="text-sm text-gray-600 mb-4 font-mono bg-gray-100 p-2 rounded">
                    Example: First Name, Last Name, Email, Company, Title
                  </p>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={15}
                    placeholder="First Name, Last Name, Email, Company, Title&#10;John, Doe, john@example.com, Acme Corp, CEO&#10;Jane, Smith, jane@example.com, Tech Inc, CTO"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                {importResults && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Import Results</h3>
                    <p className="text-green-800">✓ Imported: {importResults.imported}</p>
                    <p className="text-yellow-800">⊘ Skipped: {importResults.skipped}</p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-800 font-medium">Errors:</p>
                        {importResults.errors.map((err: any, idx: number) => (
                          <p key={idx} className="text-red-700 text-sm">
                            {err.email}: {err.error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleCsvImport}
                    disabled={loading || !csvData}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Importing...' : 'Import Leads'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
