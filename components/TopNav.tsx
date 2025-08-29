'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/po', label: 'PO Management' },
  { href: '/supplier-portal', label: 'Supplier Portal' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/erp-integration', label: 'ERP Integration' },
];

export default function TopNav() {
  const pathname = usePathname() || '/dashboard';
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-white via-gray-50 to-gray-200 rounded-xl flex items-center justify-center shadow-md border border-gray-200">
          <img
            src="/brand/synqchain-new-logo.png"
            alt="Syncd"
            width={20}
            height={20}
          />
        </div>
        <span className="text-2xl font-bold text-slate-700 tracking-tight">
          Syncd
        </span>
      </div>

      {/* Center nav (horizontal) */}
      <nav className="flex items-center space-x-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-item-horizontal px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(l.href) ? 'active' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Account stub */}
      <div className="flex items-center space-x-3 px-3 py-2 rounded-md">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">DU</span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900">Demo User</div>
          <div className="text-xs text-gray-500">demo@demo.com</div>
        </div>
      </div>
    </div>
  );
}
