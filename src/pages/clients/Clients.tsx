import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Client, formatDate } from '../../lib/types';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('crm_clients').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setClients(data ?? []); setLoading(false); });
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name} ${c.email} ${c.company}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link to="/clients/new" className="btn-primary">+ New Client</Link>
      </div>
      <input type="search" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4 w-full max-w-sm" />
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No clients yet</p>
          <Link to="/clients/new" className="text-brand-600 hover:underline">Add your first client →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <Link to={`/clients/${c.id}`} className="font-medium text-gray-900 hover:text-brand-600">{c.first_name} {c.last_name}</Link>
                <p className="text-sm text-gray-500">{c.company}{c.company && c.email ? ' · ' : ''}{c.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                <Link to={`/clients/${c.id}/edit`} className="text-sm text-gray-400 hover:text-brand-600">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
