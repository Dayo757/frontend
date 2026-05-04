import React, { useRef, useState } from 'react';
import { getSettings, saveSettings, CrmSettings } from '../lib/types';

export default function Settings() {
  const [form, setForm] = useState<CrmSettings>(getSettings());
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof CrmSettings, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logoDataUrl', reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); saveSettings(form); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-4">Company info appears on printed invoices and contracts.</p>
      <div><label className="label">Company Name</label><input className="input" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Mob Madness" /></div>
      <div><label className="label">Address</label><textarea className="input" rows={2} value={form.companyAddress} onChange={(e) => set('companyAddress', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Phone</label><input className="input" value={form.companyPhone} onChange={(e) => set('companyPhone', e.target.value)} /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={form.companyEmail} onChange={(e) => set('companyEmail', e.target.value)} /></div>
      </div>
      <div>
        <label className="label">Logo</label>
        {form.logoDataUrl && (<div className="mb-2 flex items-center gap-3"><img src={form.logoDataUrl} alt="Logo" className="h-16 w-auto object-contain border border-gray-200 rounded p-1" /><button type="button" onClick={() => set('logoDataUrl', '')} className="text-sm text-red-500 hover:underline">Remove</button></div>)}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">{form.logoDataUrl ? 'Change Logo' : 'Upload Logo'}</button>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <button type="submit" className="btn-primary">Save Settings</button>
        {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
      </div>
    </form>
  );
}
