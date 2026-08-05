-- Rechnungen (invoices), optionally converted from a quote.

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  customer_id uuid not null references customers (id),
  quote_id uuid references quotes (id),
  project_id uuid references projects (id),
  invoice_number text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  paid_at timestamptz,
  subtotal numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  pdf_url text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, invoice_number)
);

create index invoices_company_id_idx on invoices (company_id);
create index invoices_customer_id_idx on invoices (customer_id);
create index invoices_quote_id_idx on invoices (quote_id);
create index invoices_project_id_idx on invoices (project_id);

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  position int not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit text not null default 'Stk',
  unit_price numeric(12, 2) not null,
  tax_rate numeric(5, 2) not null default 19.00,
  line_total numeric(12, 2) not null
);

create index invoice_line_items_invoice_id_idx on invoice_line_items (invoice_id);
