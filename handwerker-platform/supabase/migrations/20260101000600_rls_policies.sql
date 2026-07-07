-- Row Level Security: the real tenant-isolation boundary (UI-level role
-- gating is convenience only, not a security control).

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
alter table companies enable row level security;

create policy "select own company" on companies
  for select using (id = public.current_company_id());

create policy "owner/admin update own company" on companies
  for update using (id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

-- No public insert policy: company creation happens via a server action using
-- the service-role key as part of the signup flow (creates companies + the
-- first owner profile in one privileged transaction).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "select profiles in own company" on profiles
  for select using (company_id = public.current_company_id());

create policy "update own profile" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Role/is_active changes must go through public.set_employee_role(), not a
-- direct UPDATE, so a compromised/careless client write can't self-promote.
create or replace function public.enforce_profile_role_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('handwerker.allow_role_change', true), '') <> 'true' then
    raise exception 'role can only be changed via set_employee_role()';
  end if;
  return new;
end;
$$;

create trigger profiles_role_immutable
  before update on profiles
  for each row execute function public.enforce_profile_role_immutable();

-- set_employee_role() flips the guard on for the duration of its own update.
create or replace function public.set_employee_role(target_profile_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() not in ('owner', 'admin') then
    raise exception 'not authorized to change roles';
  end if;

  if new_role not in ('owner', 'admin', 'employee') then
    raise exception 'invalid role %', new_role;
  end if;

  perform set_config('handwerker.allow_role_change', 'true', true);

  update profiles
  set role = new_role
  where id = target_profile_id
    and company_id = public.current_company_id();
end;
$$;

-- No public insert/delete policy on profiles: employee invites and removals
-- go through server actions using the service-role key.

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
alter table customers enable row level security;

create policy "select customers in own company" on customers
  for select using (company_id = public.current_company_id());

create policy "admins manage customers" on customers
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

-- ---------------------------------------------------------------------------
-- quotes / quote_line_items
-- ---------------------------------------------------------------------------
alter table quotes enable row level security;

create policy "select quotes in own company" on quotes
  for select using (company_id = public.current_company_id());

create policy "admins manage quotes" on quotes
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

alter table quote_line_items enable row level security;

create policy "select quote line items in own company" on quote_line_items
  for select using (
    exists (select 1 from quotes q where q.id = quote_line_items.quote_id and q.company_id = public.current_company_id())
  );

create policy "admins manage quote line items" on quote_line_items
  for all using (
    exists (
      select 1 from quotes q
      where q.id = quote_line_items.quote_id
        and q.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from quotes q
      where q.id = quote_line_items.quote_id
        and q.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- invoices / invoice_line_items
-- ---------------------------------------------------------------------------
alter table invoices enable row level security;

create policy "select invoices in own company" on invoices
  for select using (company_id = public.current_company_id());

create policy "admins manage invoices" on invoices
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

alter table invoice_line_items enable row level security;

create policy "select invoice line items in own company" on invoice_line_items
  for select using (
    exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id and i.company_id = public.current_company_id())
  );

create policy "admins manage invoice line items" on invoice_line_items
  for all using (
    exists (
      select 1 from invoices i
      where i.id = invoice_line_items.invoice_id
        and i.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from invoices i
      where i.id = invoice_line_items.invoice_id
        and i.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- document_counters (internal bookkeeping table, no direct client access)
-- ---------------------------------------------------------------------------
alter table document_counters enable row level security;
-- Intentionally no policies: only reachable via the SECURITY DEFINER
-- next_document_number() function.

-- ---------------------------------------------------------------------------
-- projects / project_assignments / project_status_history
-- ---------------------------------------------------------------------------
alter table projects enable row level security;

create policy "select projects in own company" on projects
  for select using (company_id = public.current_company_id());

create policy "admins manage projects" on projects
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

create policy "assigned employees update project status" on projects
  for update using (
    company_id = public.current_company_id()
    and exists (
      select 1 from project_assignments pa
      where pa.project_id = projects.id and pa.profile_id = auth.uid()
    )
  )
  with check (company_id = public.current_company_id());

alter table project_assignments enable row level security;

create policy "select own or company assignments" on project_assignments
  for select using (
    exists (select 1 from projects p where p.id = project_assignments.project_id and p.company_id = public.current_company_id())
  );

create policy "admins manage project assignments" on project_assignments
  for all using (
    exists (
      select 1 from projects p
      where p.id = project_assignments.project_id
        and p.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from projects p
      where p.id = project_assignments.project_id
        and p.company_id = public.current_company_id()
        and public.current_role() in ('owner', 'admin')
    )
  );

alter table project_status_history enable row level security;

create policy "select project status history in own company" on project_status_history
  for select using (
    exists (select 1 from projects p where p.id = project_status_history.project_id and p.company_id = public.current_company_id())
  );

create policy "assigned employees or admins insert status history" on project_status_history
  for insert with check (
    exists (
      select 1 from projects p
      where p.id = project_status_history.project_id
        and p.company_id = public.current_company_id()
        and (
          public.current_role() in ('owner', 'admin')
          or exists (
            select 1 from project_assignments pa
            where pa.project_id = p.id and pa.profile_id = auth.uid()
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- equipment / equipment_bookings
-- ---------------------------------------------------------------------------
alter table equipment enable row level security;

create policy "select equipment in own company" on equipment
  for select using (company_id = public.current_company_id());

create policy "admins manage equipment" on equipment
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

alter table equipment_bookings enable row level security;

create policy "select equipment bookings in own company" on equipment_bookings
  for select using (company_id = public.current_company_id());

create policy "admins manage equipment bookings" on equipment_bookings
  for all using (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'))
  with check (company_id = public.current_company_id() and public.current_role() in ('owner', 'admin'));

-- Employees may check equipment in/out for themselves (mobile app flow).
create policy "employees check out equipment to themselves" on equipment_bookings
  for insert with check (
    company_id = public.current_company_id()
    and assigned_to = auth.uid()
    and booking_type = 'internal_project'
  );

create policy "employees update their own bookings" on equipment_bookings
  for update using (
    company_id = public.current_company_id()
    and assigned_to = auth.uid()
  )
  with check (
    company_id = public.current_company_id()
    and assigned_to = auth.uid()
  );
