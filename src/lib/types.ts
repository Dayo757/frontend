export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  event_type: string;
  status: string;
  venue: string;
  notes: string;
  vendor_ids: string[];
  event_date: string;
  end_date: string;
  guest_count: number;
  budget: number;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  service_type: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  default_fee: number;
  fee_type: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  notes: string;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  event_id: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  notes: string;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  tax_rate: number;
  discount_amount: number;
  client_id: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  invoice_id: string;
  created_at: string;
}

export interface Contract {
  id: string;
  title: string;
  contract_type: string;
  status: string;
  content: string;
  notes: string;
  signed_at: string | null;
  expires_at: string | null;
  client_id: string | null;
  event_id: string | null;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoDataUrl: string;
}

export const EVENT_TYPES = ['wedding', 'corporate', 'birthday', 'party', 'other'] as const;
export const EVENT_STATUSES = ['enquiry', 'confirmed', 'in-progress', 'completed', 'cancelled'] as const;
export const VENDOR_SERVICE_TYPES = ['dj', 'photographer', 'videographer', 'caterer', 'florist', 'venue', 'entertainment', 'other'] as const;
export const FEE_TYPES = ['flat', 'hourly', 'per-head'] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
export const CONTRACT_TYPES = ['vendor', 'client', 'venue', 'other'] as const;
export const CONTRACT_STATUSES = ['draft', 'sent', 'signed', 'cancelled'] as const;
export const EXPENSE_CATEGORIES = ['venue', 'catering', 'entertainment', 'equipment', 'marketing', 'staff', 'transport', 'other'] as const;

export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    enquiry: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    signed: 'bg-green-100 text-green-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function getSettings(): CrmSettings {
  try {
    const raw = localStorage.getItem('crm:settings');
    if (raw) return JSON.parse(raw) as CrmSettings;
  } catch {}
  return { companyName: 'Mob Madness', companyAddress: '', companyPhone: '', companyEmail: '', logoDataUrl: '' };
}

export function saveSettings(s: CrmSettings) {
  localStorage.setItem('crm:settings', JSON.stringify(s));
}
