import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Contract, Client, Event, Vendor, CONTRACT_TYPES, CONTRACT_STATUSES } from '../../lib/types';
import Showdown from 'showdown';
import DOMPurify from 'dompurify';

const converter = new Showdown.Converter();
type FormData = Omit<Contract, 'id' | 'created_at' | 'updated_at'>;
function empty(): FormData { return { title: '', contract_type: 'other', status: 'draft', content: '', notes: '', signed_at: null, expires_at: null, client_id: null, event_id: null, vendor_id: null }; }
interface Props { initial?: Partial<FormData>; id?: string; }

export default function ContractForm({ initial, id }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...empty(), ...initial });
  const [preview, setPreview] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('crm_clients').select('id, first_name, last_name').order('first_name'),
      supabase.from('crm_events').select('id, name').order('name'),
      supabase.from('crm_vendors').select('id, name').order('name'),
    ]).then(([{ data: c }, { data: ev }, { data: v }]) => { setClients(c as Client[] ?? []); setEvents(ev as Event[] ?? []); setVendors(v as Vendor[] ?? []); });
  }, []);

  function set(field: keyof FormData, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const now = new Date().toISOString();
    try {
      if (id) { await supabase.from('crm_contracts').update({ ...form, updated_at: now }).eq('id', id); navigate(`/contracts/${id}`); }
      else { const { data } = await supabase.from('crm_contracts').insert({ ...form, created_at: now, updated_at: now }).select().single(); navigate(`/contracts/${data!.id}`); }
    } catch { setError('Failed to save.'); } finally { setSaving(false); }
  }

  const html = DOMPurify.sanitize(converter.makeHtml(form.content));

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{id ? 'Edit Contract' : 'New Contract'}</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Type</label><select className="input" value={form.contract_type} onChange={(e) => set('contract_type', e.target.value)}>{CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>{CONTRACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="label">Client</label><select className="input" value={form.client_id ?? ''} onChange={(e) => set('client_id', e.target.value || null)}><option value="">— None —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        <div><label className="label">Event</label><select className="input" value={form.event_id ?? ''} onChange={(e) => set('event_id', e.target.value || null)}><option value="">— None —</option>{events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></div>
        <div><label className="label">Vendor</label><select className="input" value={form.vendor_id ?? ''} onChange={(e) => set('vendor_id', e.target.value || null)}><option value="">— None —</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
        <div><label className="label">Expires At</label><input type="date" className="input" value={form.expires_at?.slice(0, 10) ?? ''} onChange={(e) => set('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label">Content (Markdown)</label>
          <button type="button" onClick={() => setPreview((p) => !p)} className="text-sm text-brand-600 hover:underline">{preview ? 'Edit' : 'Preview'}</button>
        </div>
        {preview ? <div className="prose prose-sm max-w-none border border-gray-300 rounded-lg p-4 min-h-48 bg-white" dangerouslySetInnerHTML={{ __html: html }} /> : <textarea className="input font-mono text-sm min-h-48" value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Write contract content in Markdown…" />}
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Contract'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
