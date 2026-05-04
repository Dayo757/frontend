import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event, Client, Vendor, EVENT_TYPES, EVENT_STATUSES } from '../../lib/types';

type FormData = Omit<Event, 'id' | 'created_at' | 'updated_at'>;
const empty: FormData = { name: '', event_type: 'other', status: 'enquiry', venue: '', notes: '', vendor_ids: [], event_date: '', end_date: '', guest_count: 0, budget: 0, client_id: null };
interface Props { initial?: Partial<FormData>; id?: string; }

export default function EventForm({ initial, id }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...empty, ...initial });
  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('crm_clients').select('id, first_name, last_name').order('first_name'),
      supabase.from('crm_vendors').select('id, name, service_type').order('name'),
    ]).then(([{ data: c }, { data: v }]) => { setClients((c ?? []) as Client[]); setVendors((v ?? []) as Vendor[]); });
  }, []);

  function set(field: keyof FormData, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }
  function toggleVendor(vid: string) { setForm((f) => ({ ...f, vendor_ids: f.vendor_ids.includes(vid) ? f.vendor_ids.filter((v) => v !== vid) : [...f.vendor_ids, vid] })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const now = new Date().toISOString();
    const row = { ...form, budget: Number(form.budget), guest_count: Number(form.guest_count) };
    try {
      if (id) { await supabase.from('crm_events').update({ ...row, updated_at: now }).eq('id', id); navigate(`/events/${id}`); }
      else { const { data } = await supabase.from('crm_events').insert({ ...row, created_at: now, updated_at: now }).select().single(); navigate(`/events/${data!.id}`); }
    } catch { setError('Failed to save.'); } finally { setSaving(false); }
  }

  const budgetDisplay = form.budget ? String(form.budget / 100) : '';

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{id ? 'Edit Event' : 'New Event'}</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div><label className="label">Event Name *</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Type</label><select className="input" value={form.event_type} onChange={(e) => set('event_type', e.target.value)}>{EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>{EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div><label className="label">Client</label><select className="input" value={form.client_id ?? ''} onChange={(e) => set('client_id', e.target.value || null)}><option value="">— None —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
      <div><label className="label">Venue</label><input className="input" value={form.venue} onChange={(e) => set('venue', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Event Date</label><input type="datetime-local" className="input" value={form.event_date ? form.event_date.slice(0, 16) : ''} onChange={(e) => set('event_date', e.target.value ? new Date(e.target.value).toISOString() : '')} /></div>
        <div><label className="label">End Date</label><input type="datetime-local" className="input" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={(e) => set('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Guest Count</label><input type="number" className="input" min={0} value={form.guest_count || ''} onChange={(e) => set('guest_count', Number(e.target.value))} /></div>
        <div><label className="label">Budget ($)</label><input type="number" className="input" min={0} step="0.01" value={budgetDisplay} onChange={(e) => set('budget', Math.round(parseFloat(e.target.value || '0') * 100))} /></div>
      </div>
      <div>
        <label className="label mb-2 block">Vendors / DJs</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {vendors.map((v) => (<label key={v.id} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.vendor_ids.includes(v.id)} onChange={() => toggleVendor(v.id)} className="rounded" /><span>{v.name} <span className="text-gray-400 text-xs">({v.service_type})</span></span></label>))}
          {vendors.length === 0 && <p className="text-gray-400 text-sm col-span-2">No vendors yet.</p>}
        </div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Event'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
