'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ListBulletIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface List {
  _id: string;
  name: string;
  description?: string;
  leads: any[];
  contacts: any[];
  companies: any[];
  createdAt: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists');
      const data = await response.json();

      if (data.success) {
        setLists(data.data);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });

      const data = await response.json();

      if (data.success) {
        setLists([data.data, ...lists]);
        setNewList({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Lists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize contacts into custom groups for outreach and tracking
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-5 w-5" />
            {showCreateForm ? 'Cancel' : 'Create List'}
          </button>
        </div>
      </div>

      {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New List</h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  required
                  placeholder="e.g., Q4 Prospects, Tech Leads, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newList.description}
                  onChange={(e) =>
                    setNewList({ ...newList, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description for this list"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lists Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading lists...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No lists yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first list
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <Link href={`/lists/${list._id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ListBulletIcon className="h-6 w-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                        {list.name}
                      </h3>
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{list.description}</p>
                  )}
                  <div className="flex gap-4 mb-4">
                    {list.contacts && list.contacts.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {list.contacts.length} contact{list.contacts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {list.companies && list.companies.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        {list.companies.length} compan{list.companies.length !== 1 ? 'ies' : 'y'}
                      </span>
                    )}
                    {list.leads && list.leads.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                        {list.leads.length} lead{list.leads.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {new Date(list.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
