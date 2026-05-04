import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Vendor, VENDOR_SERVICE_TYPES, formatCurrency } from '../../lib/types';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('crm_vendors').select('*').order('name')
      .then(({ data }) => { setVendors(data ?? []); setLoading(false); });
  }, []);

  const filtered = filter ? vendors.filter((v) => v.service_type === filter) : vendors;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <Link to="/vendors/new" className="btn-primary">+ New Vendor</Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`pill ${filter === '' ? 'pill-active' : ''}`}>All</button>
        {VENDOR_SERVICE_TYPES.map((s) => <button key={s} onClick={() => setFilter(s)} className={`pill capitalize ${filter === s ? 'pill-active' : ''}`}>{s}</button>)}
      </div>
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No vendors yet</p>
          <Link to="/vendors/new" className="text-brand-600 hover:underline">Add your first vendor →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <Link to={`/vendors/${v.id}`} className="font-medium text-gray-900 hover:text-brand-600">{v.name}</Link>
                <p className="text-sm text-gray-500 capitalize">{v.service_type}{v.default_fee ? ` · ${formatCurrency(v.default_fee)} ${v.fee_type}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{v.email}</span>
                <Link to={`/vendors/${v.id}/edit`} className="text-sm text-gray-400 hover:text-brand-600">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
