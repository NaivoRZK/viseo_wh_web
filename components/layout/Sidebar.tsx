'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

const subMenuItems = [
  { label: 'Dépôt', href: '/emplacements/depot' },
  { label: 'Couloir', href: '/emplacements/couloir' },
  { label: 'Rack', href: '/emplacements/rack' },
  { label: 'Emplacement', href: '/emplacements/emplacement' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const isInEmplacements = pathname.startsWith('/emplacements');

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Viseo WH</h1>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>Création emplacements</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {isOpen && (
          <ul className="mt-1 space-y-0.5">
            {subMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={logout}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </aside>
  );
}
