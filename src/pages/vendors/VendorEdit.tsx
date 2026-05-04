import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Vendor } from '../../lib/types';
import VendorForm from './VendorForm';

export default function VendorEdit() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  useEffect(() => { supabase.from('crm_vendors').select('*').eq('id', id!).single().then(({ data }) => setVendor(data)); }, [id]);
  if (!vendor) return <div className="p-6 text-gray-500">Loading…</div>;
  return <VendorForm id={id} initial={vendor} />;
}
