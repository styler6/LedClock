-- Kostenvoranschläge (quotes/estimates) + per-company document numbering.

create table document_counters (
  company_id uuid not null references companies (id) on delete cascade,
  doc_type text not null check (doc_type in ('quote', 'invoice')),
  year int not null,
  next_number int not null default 1,
  primary key (company_id, doc_type, year)
);

-- Atomically issues the next formatted document number, e.g. "AN-2026-0001".
-- SECURITY DEFINER + the INSERT ... ON CONFLICT upsert make this safe under
-- concurrent callers without a separate advisory lock.
create or replace function public.next_document_number(p_company_id uuid, p_doc_type text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from current_date);
  v_number int;
  v_prefix text;
begin
  insert into document_counters (company_id, doc_type, year, next_number)
  values (p_company_id, p_doc_type, v_year, 2)
  on conflict (company_id, doc_type, year)
  do update set next_number = document_counters.next_number + 1
  returning next_number - 1 into v_number;

  select case p_doc_type
    when 'quote' then quote_number_prefix
    when 'invoice' then invoice_number_prefix
  end
  into v_prefix
  from companies
  where id = p_company_id;

  return v_prefix || '-' || v_year || '-' || lpad(v_number::text, 4, '0');
end;
$$;

create table quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  customer_id uuid not null references customers (id),
  project_id uuid references projects (id),
  quote_number text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  issue_date date not null default current_date,
  valid_until date,
  subtotal numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  terms text,
  pdf_url text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, quote_number)
);

create index quotes_company_id_idx on quotes (company_id);
create index quotes_customer_id_idx on quotes (customer_id);
create index quotes_project_id_idx on quotes (project_id);

create table quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  position int not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit text not null default 'Stk',
  unit_price numeric(12, 2) not null,
  tax_rate numeric(5, 2) not null default 19.00,
  line_total numeric(12, 2) not null
);

create index quote_line_items_quote_id_idx on quote_line_items (quote_id);
