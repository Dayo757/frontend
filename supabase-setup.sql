-- Mob Madness CRM — Supabase Database Setup
-- Run this entire file in the Supabase SQL Editor (supabase.com → your project → SQL Editor → New query)

create table if not exists crm_clients (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  address text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists crm_vendors (
  id uuid primary key default gen_random_uuid(),
  name text,
  service_type text,
  contact_name text,
  email text,
  phone text,
  website text,
  notes text,
  default_fee integer,
  fee_type text,
  created_at timestamptz
);

create table if not exists crm_events (
  id uuid primary key default gen_random_uuid(),
  name text,
  event_type text,
  status text default 'enquiry',
  venue text,
  notes text,
  vendor_ids jsonb default '[]'::jsonb,
  event_date timestamptz,
  end_date timestamptz,
  guest_count integer,
  budget integer,
  client_id uuid references crm_clients(id) on delete set null,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists crm_expenses (
  id uuid primary key default gen_random_uuid(),
  description text,
  category text,
  notes text,
  amount integer default 0,
  is_paid boolean default false,
  paid_at timestamptz,
  event_id uuid references crm_events(id) on delete set null,
  created_at timestamptz
);

create table if not exists crm_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text,
  status text default 'draft',
  notes text,
  issue_date timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  tax_rate double precision default 0,
  discount_amount integer default 0,
  client_id uuid references crm_clients(id) on delete set null,
  event_id uuid references crm_events(id) on delete set null,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists crm_invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  description text,
  quantity integer default 1,
  unit_price integer default 0,
  invoice_id uuid references crm_invoices(id) on delete cascade,
  created_at timestamptz
);

create table if not exists crm_contracts (
  id uuid primary key default gen_random_uuid(),
  title text,
  contract_type text default 'other',
  status text default 'draft',
  content text,
  notes text,
  signed_at timestamptz,
  expires_at timestamptz,
  client_id uuid references crm_clients(id) on delete set null,
  event_id uuid references crm_events(id) on delete set null,
  vendor_id uuid references crm_vendors(id) on delete set null,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists crm_integrations (
  id uuid primary key default gen_random_uuid(),
  platform text,
  api_key text,
  status text default 'disconnected',
  last_synced_at timestamptz,
  created_at timestamptz
);

create table if not exists crm_ticketing_events (
  id uuid primary key default gen_random_uuid(),
  platform text,
  external_id text,
  event_name text,
  event_date timestamptz,
  venue text,
  tickets_sold integer default 0,
  gross_revenue_cents integer default 0,
  platform_url text,
  synced_at timestamptz,
  crm_event_id uuid references crm_events(id) on delete set null,
  created_at timestamptz
);
