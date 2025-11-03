'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  status: string;
  company?: {
    _id: string;
    name: string;
  };
}

interface Company {
  _id: string;
  name: string;
  industry?: string;
  location?: string;
}

interface List {
  _id: string;
  name: string;
  description?: string;
  contacts: Contact[];
  companies: Company[];
  createdAt: string;
  updatedAt: string;
}

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchList();
    }
  }, [params.id]);

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${params.id}`);
      const result = await response.json();
      if (result.success) {
        setList(result.data);
      }
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this list? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/lists/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/lists');
      } else {
        alert('Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('An error occurred while deleting the list');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Remove this contact from the list?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lists/${params.id}/contacts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: [contactId] }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh list
        fetchList();
      } else {
        alert(result.error || 'Failed to remove contact');
      }
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">List not found</p>
        <Link
          href="/lists"
          className="text-indigo-600 hover:text-indigo-900 mt-4 inline-block"
        >
          Back to Lists
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    contacted: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    qualified: 'bg-green-50 text-green-700 ring-green-600/20',
    unqualified: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    converted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lists" className="text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
            <p className="text-sm text-gray-500">
              Created {new Date(list.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5" />
            {deleting ? 'Deleting...' : 'Delete List'}
          </button>
        </div>
      </div>

      {/* Description */}
      {list.description && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p className="text-gray-900">{list.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {list.contacts?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Contacts</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {list.companies?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Companies</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {list.contacts?.length
                  ? Math.round(
                      (list.contacts.filter((c) => c.status === 'qualified')
                        .length /
                        list.contacts.length) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-500">Qualified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {list.contacts && list.contacts.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6" />
              Contacts ({list.contacts.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/contacts/${contact._id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.company ? (
                        <Link
                          href={`/companies/${contact.company._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {contact.company.name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          statusColors[contact.status] || statusColors.new
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveContact(contact._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Companies Table */}
      {list.companies && list.companies.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BuildingOfficeIcon className="h-6 w-6" />
              Companies ({list.companies.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/companies/${company._id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.industry || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/companies/${company._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!list.contacts || list.contacts.length === 0) &&
        (!list.companies || list.companies.length === 0) && (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No contacts or companies yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Go to Contacts page and use "Add to List" to add contacts to this list.
            </p>
            <div className="mt-6">
              <Link
                href="/contacts"
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <UserGroupIcon className="h-5 w-5" />
                Go to Contacts
              </Link>
            </div>
          </div>
        )}
    </div>
  );
}
