import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Invoice, INVOICE_STATUSES, formatDate, statusColor } from '../../lib/types';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('crm_invoices').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setInvoices(data ?? []); setLoading(false); });
  }, []);

  const filtered = filter ? invoices.filter((i) => i.status === filter) : invoices;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link to="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`pill ${filter === '' ? 'pill-active' : ''}`}>All</button>
        {INVOICE_STATUSES.map((s) => <button key={s} onClick={() => setFilter(s)} className={`pill capitalize ${filter === s ? 'pill-active' : ''}`}>{s}</button>)}
      </div>
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No invoices</p>
          <Link to="/invoices/new" className="text-brand-600 hover:underline">Create your first invoice →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <Link to={`/invoices/${inv.id}`} className="font-medium text-gray-900 hover:text-brand-600">{inv.invoice_number}</Link>
                <p className="text-sm text-gray-500">Issued {formatDate(inv.issue_date)} · Due {formatDate(inv.due_date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(inv.status)}`}>{inv.status}</span>
                <Link to={`/invoices/${inv.id}/edit`} className="text-sm text-gray-400 hover:text-brand-600">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
