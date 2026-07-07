-- Tenant root + user profiles/roles.
-- Multi-tenancy model: every tenant-scoped table carries a `company_id` column,
-- enforced via Row Level Security policies added in 20260101000600_rls_policies.sql.

create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  address_street text,
  address_zip text,
  address_city text,
  address_country text not null default 'DE',
  tax_id text,
  vat_id text,
  iban text,
  bic text,
  logo_url text,
  default_tax_rate numeric(5, 2) not null default 19.00,
  quote_number_prefix text not null default 'AN',
  invoice_number_prefix text not null default 'RE',
  created_at timestamptz not null default now()
);

-- Extends auth.users 1:1 with tenant membership + role.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'employee' check (role in ('owner', 'admin', 'employee')),
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now()
);

create index profiles_company_id_idx on profiles (company_id);

-- Helper functions used throughout RLS policies. SECURITY DEFINER so they can
-- read `profiles` (which itself has RLS enabled) without causing recursive
-- policy evaluation; migrations run as the `postgres` role which bypasses RLS.
create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- public.set_employee_role() (the guarded RPC for changing a profile's role)
-- is defined in 20260101000600_rls_policies.sql, alongside the trigger that
-- makes it the only way to change `profiles.role`.
