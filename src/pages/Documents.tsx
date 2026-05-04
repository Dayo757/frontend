import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate, statusColor } from '../lib/types';

type DocRow = { type: 'invoice' | 'contract'; id: string; title: string; status: string; date: string };

export default function Documents() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_invoices').select('id, invoice_number, status, created_at'),
      supabase.from('crm_contracts').select('id, title, status, created_at'),
    ]).then(([{ data: invs }, { data: cons }]) => {
      const rows: DocRow[] = [
        ...(invs ?? []).map((i) => ({ type: 'invoice' as const, id: i.id, title: i.invoice_number, status: i.status, date: i.created_at })),
        ...(cons ?? []).map((c) => ({ type: 'contract' as const, id: c.id, title: c.title, status: c.status, date: c.created_at })),
      ].sort((a, b) => b.date.localeCompare(a.date));
      setDocs(rows); setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>
      {loading ? <p className="text-gray-500">Loading…</p> : docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-lg">No documents yet.</p><p className="text-sm mt-2">Create an invoice or contract to see it here.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {docs.map((doc) => (
            <div key={`${doc.type}-${doc.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <Link to={doc.type === 'invoice' ? `/invoices/${doc.id}` : `/contracts/${doc.id}`} className="font-medium text-gray-900 hover:text-brand-600">{doc.title}</Link>
                <p className="text-sm text-gray-500 capitalize">{doc.type} · {formatDate(doc.date)}</p>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(doc.status)}`}>{doc.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
