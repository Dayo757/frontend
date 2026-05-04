import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Client, Event, Invoice, Contract, formatDate, statusColor } from '../../lib/types';

export default function ClientShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_clients').select('*').eq('id', id!).single(),
      supabase.from('crm_events').select('*').eq('client_id', id!).order('event_date', { ascending: false }),
      supabase.from('crm_invoices').select('*').eq('client_id', id!).order('created_at', { ascending: false }),
      supabase.from('crm_contracts').select('*').eq('client_id', id!).order('created_at', { ascending: false }),
    ]).then(([{ data: c }, { data: ev }, { data: inv }, { data: con }]) => {
      setClient(c); setEvents(ev ?? []); setInvoices(inv ?? []); setContracts(con ?? []);
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this client?')) return;
    await supabase.from('crm_clients').delete().eq('id', id!);
    navigate('/clients');
  }

  if (!client) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
          {client.company && <p className="text-gray-500">{client.company}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/clients/${id}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4">
        {[['Email', client.email], ['Phone', client.phone], ['Address', client.address], ['Added', formatDate(client.created_at)]].map(([k, v]) => v ? (<div key={k}><p className="text-xs text-gray-500 uppercase tracking-wide">{k}</p><p className="text-sm text-gray-900 mt-0.5">{v}</p></div>) : null)}
        {client.notes && <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p><p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">{client.notes}</p></div>}
      </div>
      <Section title="Events" count={events.length} to="/events/new">{events.map((e) => <Row key={e.id} to={`/events/${e.id}`} title={e.name} sub={formatDate(e.event_date)} badge={e.status} />)}</Section>
      <Section title="Invoices" count={invoices.length} to="/invoices/new">{invoices.map((i) => <Row key={i.id} to={`/invoices/${i.id}`} title={i.invoice_number} sub={formatDate(i.issue_date)} badge={i.status} />)}</Section>
      <Section title="Contracts" count={contracts.length} to="/contracts/new">{contracts.map((c) => <Row key={c.id} to={`/contracts/${c.id}`} title={c.title} sub={formatDate(c.created_at)} badge={c.status} />)}</Section>
    </div>
  );
}

function Section({ title, count, to, children }: { title: string; count: number; to: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title} ({count})</h2>
        <Link to={to} className="text-sm text-brand-600 hover:underline">+ New</Link>
      </div>
      {count === 0 ? <p className="px-5 py-4 text-sm text-gray-400">None yet.</p> : <ul className="divide-y divide-gray-100">{children}</ul>}
    </div>
  );
}

function Row({ to, title, sub, badge }: { to: string; title: string; sub: string; badge: string }) {
  return (
    <li className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
      <div><Link to={to} className="text-sm font-medium text-gray-900 hover:text-brand-600">{title}</Link><p className="text-xs text-gray-500">{sub}</p></div>
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(badge)}`}>{badge}</span>
    </li>
  );
}
