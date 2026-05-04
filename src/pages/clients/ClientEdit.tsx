import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Client } from '../../lib/types';
import ClientForm from './ClientForm';

export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  useEffect(() => { supabase.from('crm_clients').select('*').eq('id', id!).single().then(({ data }) => setClient(data)); }, [id]);
  if (!client) return <div className="p-6 text-gray-500">Loading…</div>;
  return <ClientForm id={id} initial={client} />;
}
