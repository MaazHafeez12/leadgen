'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface EmailEnrichmentProps {
  firstName: string;
  lastName: string;
  domain?: string;
  currentEmail?: string;
  contactId?: string; // Optional: if provided, will save enrichment data
  onEmailFound?: (email: string) => void;
  onEmailVerified?: (data: VerificationResult) => void;
}

interface FindResult {
  email: string;
  score: number;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  type: string;
  confidence?: number;
  sources: number;
}

interface VerificationResult {
  email: string;
  status: string;
  result: string;
  score: number;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mxRecords: boolean;
  smtp: {
    server: boolean;
    check: boolean;
  };
  acceptAll: boolean;
  block: boolean;
  domain: string;
  sources: number;
}

export default function EmailEnrichment({
  firstName,
  lastName,
  domain,
  currentEmail,
  contactId,
  onEmailFound,
  onEmailVerified,
}: EmailEnrichmentProps) {
  const [findLoading, setFindLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [findResult, setFindResult] = useState<FindResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [findError, setFindError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const saveEnrichmentData = async (data: any) => {
    if (!contactId) return;
    
    try {
      await fetch(`/api/contacts/${contactId}/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrichmentData: data }),
      });
    } catch (error) {
      console.error('Failed to save enrichment data:', error);
    }
  };

  const handleFindEmail = async () => {
    if (!domain) {
      setFindError('Domain is required. Please enter a company domain.');
      return;
    }

    setFindLoading(true);
    setFindError(null);
    setFindResult(null);

    try {
      const response = await fetch('/api/hunter/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, domain }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFindResult(result.data);
        if (onEmailFound) {
          onEmailFound(result.data.email);
        }
        
        // Save enrichment data if contactId provided
        if (contactId) {
          await saveEnrichmentData({
            verified: true,
            score: result.data.score,
            emailType: result.data.type,
            sources: result.data.sources,
            hunterData: {
              position: result.data.position,
              department: result.data.department,
            },
          });
        }
      } else {
        setFindError(result.error || result.message || 'No email found');
      }
    } catch (error: any) {
      setFindError(error.message || 'Failed to find email');
    } finally {
      setFindLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const emailToVerify = currentEmail || findResult?.email;
    if (!emailToVerify) {
      setVerifyError('No email to verify. Please enter an email or find one first.');
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/hunter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setVerifyResult(result.data);
        if (onEmailVerified) {
          onEmailVerified(result.data);
        }
        
        // Save verification data if contactId provided
        if (contactId) {
          await saveEnrichmentData({
            verified: result.data.result === 'deliverable',
            verificationStatus: result.data.status,
            verificationResult: result.data.result,
            score: result.data.score,
            sources: result.data.sources,
            hunterData: {
              disposable: result.data.disposable,
              webmail: result.data.webmail,
              acceptAll: result.data.acceptAll,
              mxRecords: result.data.mxRecords,
              smtpCheck: result.data.smtp.check,
            },
          });
        }
      } else {
        setVerifyError(result.error || 'Failed to verify email');
      }
    } catch (error: any) {
      setVerifyError(error.message || 'Failed to verify email');
    } finally {
      setVerifyLoading(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'deliverable':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'undeliverable':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'risky':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'deliverable':
        return 'bg-green-100 text-green-800';
      case 'undeliverable':
        return 'bg-red-100 text-red-800';
      case 'risky':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <EnvelopeIcon className="w-5 h-5" />
        <span>Email Enrichment (Hunter.io)</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleFindEmail}
          disabled={findLoading || !firstName || !lastName || !domain}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {findLoading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4" />
          )}
          Find Email
        </button>

        <button
          onClick={handleVerifyEmail}
          disabled={verifyLoading || (!currentEmail && !findResult?.email)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {verifyLoading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircleIcon className="w-4 h-4" />
          )}
          Verify Email
        </button>
      </div>

      {/* Find Email Result */}
      {findResult && (
        <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Email Found</span>
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(findResult.score)}`}>
              {findResult.score}%
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium text-gray-900">{findResult.email}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                findResult.type === 'personal' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {findResult.type}
              </span>
            </div>

            {findResult.position && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Position:</span>
                <span className="text-gray-900">{findResult.position}</span>
              </div>
            )}

            {findResult.department && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Department:</span>
                <span className="text-gray-900">{findResult.department}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sources:</span>
              <span className="text-gray-900">{findResult.sources}</span>
            </div>

            {findResult.confidence !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Confidence:</span>
                <span className={`font-medium ${getScoreColor(findResult.confidence)}`}>
                  {findResult.confidence}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {findError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{findError}</div>
        </div>
      )}

      {/* Verify Email Result */}
      {verifyResult && (
        <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getResultIcon(verifyResult.result)}
              <span className="font-medium text-gray-900">Verification Result</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultBadgeColor(verifyResult.result)}`}>
              {verifyResult.result.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium text-gray-900">{verifyResult.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Deliverability Score:</span>
              <span className={`text-lg font-bold ${getScoreColor(verifyResult.score)}`}>
                {verifyResult.score}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <span className="text-gray-900">{verifyResult.status}</span>
            </div>

            {/* Verification Checks */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Verification Checks:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {verifyResult.regexp ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>Valid Format</span>
                </div>

                <div className="flex items-center gap-1">
                  {verifyResult.mxRecords ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>MX Records</span>
                </div>

                <div className="flex items-center gap-1">
                  {verifyResult.smtp.check ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>SMTP Check</span>
                </div>

                <div className="flex items-center gap-1">
                  {!verifyResult.disposable ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>Not Disposable</span>
                </div>

                <div className="flex items-center gap-1">
                  {!verifyResult.gibberish ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>Not Gibberish</span>
                </div>

                <div className="flex items-center gap-1">
                  {!verifyResult.block ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span>Not Blocked</span>
                </div>
              </div>
            </div>

            {verifyResult.webmail && (
              <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                ⚠️ This is a webmail address (Gmail, Yahoo, etc.)
              </div>
            )}

            {verifyResult.acceptAll && (
              <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                ℹ️ Server accepts all emails (catch-all)
              </div>
            )}
          </div>
        </div>
      )}

      {verifyError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{verifyError}</div>
        </div>
      )}

      {/* Helper Text */}
      {!findResult && !verifyResult && !findError && !verifyError && (
        <div className="text-xs text-gray-500">
          <p className="mb-1">
            <strong>Find Email:</strong> Discovers email address based on name and company domain (requires valid domain).
          </p>
          <p>
            <strong>Verify Email:</strong> Checks if an email address is valid and deliverable.
          </p>
        </div>
      )}
    </div>
  );
}
