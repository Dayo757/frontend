import React from 'react';
import { getSettings } from '../lib/types';

export default function PrintHeader() {
  const s = getSettings();
  return (
    <div className="print-only mb-8">
      <div className="flex items-center gap-4 border-b-2 border-gray-900 pb-4">
        {s.logoDataUrl && <img src={s.logoDataUrl} alt="Logo" className="h-16 w-auto object-contain" />}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.companyName || 'Mob Madness'}</h1>
          {s.companyAddress && <p className="text-sm text-gray-600">{s.companyAddress}</p>}
          {(s.companyPhone || s.companyEmail) && (
            <p className="text-sm text-gray-600">
              {s.companyPhone} {s.companyPhone && s.companyEmail ? '·' : ''} {s.companyEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
