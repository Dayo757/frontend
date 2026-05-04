import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Vendor, Event, formatDate, formatCurrency, statusColor } from '../../lib/types';

export default function VendorShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_vendors').select('*').eq('id', id!).single(),
      supabase.from('crm_events').select('*').contains('vendor_ids', [id!]).order('event_date', { ascending: false }),
    ]).then(([{ data: v }, { data: ev }]) => { setVendor(v); setEvents(ev ?? []); });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this vendor?')) return;
    await supabase.from('crm_vendors').delete().eq('id', id!);
    navigate('/vendors');
  }

  if (!vendor) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1><p className="text-gray-500 capitalize">{vendor.service_type}</p></div>
        <div className="flex gap-2"><Link to={`/vendors/${id}/edit`} className="btn-secondary">Edit</Link><button onClick={handleDelete} className="btn-danger">Delete</button></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm">
        {vendor.contact_name && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Contact</p><p>{vendor.contact_name}</p></div>}
        {vendor.email && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Email</p><a href={`mailto:${vendor.email}`} className="text-brand-600 hover:underline">{vendor.email}</a></div>}
        {vendor.phone && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p><p>{vendor.phone}</p></div>}
        {vendor.website && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Website</p><a href={vendor.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{vendor.website}</a></div>}
        {vendor.default_fee ? <div><p className="text-xs text-gray-500 uppercase tracking-wide">Default Fee</p><p>{formatCurrency(vendor.default_fee)} / {vendor.fee_type}</p></div> : null}
        {vendor.notes && <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p><p className="whitespace-pre-wrap">{vendor.notes}</p></div>}
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Events ({events.length})</h2></div>
        {events.length === 0 ? <p className="px-5 py-4 text-sm text-gray-400">Not assigned to any events yet.</p> : (
          <ul className="divide-y divide-gray-100">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between items-center px-5 py-3 hover:bg-gray-50">
                <div><Link to={`/events/${e.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">{e.name}</Link><p className="text-xs text-gray-500">{e.venue} · {formatDate(e.event_date)}</p></div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(e.status)}`}>{e.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
