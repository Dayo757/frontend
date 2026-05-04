import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Client } from '../../lib/types';

type FormData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
const empty: FormData = { first_name: '', last_name: '', email: '', phone: '', company: '', address: '', notes: '' };
interface Props { initial?: Partial<FormData>; id?: string; }

export default function ClientForm({ initial, id }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormData, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const now = new Date().toISOString();
    try {
      if (id) {
        await supabase.from('crm_clients').update({ ...form, updated_at: now }).eq('id', id);
        navigate(`/clients/${id}`);
      } else {
        const { data } = await supabase.from('crm_clients').insert({ ...form, created_at: now, updated_at: now }).select().single();
        navigate(`/clients/${data!.id}`);
      }
    } catch { setError('Failed to save. Please try again.'); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{id ? 'Edit Client' : 'New Client'}</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">First Name</label><input className="input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required /></div>
        <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} /></div>
      </div>
      <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
      <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
      <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
      <div><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
      <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Client'}</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
