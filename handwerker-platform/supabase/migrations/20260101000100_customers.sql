create table customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  type text not null default 'private' check (type in ('private', 'business')),
  name text not null,
  contact_person text,
  email text,
  phone text,
  address_street text,
  address_zip text,
  address_city text,
  address_country text not null default 'DE',
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index customers_company_id_idx on customers (company_id);
create index customers_company_id_name_idx on customers (company_id, name);
