'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  RectangleStackIcon,
  UserIcon,
  PlusIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  companies: number;
  contacts: number;
  lists: number;
  leads: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    companies: 0,
    contacts: 0,
    lists: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [companiesRes, contactsRes, listsRes, leadsRes] = await Promise.all([
        fetch('/api/companies?limit=1'),
        fetch('/api/contacts?limit=1'),
        fetch('/api/lists?limit=1'),
        fetch('/api/leads?limit=1'),
      ]);

      const [companies, contacts, lists, leads] = await Promise.all([
        companiesRes.json(),
        contactsRes.json(),
        listsRes.json(),
        leadsRes.json(),
      ]);

      setStats({
        companies: companies.pagination?.total || 0,
        contacts: contacts.pagination?.total || 0,
        lists: lists.pagination?.total || 0,
        leads: leads.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Companies',
      value: stats.companies,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 text-blue-600',
      href: '/companies',
    },
    {
      name: 'Total Contacts',
      value: stats.contacts,
      icon: UserGroupIcon,
      color: 'bg-green-50 text-green-600',
      href: '/contacts',
    },
    {
      name: 'Lead Lists',
      value: stats.lists,
      icon: RectangleStackIcon,
      color: 'bg-purple-50 text-purple-600',
      href: '/lists',
    },
    {
      name: 'Legacy Leads',
      value: stats.leads,
      icon: UserIcon,
      color: 'bg-orange-50 text-orange-600',
      href: '/leads',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to your Lead Generation Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                <div className="p-6">
                  <div className="h-12 bg-gray-200 rounded w-12 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          statCards.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/companies/new"
            className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Add Company</p>
                <p className="text-sm text-gray-500">Create new company</p>
              </div>
            </div>
          </Link>

          <Link
            href="/contacts/new"
            className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Add Contact</p>
                <p className="text-sm text-gray-500">Create new contact</p>
              </div>
            </div>
          </Link>

          <Link
            href="/import"
            className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowDownTrayIcon className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Import Data</p>
                <p className="text-sm text-gray-500">Bulk CSV import</p>
              </div>
            </div>
          </Link>

          <Link
            href="/lists"
            className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlusIcon className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Create List</p>
                <p className="text-sm text-gray-500">New campaign list</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
        </div>
        <div className="px-6 py-5">
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-sm font-medium">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Add Companies</p>
                <p className="text-sm text-gray-500">Start by adding companies to your database</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Import Contacts</p>
                <p className="text-sm text-gray-500">Use bulk import or add contacts individually</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Create Lists</p>
                <p className="text-sm text-gray-500">Organize contacts into targeted lists</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-sm font-medium">
                4
              </span>
              <div>
                <p className="font-medium text-gray-900">Start Outreach</p>
                <p className="text-sm text-gray-500">Send personalized email campaigns</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
