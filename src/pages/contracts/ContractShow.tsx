import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Contract, Client, Event, Vendor, formatDate, statusColor } from '../../lib/types';
import Showdown from 'showdown';
import DOMPurify from 'dompurify';
import PrintHeader from '../../components/PrintHeader';

const converter = new Showdown.Converter();

export default function ContractShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    supabase.from('crm_contracts').select('*').eq('id', id!).single().then(async ({ data: c }) => {
      if (!c) return; setContract(c);
      if (c.client_id) supabase.from('crm_clients').select('*').eq('id', c.client_id).single().then(({ data }) => setClient(data));
      if (c.event_id) supabase.from('crm_events').select('*').eq('id', c.event_id).single().then(({ data }) => setEvent(data));
      if (c.vendor_id) supabase.from('crm_vendors').select('*').eq('id', c.vendor_id).single().then(({ data }) => setVendor(data));
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this contract?')) return;
    await supabase.from('crm_contracts').delete().eq('id', id!);
    navigate('/contracts');
  }

  function handlePrint() { const prev = document.title; document.title = contract?.title ?? 'Contract'; window.print(); document.title = prev; }

  if (!contract) return <div className="p-6 text-gray-500">Loading…</div>;
  const html = DOMPurify.sanitize(converter.makeHtml(contract.content ?? ''));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PrintHeader />
      <div className="print-hidden flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1><span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(contract.status)}`}>{contract.status}</span></div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary">🖨 Print / PDF</button>
          <Link to={`/contracts/${id}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {client && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Client</p><Link to={`/clients/${client.id}`} className="text-brand-600 hover:underline">{client.first_name} {client.last_name}</Link></div>}
          {event && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Event</p><Link to={`/events/${event.id}`} className="text-brand-600 hover:underline">{event.name}</Link></div>}
          {vendor && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Vendor</p><Link to={`/vendors/${vendor.id}`} className="text-brand-600 hover:underline">{vendor.name}</Link></div>}
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Type</p><p className="capitalize">{contract.contract_type}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Created</p><p>{formatDate(contract.created_at)}</p></div>
          {contract.expires_at && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Expires</p><p>{formatDate(contract.expires_at)}</p></div>}
        </div>
        {contract.content && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Content</p><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} /></div>}
        {contract.notes && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p><p className="text-sm whitespace-pre-wrap">{contract.notes}</p></div>}
      </div>
    </div>
  );
}
