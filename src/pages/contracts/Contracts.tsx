import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Contract, CONTRACT_STATUSES, formatDate, statusColor } from '../../lib/types';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('crm_contracts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setContracts(data ?? []); setLoading(false); });
  }, []);

  const filtered = filter ? contracts.filter((c) => c.status === filter) : contracts;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <Link to="/contracts/new" className="btn-primary">+ New Contract</Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`pill ${filter === '' ? 'pill-active' : ''}`}>All</button>
        {CONTRACT_STATUSES.map((s) => <button key={s} onClick={() => setFilter(s)} className={`pill capitalize ${filter === s ? 'pill-active' : ''}`}>{s}</button>)}
      </div>
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No contracts</p>
          <Link to="/contracts/new" className="text-brand-600 hover:underline">Create your first contract →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div><Link to={`/contracts/${c.id}`} className="font-medium text-gray-900 hover:text-brand-600">{c.title}</Link><p className="text-sm text-gray-500 capitalize">{c.contract_type} · {formatDate(c.created_at)}</p></div>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(c.status)}`}>{c.status}</span>
                <Link to={`/contracts/${c.id}/edit`} className="text-sm text-gray-400 hover:text-brand-600">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
