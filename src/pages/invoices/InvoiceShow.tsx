import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Invoice, InvoiceLineItem, Client, Event, formatDate, formatCurrency, statusColor } from '../../lib/types';
import PrintHeader from '../../components/PrintHeader';

export default function InvoiceShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_invoices').select('*').eq('id', id!).single(),
      supabase.from('crm_invoice_line_items').select('*').eq('invoice_id', id!),
    ]).then(async ([{ data: inv }, { data: li }]) => {
      if (!inv) return;
      setInvoice(inv); setItems(li ?? []);
      if (inv.client_id) supabase.from('crm_clients').select('*').eq('id', inv.client_id).single().then(({ data }) => setClient(data));
      if (inv.event_id) supabase.from('crm_events').select('*').eq('id', inv.event_id).single().then(({ data }) => setEvent(data));
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this invoice?')) return;
    await supabase.from('crm_invoices').delete().eq('id', id!);
    navigate('/invoices');
  }

  function handlePrint() { const prev = document.title; document.title = invoice?.invoice_number ?? 'Invoice'; window.print(); document.title = prev; }

  if (!invoice) return <div className="p-6 text-gray-500">Loading…</div>;

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discount = invoice.discount_amount;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * invoice.tax_rate / 100);
  const total = taxable + tax;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PrintHeader />
      <div className="print-hidden flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1><span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(invoice.status)}`}>{invoice.status}</span></div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary">🖨 Print / PDF</button>
          <Link to={`/invoices/${id}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>{client && (<div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bill To</p><p className="font-medium">{client.first_name} {client.last_name}</p>{client.company && <p className="text-sm text-gray-600">{client.company}</p>}{client.email && <p className="text-sm text-gray-600">{client.email}</p>}{client.address && <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.address}</p>}</div>)}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Issue Date</span><span>{formatDate(invoice.issue_date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span>{formatDate(invoice.due_date)}</span></div>
            {event && <div className="flex justify-between"><span className="text-gray-500">Event</span><span>{event.name}</span></div>}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200"><th className="text-left py-2 font-medium text-gray-500">Description</th><th className="text-right py-2 font-medium text-gray-500 w-16">Qty</th><th className="text-right py-2 font-medium text-gray-500 w-28">Unit Price</th><th className="text-right py-2 font-medium text-gray-500 w-28">Total</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{items.map((item) => (<tr key={item.id}><td className="py-2">{item.description}</td><td className="py-2 text-right">{item.quantity}</td><td className="py-2 text-right">{formatCurrency(item.unit_price)}</td><td className="py-2 text-right">{formatCurrency(item.quantity * item.unit_price)}</td></tr>))}</tbody>
        </table>
        <div className="ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatCurrency(discount)}</span></div>}
          {tax > 0 && <div className="flex justify-between"><span>Tax ({invoice.tax_rate}%)</span><span>{formatCurrency(tax)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
        {invoice.notes && <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p><p className="text-sm whitespace-pre-wrap">{invoice.notes}</p></div>}
      </div>
    </div>
  );
}
