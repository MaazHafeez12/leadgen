'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  title?: string;
  status?: string;
}

interface OutreachRecord {
  _id: string;
  contactId: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  campaignName: string;
  subject: string;
  body: string;
  status: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  openCount: number;
  clickCount: number;
}

interface Stats {
  draft: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

interface Campaign {
  name: string;
  count: number;
  sent: number;
  opened: number;
  clicked: number;
  openRate: string;
  clickRate: string;
  lastSent?: string;
}

export default function OutreachDashboard() {
  const [activeTab, setActiveTab] = useState<'compose' | 'campaigns' | 'history'>('compose');
  
  // Compose form state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState<Stats>({
    draft: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [outreachHistory, setOutreachHistory] = useState<OutreachRecord[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  // Load contacts
  useEffect(() => {
    loadContacts();
    checkSmtpConfiguration();
  }, []);

  // Load stats and history when switching tabs
  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadStats();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const checkSmtpConfiguration = async () => {
    try {
      const response = await fetch('/api/email/send');
      const data = await response.json();
      setSmtpConfigured(data.success);
    } catch (error) {
      setSmtpConfigured(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/outreach/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/outreach?limit=50');
      const data = await response.json();
      if (data.success) {
        setOutreachHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(c => c._id));
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = body;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setBody(before + `{${variable}}` + after);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    } else {
      setBody(body + `{${variable}}`);
    }
  };

  const handleSendEmails = async () => {
    if (selectedContactIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one contact' });
      return;
    }

    if (!subject || !body) {
      setMessage({ type: 'error', text: 'Subject and body are required' });
      return;
    }

    if (!campaignName) {
      setMessage({ type: 'error', text: 'Campaign name is required' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: selectedContactIds,
          subject,
          body,
          campaignName,
          useTemplate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully sent ${data.stats.sent} email(s)! ${data.stats.failed > 0 ? `${data.stats.failed} failed.` : ''}`,
        });
        
        // Reset form
        setSelectedContactIds([]);
        setSubject('');
        setBody('');
        
        // Reload stats
        loadStats();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while sending emails' });
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'clicked':
        return <MousePointer className="w-4 h-4 text-purple-600" />;
      case 'bounced':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'opened':
        return 'bg-green-100 text-green-800';
      case 'clicked':
        return 'bg-purple-100 text-purple-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="w-8 h-8" />
            Outreach Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage email campaigns and track engagement</p>
        </div>

        {/* SMTP Warning */}
        {!smtpConfigured && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>SMTP not configured:</strong> Please set up your SMTP credentials in
                  <code className="mx-1 px-2 py-1 bg-yellow-100 rounded">.env.local</code>
                  to send emails.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('compose')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'compose'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Compose
                </div>
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Campaigns
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  History
                </div>
              </button>
            </nav>
          </div>

          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="p-6">
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Selection */}
                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Recipients
                    </h3>
                    <button
                      onClick={selectAllContacts}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedContactIds.length === contacts.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {contacts.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">
                        No contacts found. Add contacts first.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((contact) => (
                          <label
                            key={contact._id}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedContactIds.includes(contact._id)}
                              onChange={() => toggleContactSelection(contact._id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                              {contact.company && (
                                <p className="text-xs text-gray-400 truncate">{contact.company}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>{selectedContactIds.length}</strong> recipient(s) selected
                    </p>
                  </div>
                </div>

                {/* Email Composition */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Compose Email
                  </h3>

                  <div className="space-y-4">
                    {/* Campaign Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g., Q1 Outreach"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Template Variables */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insert Variables
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['FirstName', 'LastName', 'FullName', 'Email', 'Company', 'Title', 'Location'].map((variable) => (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => insertVariable(variable)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition"
                          >
                            {'{' + variable + '}'}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={useTemplate}
                            onChange={(e) => setUseTemplate(e.target.checked)}
                          />
                          Replace variables with contact data
                        </label>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Body *
                      </label>
                      <textarea
                        id="email-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={12}
                        placeholder="Write your email message here... Use variables like {FirstName} and {Company} for personalization."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>

                    {/* Send Button */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignName('');
                          setSubject('');
                          setBody('');
                          setSelectedContactIds([]);
                        }}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleSendEmails}
                        disabled={sending || !smtpConfigured || selectedContactIds.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                        {sending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Emails
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <p className="text-xs font-medium text-gray-600 uppercase">Draft</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600 uppercase">Sent</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stats.sent}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600 uppercase">Opened</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{stats.opened}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-medium text-purple-600 uppercase">Clicked</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{stats.clicked}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-medium text-red-600 uppercase">Bounced</p>
                  </div>
                  <p className="text-2xl font-bold text-red-900">{stats.bounced}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-medium text-red-600 uppercase">Failed</p>
                  </div>
                  <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
                </div>
              </div>

              {/* Campaigns List */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaigns</h3>

              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet. Start by sending your first email!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.name} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Total</p>
                              <p className="font-semibold text-gray-900">{campaign.count}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sent</p>
                              <p className="font-semibold text-blue-600">{campaign.sent}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Opened</p>
                              <p className="font-semibold text-green-600">{campaign.opened}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Open Rate</p>
                              <p className="font-semibold text-gray-900">{campaign.openRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Click Rate</p>
                              <p className="font-semibold text-gray-900">{campaign.clickRate}%</p>
                            </div>
                          </div>
                        </div>
                        {campaign.lastSent && (
                          <p className="text-xs text-gray-500">
                            Last sent: {new Date(campaign.lastSent).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sent Emails</h3>

              {outreachHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No emails sent yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Opens</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {outreachHistory.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {record.contactId?.firstName} {record.contactId?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{record.contactId?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{record.campaignName}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{record.subject}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {record.sentAt ? new Date(record.sentAt).toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-center text-gray-900">{record.openCount}</td>
                          <td className="px-4 py-4 text-sm text-center text-gray-900">{record.clickCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
