import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Invoice, Client, Event, INVOICE_STATUSES, formatCurrency } from '../../lib/types';

interface LineItem { id?: string; description: string; quantity: number; unit_price: number; }
type FormData = Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'line_items'>;

function emptyForm(): FormData {
  return { invoice_number: `INV-${Date.now().toString().slice(-6)}`, status: 'draft', notes: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '', paid_at: null, tax_rate: 0, discount_amount: 0, client_id: null, event_id: null };
}

interface Props { initial?: Partial<FormData>; initialItems?: LineItem[]; id?: string; }

export default function InvoiceForm({ initial, initialItems, id }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...emptyForm(), ...initial });
  const [items, setItems] = useState<LineItem[]>(initialItems ?? [{ description: '', quantity: 1, unit_price: 0 }]);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('crm_clients').select('id, first_name, last_name').order('first_name'),
      supabase.from('crm_events').select('id, name').order('name'),
    ]).then(([{ data: c }, { data: ev }]) => { setClients(c as Client[] ?? []); setEvents(ev as Event[] ?? []); });
  }, []);

  function setField(field: keyof FormData, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }
  function setItem(idx: number, field: keyof LineItem, value: string | number) { setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item)); }
  function addItem() { setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0 }]); }
  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  const subtotal = items.reduce((s, item) => s + item.quantity * item.unit_price, 0);
  const discount = form.discount_amount * 100;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * form.tax_rate / 100);
  const total = taxable + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const now = new Date().toISOString();
    const invRow = { ...form, discount_amount: Math.round(Number(form.discount_amount) * 100), issue_date: form.issue_date ? new Date(form.issue_date).toISOString() : null, due_date: form.due_date ? new Date(form.due_date).toISOString() : null, updated_at: now };
    try {
      let invId = id;
      if (id) { await supabase.from('crm_invoices').update(invRow).eq('id', id); await supabase.from('crm_invoice_line_items').delete().eq('invoice_id', id); }
      else { const { data } = await supabase.from('crm_invoices').insert({ ...invRow, created_at: now }).select().single(); invId = data!.id; }
      const lineRows = items.filter((i) => i.description).map((i) => ({ description: i.description, quantity: i.quantity, unit_price: Math.round(Number(i.unit_price) * 100), invoice_id: invId!, created_at: now }));
      if (lineRows.length) await supabase.from('crm_invoice_line_items').insert(lineRows);
      navigate(`/invoices/${invId}`);
    } catch { setError('Failed to save.'); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Invoice Number *</label><input className="input" value={form.invoice_number} onChange={(e) => setField('invoice_number', e.target.value)} required /></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setField('status', e.target.value)}>{INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="label">Client</label><select className="input" value={form.client_id ?? ''} onChange={(e) => setField('client_id', e.target.value || null)}><option value="">— None —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        <div><label className="label">Event</label><select className="input" value={form.event_id ?? ''} onChange={(e) => setField('event_id', e.target.value || null)}><option value="">— None —</option>{events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></div>
        <div><label className="label">Issue Date</label><input type="date" className="input" value={form.issue_date?.slice(0, 10) ?? ''} onChange={(e) => setField('issue_date', e.target.value)} /></div>
        <div><label className="label">Due Date</label><input type="date" className="input" value={form.due_date?.slice(0, 10) ?? ''} onChange={(e) => setField('due_date', e.target.value)} /></div>
      </div>
      <div>
        <label className="label mb-2 block">Line Items</label>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input className="input col-span-5" placeholder="Description" value={item.description} onChange={(e) => setItem(idx, 'description', e.target.value)} />
              <input type="number" className="input col-span-2" placeholder="Qty" min={1} value={item.quantity} onChange={(e) => setItem(idx, 'quantity', Number(e.target.value))} />
              <input type="number" className="input col-span-3" placeholder="Unit price $" min={0} step="0.01" value={item.unit_price || ''} onChange={(e) => setItem(idx, 'unit_price', Math.round(parseFloat(e.target.value || '0') * 100))} />
              <span className="col-span-1 text-sm text-right text-gray-600">{formatCurrency(item.quantity * item.unit_price)}</span>
              {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 text-lg">×</button>}
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="mt-2 text-sm text-brand-600 hover:underline">+ Add line</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Discount ($)</label><input type="number" className="input" min={0} step="0.01" value={form.discount_amount || ''} onChange={(e) => setField('discount_amount', parseFloat(e.target.value || '0'))} /></div>
        <div><label className="label">Tax Rate (%)</label><input type="number" className="input" min={0} max={100} step="0.1" value={form.tax_rate || ''} onChange={(e) => setField('tax_rate', parseFloat(e.target.value || '0'))} /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} /></div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatCurrency(discount)}</span></div>}
        {tax > 0 && <div className="flex justify-between"><span>Tax ({form.tax_rate}%)</span><span>{formatCurrency(tax)}</span></div>}
        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Invoice'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
