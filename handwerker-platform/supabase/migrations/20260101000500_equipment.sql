-- Geräte-Vermietung: equipment catalog + bookings (customer rentals and
-- internal project check-outs share the same booking table).

create extension if not exists "btree_gist";

create table equipment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  name text not null,
  category text,
  description text,
  serial_number text,
  purchase_date date,
  daily_rental_price numeric(10, 2),
  is_rentable_to_customers boolean not null default true,
  status text not null default 'available'
    check (status in ('available', 'booked', 'in_use', 'maintenance', 'retired')),
  image_url text,
  created_at timestamptz not null default now()
);

create index equipment_company_id_idx on equipment (company_id);

create table equipment_bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  equipment_id uuid not null references equipment (id),
  booking_type text not null check (booking_type in ('customer_rental', 'internal_project')),
  customer_id uuid references customers (id),
  project_id uuid references projects (id),
  assigned_to uuid references profiles (id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  actual_return_at timestamptz,
  status text not null default 'reserved'
    check (status in ('reserved', 'checked_out', 'returned', 'overdue', 'cancelled')),
  condition_out_notes text,
  condition_in_notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  check (
    (booking_type = 'customer_rental' and customer_id is not null)
    or (booking_type = 'internal_project' and project_id is not null)
  )
);

create index equipment_bookings_company_id_idx on equipment_bookings (company_id);
create index equipment_bookings_equipment_id_idx on equipment_bookings (equipment_id);
create index equipment_bookings_range_idx
  on equipment_bookings using gist (equipment_id, tstzrange(start_at, end_at));

-- Prevents double-booking the same piece of equipment for overlapping time
-- ranges, for any booking that hasn't been cancelled/returned.
alter table equipment_bookings
  add constraint equipment_bookings_no_overlap
  exclude using gist (
    equipment_id with =,
    tstzrange(start_at, end_at) with &&
  )
  where (status in ('reserved', 'checked_out'));
