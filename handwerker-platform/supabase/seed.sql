-- Local development seed data. Never run against a production project.
-- Two companies are seeded specifically so the tenant-isolation RLS test
-- described in the plan can assert Company B never sees Company A's data.

insert into companies (id, name, legal_name, address_street, address_zip, address_city, tax_id, vat_id, default_tax_rate)
values
  ('00000000-0000-0000-0000-000000000001', 'Mustermann Handwerk GmbH', 'Mustermann Handwerk GmbH', 'Musterstraße 1', '12345', 'Musterstadt', '123/456/789', 'DE123456789', 19.00),
  ('00000000-0000-0000-0000-000000000002', 'Andere Firma GmbH', 'Andere Firma GmbH', 'Nebenweg 2', '54321', 'Anderstadt', '987/654/321', 'DE987654321', 19.00);

-- auth.users + auth.identities: minimal columns needed for local email/password
-- login via GoTrue. Password for every seeded user is "password123".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner@mustermann-handwerk.de', crypt('password123', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'anna@mustermann-handwerk.de', crypt('password123', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'ben@mustermann-handwerk.de', crypt('password123', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'owner@andere-firma.de', crypt('password123', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '{"sub":"10000000-0000-0000-0000-000000000001","email":"owner@mustermann-handwerk.de"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '{"sub":"10000000-0000-0000-0000-000000000002","email":"anna@mustermann-handwerk.de"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '{"sub":"10000000-0000-0000-0000-000000000003","email":"ben@mustermann-handwerk.de"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '{"sub":"10000000-0000-0000-0000-000000000004","email":"owner@andere-firma.de"}', 'email', now(), now(), now());

insert into profiles (id, company_id, full_name, email, role)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Max Mustermann', 'owner@mustermann-handwerk.de', 'owner'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Anna Schmidt', 'anna@mustermann-handwerk.de', 'employee'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Ben Weber', 'ben@mustermann-handwerk.de', 'employee'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Petra Peters', 'owner@andere-firma.de', 'owner');

insert into customers (id, company_id, type, name, contact_person, email, phone, address_street, address_zip, address_city, created_by)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'private', 'Familie Müller', 'Julia Müller', 'julia.mueller@example.com', '0170 1234567', 'Am Baum 3', '12345', 'Musterstadt', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'business', 'Bäckerei Krause', 'Thomas Krause', 'info@krause-baeckerei.de', '0170 7654321', 'Marktplatz 5', '12345', 'Musterstadt', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'private', 'Herr Schneider', 'Klaus Schneider', 'k.schneider@example.com', '0171 1112222', 'Talweg 9', '54321', 'Anderstadt', '10000000-0000-0000-0000-000000000004');

insert into projects (id, company_id, customer_id, name, description, site_address_street, site_address_zip, site_address_city, status, start_date, end_date, estimated_hours, created_by)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Badsanierung Familie Müller', 'Komplettsanierung Badezimmer inkl. Fliesen und Sanitär', 'Am Baum 3', '12345', 'Musterstadt', 'in_progress', current_date - 5, current_date + 10, 80, '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Ladenumbau Bäckerei Krause', 'Umbau Verkaufsraum', 'Marktplatz 5', '12345', 'Musterstadt', 'planned', current_date + 14, current_date + 30, 40, '10000000-0000-0000-0000-000000000001');

insert into project_assignments (project_id, profile_id, role_on_project, assigned_from)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'lead', current_date - 5),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'helper', current_date - 5),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'lead', current_date + 14);

insert into project_status_history (project_id, status, changed_by, note)
values
  ('30000000-0000-0000-0000-000000000001', 'planned', '10000000-0000-0000-0000-000000000001', 'Projekt angelegt'),
  ('30000000-0000-0000-0000-000000000001', 'in_progress', '10000000-0000-0000-0000-000000000002', 'Arbeiten begonnen');

-- Quotes: one draft, one sent, one already converted to an invoice.
insert into quotes (id, company_id, customer_id, project_id, quote_number, status, issue_date, valid_until, subtotal, tax_total, total, created_by)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'AN-2026-0001', 'converted', current_date - 20, current_date + 10, 4200.00, 798.00, 4998.00, '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'AN-2026-0002', 'sent', current_date - 3, current_date + 27, 2500.00, 475.00, 2975.00, '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 'AN-2026-0003', 'draft', current_date, current_date + 30, 350.00, 66.50, 416.50, '10000000-0000-0000-0000-000000000001');

insert into quote_line_items (quote_id, position, description, quantity, unit, unit_price, tax_rate, line_total)
values
  ('40000000-0000-0000-0000-000000000001', 1, 'Demontage Altbad', 1, 'pauschal', 800.00, 19.00, 800.00),
  ('40000000-0000-0000-0000-000000000001', 2, 'Fliesenarbeiten', 40, 'm²', 65.00, 19.00, 2600.00),
  ('40000000-0000-0000-0000-000000000001', 3, 'Sanitärinstallation', 1, 'pauschal', 800.00, 19.00, 800.00),
  ('40000000-0000-0000-0000-000000000002', 1, 'Trockenbauarbeiten', 1, 'pauschal', 1500.00, 19.00, 1500.00),
  ('40000000-0000-0000-0000-000000000002', 2, 'Malerarbeiten', 50, 'm²', 20.00, 19.00, 1000.00),
  ('40000000-0000-0000-0000-000000000003', 1, 'Wasserhahn austauschen', 1, 'Stk', 350.00, 19.00, 350.00);

insert into invoices (id, company_id, customer_id, quote_id, project_id, invoice_number, status, issue_date, due_date, paid_at, subtotal, tax_total, total, created_by)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'RE-2026-0001', 'paid', current_date - 15, current_date + 15, current_date - 2, 4200.00, 798.00, 4998.00, '10000000-0000-0000-0000-000000000001');

insert into invoice_line_items (invoice_id, position, description, quantity, unit, unit_price, tax_rate, line_total)
values
  ('50000000-0000-0000-0000-000000000001', 1, 'Demontage Altbad', 1, 'pauschal', 800.00, 19.00, 800.00),
  ('50000000-0000-0000-0000-000000000001', 2, 'Fliesenarbeiten', 40, 'm²', 65.00, 19.00, 2600.00),
  ('50000000-0000-0000-0000-000000000001', 3, 'Sanitärinstallation', 1, 'pauschal', 800.00, 19.00, 800.00);

insert into document_counters (company_id, doc_type, year, next_number)
values
  ('00000000-0000-0000-0000-000000000001', 'quote', extract(year from current_date)::int, 4),
  ('00000000-0000-0000-0000-000000000001', 'invoice', extract(year from current_date)::int, 2);

insert into equipment (id, company_id, name, category, description, serial_number, daily_rental_price, is_rentable_to_customers, status)
values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Bohrhammer Bosch GBH 5-40', 'Bohrmaschine', 'SDS-Max Bohrhammer', 'SN-1001', 25.00, true, 'in_use'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Baugerüst 6m', 'Gerüst', 'Fassadengerüst, 6 Meter', 'SN-1002', 60.00, true, 'booked'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Betonmischer 140L', 'Mischer', 'Elektrischer Betonmischer', 'SN-1003', 35.00, false, 'available');

insert into equipment_bookings (id, company_id, equipment_id, booking_type, project_id, assigned_to, start_at, end_at, status, condition_out_notes)
values
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'internal_project', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', now() - interval '3 days', now() + interval '4 days', 'checked_out', 'Gerät in gutem Zustand ausgegeben');

insert into equipment_bookings (id, company_id, equipment_id, booking_type, customer_id, start_at, end_at, status)
values
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'customer_rental', '20000000-0000-0000-0000-000000000002', now() + interval '2 days', now() + interval '9 days', 'reserved');

insert into equipment_bookings (id, company_id, equipment_id, booking_type, project_id, assigned_to, start_at, end_at, actual_return_at, status, condition_out_notes, condition_in_notes)
values
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'internal_project', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', now() - interval '10 days', now() - interval '8 days', now() - interval '8 days', 'returned', 'ok', 'Sauber zurückgegeben');
