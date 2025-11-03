'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  _id: string;
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
  status: string;
  source?: string;
  notes?: string;
  enrichmentData?: {
    verified: boolean;
    score?: number;
    lastEnriched?: Date;
  };
  createdAt: string;
  updatedAt: string;
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setLead(data.data);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrich = async () => {
    if (!lead) return;
    setEnriching(true);

    try {
      const response = await fetch('/api/leads/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead._id,
          email: lead.email,
          domain: lead.company ? `${lead.company.toLowerCase().replace(/\s/g, '')}.com` : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Email enriched successfully!');
        fetchLead();
      }
    } catch (error) {
      console.error('Error enriching lead:', error);
      alert('Failed to enrich lead');
    } finally {
      setEnriching(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/leads');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead not found</h2>
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            ← Back to Leads
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lead.firstName} {lead.lastName}
              </h1>
              {lead.title && lead.company && (
                <p className="text-lg text-gray-600">
                  {lead.title} at {lead.company}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEnrich}
                disabled={enriching}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {enriching ? 'Enriching...' : '✨ Enrich'}
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{lead.email}</p>
                  {lead.enrichmentData?.verified && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{lead.phone}</p>
                  </div>
                )}
                {lead.linkedinUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                    <a
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Company Information
              </h2>
              <div className="space-y-3">
                {lead.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-gray-900">{lead.company}</p>
                  </div>
                )}
                {lead.industry && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-gray-900">{lead.industry}</p>
                  </div>
                )}
                {lead.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{lead.location}</p>
                  </div>
                )}
                {lead.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="border-t pt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {lead.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Source: {lead.source || 'manual'}
                  </span>
                </div>
              </div>

              {lead.enrichmentData?.score && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Enrichment Score
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-green-600">
                      {lead.enrichmentData.score}
                    </div>
                    <div className="text-sm text-gray-500">/100</div>
                  </div>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-8 mt-8">
            <div className="text-sm text-gray-500">
              <p>Created: {new Date(lead.createdAt).toLocaleString()}</p>
              <p>Last Updated: {new Date(lead.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
