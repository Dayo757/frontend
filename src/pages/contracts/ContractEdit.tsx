import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Contract } from '../../lib/types';
import ContractForm from './ContractForm';

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  useEffect(() => { supabase.from('crm_contracts').select('*').eq('id', id!).single().then(({ data }) => setContract(data)); }, [id]);
  if (!contract) return <div className="p-6 text-gray-500">Loading…</div>;
  return <ContractForm id={id} initial={contract} />;
}
