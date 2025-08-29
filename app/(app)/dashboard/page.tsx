type Card = {
  label: string;
  value: string;
  sub: string;
  icon: string;
  badgeClass: string;
};

const cards: Card[] = [
  {
    label: 'Spend Sourced',
    value: '$425,000.00',
    sub: '+12%',
    icon: '💵',
    badgeClass: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Savings Secured',
    value: '$35,200.00',
    sub: '+8.3% cost saved',
    icon: '📈',
    badgeClass: 'bg-green-100 text-green-600',
  },
  {
    label: 'Active Projects',
    value: '2',
    sub: 'In Progress',
    icon: '📊',
    badgeClass: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'Active Suppliers',
    value: '2',
    sub: '3 total',
    icon: '🏢',
    badgeClass: 'bg-indigo-100 text-indigo-600',
  },
];

export default function Dashboard() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div
                className={`w-12 h-12 ${c.badgeClass} rounded-lg flex items-center justify-center text-xl`}
              >
                {c.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{c.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {c.value}
                </p>
                <p className="text-xs text-gray-600">{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              • Manufacturing Equipment Procurement project updated with new
              savings target
            </li>
            <li>• New supplier TechSource Global added to the platform</li>
            <li>• ERP integration health check completed successfully</li>
          </ul>
        </div>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ERP Integration Status
        </h3>
        <div className="flex flex-wrap gap-3">
          {['Epicor', 'NetSuite', 'SAP S/4HANA', 'Dynamics BC'].map(
            (name, i) => (
              <div
                key={name}
                className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                {name}{' '}
                {i > 0 && (
                  <span className="ml-2 text-xs text-gray-500 border rounded px-2 py-0.5">
                    Mock Mode
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
