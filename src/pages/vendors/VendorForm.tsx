import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Vendor, VENDOR_SERVICE_TYPES, FEE_TYPES } from '../../lib/types';

type FormData = Omit<Vendor, 'id' | 'created_at'>;
const empty: FormData = { name: '', service_type: 'dj', contact_name: '', email: '', phone: '', website: '', notes: '', default_fee: 0, fee_type: 'flat' };
interface Props { initial?: Partial<FormData>; id?: string; }

export default function VendorForm({ initial, id }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormData, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const row = { ...form, default_fee: Math.round(parseFloat(String(form.default_fee || 0)) * 100) };
    try {
      if (id) { await supabase.from('crm_vendors').update(row).eq('id', id); navigate(`/vendors/${id}`); }
      else { const { data } = await supabase.from('crm_vendors').insert({ ...row, created_at: new Date().toISOString() }).select().single(); navigate(`/vendors/${data!.id}`); }
    } catch { setError('Failed to save.'); } finally { setSaving(false); }
  }

  const feeDisplay = form.default_fee ? String(form.default_fee / 100) : '';

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{id ? 'Edit Vendor' : 'New Vendor'}</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Service Type</label><select className="input" value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>{VENDOR_SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="label">Contact Name</label><input className="input" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
      </div>
      <div><label className="label">Website</label><input type="url" className="input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Default Fee ($)</label><input type="number" className="input" min={0} step="0.01" value={feeDisplay} onChange={(e) => set('default_fee', Math.round(parseFloat(e.target.value || '0') * 100))} /></div>
        <div><label className="label">Fee Type</label><select className="input" value={form.fee_type} onChange={(e) => set('fee_type', e.target.value)}>{FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Vendor'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
