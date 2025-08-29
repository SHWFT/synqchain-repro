'use client';

import { useGet } from '@/lib/client/useSWR';
import { KpisResponse } from '@/lib/contracts/kpis';
import { ActivityItem, ERPHealth } from '@/lib/contracts/core';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis, error: errKpis } = useGet<KpisResponse>(
    '/api/analytics/kpis'
  );
  const { data: activity } = useGet<ActivityItem[]>('/api/analytics/activity');
  const { data: erp } = useGet<ERPHealth>('/api/erps/health');

  const isLoading = !kpis && !errKpis;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your
            procurement.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
            + New Project
          </button>
          <button className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
            + Add Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="Total Spend"
          value={kpis ? formatCurrency(kpis.cards.totalSpend) : '$0'}
          icon="💵"
          isLoading={isLoading}
        />
        <KpiCard
          label="Platform Savings"
          value={kpis ? formatCurrency(kpis.cards.platformSavings) : '$0'}
          icon="📈"
          isLoading={isLoading}
        />
        <KpiCard
          label="Active Projects"
          value={kpis ? kpis.cards.activeProjects.toString() : '0'}
          icon="📊"
          isLoading={isLoading}
        />
        <KpiCard
          label="Active Suppliers"
          value={kpis ? kpis.cards.activeSuppliers.toString() : '0'}
          icon="🏢"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          {!activity ? (
            <div className="space-y-3">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : activity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <ul className="space-y-3 text-sm text-gray-700">
              {activity.map((item) => (
                <li key={item.id}>• {item.title}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm hover:bg-gray-50">
              Create New Project
            </button>
            <button className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm hover:bg-gray-50">
              Add Supplier
            </button>
            <button className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm hover:bg-gray-50">
              View Analytics
            </button>
            <button className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm hover:bg-gray-50">
              Test ERP Connection
            </button>
          </div>
        </div>
      </div>

      {/* ERP Integration Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ERP Integration Status
        </h3>
        {!erp ? (
          <div className="flex gap-3">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
            <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
            <div className="animate-pulse h-8 bg-gray-200 rounded w-28"></div>
          </div>
        ) : erp.length === 0 ? (
          <p className="text-gray-500 text-sm">No ERP connections configured</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {erp.map((system) => (
              <div
                key={system.name}
                className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm"
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    system.status === 'connected'
                      ? 'bg-green-500'
                      : system.status === 'mock'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
                {system.name}{' '}
                {system.status === 'mock' && (
                  <span className="ml-2 text-xs text-gray-500 border rounded px-2 py-0.5">
                    Mock Mode
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
