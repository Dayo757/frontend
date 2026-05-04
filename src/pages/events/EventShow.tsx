import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event, Expense, Invoice, Contract, Vendor, Client, formatDate, formatCurrency, statusColor } from '../../lib/types';

export default function EventShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    supabase.from('crm_events').select('*').eq('id', id!).single().then(async ({ data: ev }) => {
      if (!ev) return;
      setEvent(ev);
      const [{ data: exps }, { data: invs }, { data: cons }, { data: vends }] = await Promise.all([
        supabase.from('crm_expenses').select('*').eq('event_id', id!),
        supabase.from('crm_invoices').select('*').eq('event_id', id!),
        supabase.from('crm_contracts').select('*').eq('event_id', id!),
        ev.vendor_ids?.length ? supabase.from('crm_vendors').select('*').in('id', ev.vendor_ids) : Promise.resolve({ data: [] }),
      ]);
      setExpenses(exps ?? []); setInvoices(invs ?? []); setContracts(cons ?? []); setVendors(vends ?? []);
      if (ev.client_id) supabase.from('crm_clients').select('*').eq('id', ev.client_id).single().then(({ data }) => setClient(data));
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this event?')) return;
    await supabase.from('crm_events').delete().eq('id', id!);
    navigate('/events');
  }

  if (!event) return <div className="p-6 text-gray-500">Loading…</div>;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{event.name}</h1><span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(event.status)}`}>{event.status}</span></div>
        <div className="flex gap-2"><Link to={`/events/${id}/edit`} className="btn-secondary">Edit</Link><button onClick={handleDelete} className="btn-danger">Delete</button></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm">
        {client && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Client</p><Link to={`/clients/${client.id}`} className="text-brand-600 hover:underline">{client.first_name} {client.last_name}</Link></div>}
        {event.venue && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p><p>{event.venue}</p></div>}
        {event.event_date && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Date</p><p>{formatDate(event.event_date)}</p></div>}
        {event.guest_count ? <div><p className="text-xs text-gray-500 uppercase tracking-wide">Guests</p><p>{event.guest_count}</p></div> : null}
        {event.budget ? <div><p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p><p>{formatCurrency(event.budget)}</p></div> : null}
        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p><p>{formatCurrency(totalExpenses)}</p></div>
        {event.notes && <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p><p className="whitespace-pre-wrap">{event.notes}</p></div>}
      </div>
      {vendors.length > 0 && <div className="bg-white rounded-xl border border-gray-200 p-5"><h2 className="font-semibold text-gray-900 mb-3">Vendors / DJs</h2><div className="flex flex-wrap gap-2">{vendors.map((v) => <Link key={v.id} to={`/vendors/${v.id}`} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-brand-100">{v.name} <span className="ml-1 text-gray-400 text-xs">({v.service_type})</span></Link>)}</div></div>}
      <Section title="Expenses" count={expenses.length} to="/expenses/new">{expenses.map((e) => <li key={e.id} className="flex justify-between px-5 py-3"><div><p className="text-sm font-medium">{e.description}</p><p className="text-xs text-gray-500 capitalize">{e.category}</p></div><div className="text-right"><p className="text-sm font-medium">{formatCurrency(e.amount)}</p><span className={`text-xs ${e.is_paid ? 'text-green-600' : 'text-yellow-600'}`}>{e.is_paid ? 'Paid' : 'Unpaid'}</span></div></li>)}</Section>
      <Section title="Invoices" count={invoices.length} to="/invoices/new">{invoices.map((i) => <li key={i.id} className="flex justify-between px-5 py-3"><Link to={`/invoices/${i.id}`} className="text-sm font-medium hover:text-brand-600">{i.invoice_number}</Link><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(i.status)}`}>{i.status}</span></li>)}</Section>
      <Section title="Contracts" count={contracts.length} to="/contracts/new">{contracts.map((c) => <li key={c.id} className="flex justify-between px-5 py-3"><Link to={`/contracts/${c.id}`} className="text-sm font-medium hover:text-brand-600">{c.title}</Link><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(c.status)}`}>{c.status}</span></li>)}</Section>
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
