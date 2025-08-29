'use client';

import { useState } from 'react';
import { useGet } from '@/lib/client/useSWR';
import { Supplier } from '@/lib/contracts/core';
import { api } from '@/lib/client/api';
import { mutate } from 'swr';

export default function SuppliersPage() {
  const { data: suppliers, error } = useGet<Supplier[]>('/api/suppliers');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setIsSubmitting(true);
    try {
      await api('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName }),
      });
      setNewSupplierName('');
      mutate('/api/suppliers');
    } catch (error) {
      console.error('Failed to create supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Suppliers</h1>
        <div className="text-red-600">
          Error loading suppliers: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Supplier name"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newSupplierName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Add Supplier'}
          </button>
        </form>
      </div>

      {!suppliers ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
          <p className="text-gray-500">No suppliers yet. Add one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        supplier.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
