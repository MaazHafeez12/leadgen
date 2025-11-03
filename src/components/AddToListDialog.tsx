'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface List {
  _id: string;
  name: string;
  description?: string;
}

interface AddToListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContactIds: string[];
  onSuccess?: () => void;
}

export default function AddToListDialog({
  isOpen,
  onClose,
  selectedContactIds,
  onSuccess,
}: AddToListDialogProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists');
      const result = await response.json();
      if (result.success) {
        setLists(result.data);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleAddToList = async () => {
    if (!selectedListId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${selectedListId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: selectedContactIds }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(result.error || 'Failed to add contacts to list');
      }
    } catch (error) {
      console.error('Error adding to list:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) return;

    setLoading(true);
    try {
      // Create new list
      const createResponse = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
        }),
      });

      const createResult = await createResponse.json();

      if (createResult.success) {
        // Add contacts to new list
        const addResponse = await fetch(
          `/api/lists/${createResult.data._id}/contacts`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactIds: selectedContactIds }),
          }
        );

        const addResult = await addResponse.json();

        if (addResult.success) {
          onSuccess?.();
          onClose();
          setShowCreateForm(false);
          setNewListName('');
          setNewListDescription('');
        }
      } else {
        alert(createResult.error || 'Failed to create list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    Add to List ({selectedContactIds.length} contact
                    {selectedContactIds.length !== 1 ? 's' : ''})
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {!showCreateForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select List
                      </label>
                      <select
                        value={selectedListId}
                        onChange={(e) => setSelectedListId(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      >
                        <option value="">Choose a list...</option>
                        {lists.map((list) => (
                          <option key={list._id} value={list._id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddToList}
                        disabled={!selectedListId || loading}
                        className="flex-1 inline-flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add to List'}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <PlusIcon className="h-5 w-5" />
                        New List
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        List Name *
                      </label>
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="e.g., Q4 Prospects"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        rows={3}
                        placeholder="Optional description"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCreateAndAdd}
                        disabled={!newListName.trim() || loading}
                        className="flex-1 inline-flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create & Add'}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
