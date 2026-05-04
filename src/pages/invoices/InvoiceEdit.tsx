import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Invoice, InvoiceLineItem } from '../../lib/types';
import InvoiceForm from './InvoiceForm';

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_invoices').select('*').eq('id', id!).single(),
      supabase.from('crm_invoice_line_items').select('*').eq('invoice_id', id!),
    ]).then(([{ data: inv }, { data: li }]) => { setInvoice(inv); setItems(li ?? []); });
  }, [id]);

  if (!invoice) return <div className="p-6 text-gray-500">Loading…</div>;
  return (
    <InvoiceForm id={id} initial={{ ...invoice, discount_amount: invoice.discount_amount / 100, issue_date: invoice.issue_date?.slice(0, 10) ?? '', due_date: invoice.due_date?.slice(0, 10) ?? '' }}
      initialItems={items.map((i) => ({ id: i.id, description: i.description, quantity: i.quantity, unit_price: i.unit_price / 100 }))} />
  );
}
