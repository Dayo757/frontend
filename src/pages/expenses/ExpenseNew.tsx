import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event, EXPENSE_CATEGORIES } from '../../lib/types';

export default function ExpenseNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'other', notes: '', amount: '', is_paid: false, event_id: params.get('event_id') ?? '' });

  useEffect(() => { supabase.from('crm_events').select('id, name').order('name').then(({ data }) => setEvents(data as Event[] ?? [])); }, []);

  function set(field: string, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('crm_expenses').insert({ description: form.description, category: form.category, notes: form.notes, amount: Math.round(parseFloat(form.amount || '0') * 100), is_paid: form.is_paid, event_id: form.event_id || null, created_at: new Date().toISOString() });
    navigate('/expenses');
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Expense</h1>
      <div><label className="label">Description *</label><input className="input" value={form.description} onChange={(e) => set('description', e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>{EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="label">Amount ($) *</label><input type="number" className="input" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} required /></div>
      </div>
      <div><label className="label">Event</label><select className="input" value={form.event_id} onChange={(e) => set('event_id', e.target.value)}><option value="">— None —</option>{events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_paid} onChange={(e) => set('is_paid', e.target.checked)} className="rounded" />Already paid</label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Expense'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
