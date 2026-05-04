import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Event, Invoice, formatCurrency, formatDate, statusColor } from '../lib/types';

interface Stats { clients: number; events: number; revenue: number; pending: number; }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ clients: 0, events: 0, revenue: 0, pending: 0 });
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ count: clientCount }, { count: eventCount }, { data: invs }, { data: evts }] = await Promise.all([
        supabase.from('crm_clients').select('*', { count: 'exact', head: true }),
        supabase.from('crm_events').select('*', { count: 'exact', head: true }),
        supabase.from('crm_invoices').select('*'),
        supabase.from('crm_events').select('*').gte('event_date', new Date().toISOString()).order('event_date').limit(5),
      ]);
      const paid = (invs ?? []).filter((i) => i.status === 'paid');
      const pending = (invs ?? []).filter((i) => ['draft', 'sent', 'overdue'].includes(i.status));
      setStats({ clients: clientCount ?? 0, events: eventCount ?? 0, revenue: paid.reduce((s: number, i) => s + (i.total_cents ?? 0), 0), pending: pending.length });
      setUpcoming(evts ?? []);
      setInvoices((invs ?? []).filter((i) => ['sent', 'overdue'].includes(i.status)).slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: stats.clients, to: '/clients' },
          { label: 'Total Events', value: stats.events, to: '/events' },
          { label: 'Revenue (Paid)', value: formatCurrency(stats.revenue), to: '/invoices' },
          { label: 'Pending Invoices', value: stats.pending, to: '/invoices' },
        ].map(({ label, value, to }) => (
          <Link key={label} to={to} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-gray-400">No upcoming events.</p> : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((e) => (
                <li key={e.id} className="py-2 flex justify-between items-center">
                  <div>
                    <Link to={`/events/${e.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">{e.name}</Link>
                    <p className="text-xs text-gray-500">{e.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(e.event_date)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(e.status)}`}>{e.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Invoices</h2>
            <Link to="/invoices" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {invoices.length === 0 ? <p className="text-sm text-gray-400">No pending invoices.</p> : (
            <ul className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <li key={inv.id} className="py-2 flex justify-between items-center">
                  <div>
                    <Link to={`/invoices/${inv.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">{inv.invoice_number}</Link>
                    <p className="text-xs text-gray-500">Due {formatDate(inv.due_date)}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(inv.status)}`}>{inv.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
