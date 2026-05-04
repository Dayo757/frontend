import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/events', label: 'Events', icon: '🎉' },
  { to: '/vendors', label: 'Vendors', icon: '🎵' },
  { to: '/expenses', label: 'Expenses', icon: '💸' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/contracts', label: 'Contracts', icon: '📝' },
  { to: '/documents', label: 'Documents', icon: '📁' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-30 w-56 bg-gray-900 text-white flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="px-4 py-5 border-b border-gray-700">
          <span className="text-xl font-bold tracking-tight text-brand-400">Mob Madness</span>
          <p className="text-xs text-gray-400 mt-0.5">Events CRM</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="print-hidden lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)} className="p-1 rounded text-gray-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-brand-700">Mob Madness</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
