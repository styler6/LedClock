-- Projekte / Baustellen / Aufträge.
-- Created before quotes/invoices so those tables can reference project_id directly.

create table projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  customer_id uuid not null references customers (id),
  name text not null,
  description text,
  site_address_street text,
  site_address_zip text,
  site_address_city text,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  estimated_hours numeric(8, 2),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_company_id_idx on projects (company_id);
create index projects_customer_id_idx on projects (customer_id);

create table project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  profile_id uuid not null references profiles (id),
  role_on_project text,
  assigned_from date,
  assigned_until date,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index project_assignments_profile_id_idx on project_assignments (profile_id);

create table project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  status text not null,
  changed_by uuid references profiles (id),
  note text,
  created_at timestamptz not null default now()
);

create index project_status_history_project_id_idx on project_status_history (project_id);
