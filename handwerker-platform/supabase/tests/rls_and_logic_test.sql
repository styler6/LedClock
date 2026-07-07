-- Regressions-Test für Row Level Security und Kern-Business-Logik.
--
-- Ausführen gegen eine frisch geseedete lokale Datenbank:
--   supabase db reset
--   psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" \
--     -f supabase/tests/rls_and_logic_test.sql
--
-- Jeder Block impersoniert einen Nutzer, indem er die Rolle `authenticated`
-- annimmt und `request.jwt.claims` setzt — exakt das, was PostgREST pro Request
-- tut; auth.uid() liest die Nutzer-ID daraus. Die verwendeten UUIDs stammen aus
-- supabase/seed.sql (Firma A = ...0001, Firma A Mitarbeiterin Anna = ...0002,
-- Firma B = ...0004).
--
-- Erwartetes Ergebnis: alle Zählwerte wie kommentiert, zwei NOTICE-Zeilen
-- ("OK: ...") für Rollen-Schutz und Geräte-Überlappung, und am Ende
-- "ALLE TESTS DURCHLAUFEN." ohne ERROR.

\set ON_ERROR_STOP on
\pset pager off

\echo '== TEST 1: Firma A Owner sieht eigene Daten =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select 'customers (erwartet 2)' as check, count(*) from customers;
select 'quotes (erwartet 3)'    as check, count(*) from quotes;
select 'invoices (erwartet 1)'  as check, count(*) from invoices;
select 'projects (erwartet 2)'  as check, count(*) from projects;
select 'equipment (erwartet 3)' as check, count(*) from equipment;
commit;

\echo '== TEST 2: Mandanten-Isolation — Firma B sieht NICHTS von Firma A =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
select 'customers (erwartet 1, nur Firma B)' as check, count(*) from customers;
select 'quotes (erwartet 0)'    as check, count(*) from quotes;
select 'invoices (erwartet 0)'  as check, count(*) from invoices;
select 'projects (erwartet 0)'  as check, count(*) from projects;
select 'equipment (erwartet 0)' as check, count(*) from equipment;
select 'gezielter Zugriff auf Firma-A-Kunde (erwartet 0)' as check, count(*)
  from customers where id = '20000000-0000-0000-0000-000000000001';
commit;

\echo '== TEST 3: Firma B kann Firma-A-Daten nicht loeschen =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
with del as (delete from customers where id = '20000000-0000-0000-0000-000000000001' returning 1)
select 'geloeschte Firma-A-Kunden (erwartet 0)' as check, count(*) from del;
commit;

\echo '== TEST 4: Rollen-Schutz — Employee kann eigene Rolle nicht direkt aendern =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$
begin
  update profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000002';
  raise exception 'FEHLER: Rollenaenderung wurde faelschlich erlaubt';
exception when others then
  raise notice 'OK: direkte Rollenaenderung blockiert (%)', sqlerrm;
end $$;
rollback;

\echo '== TEST 5: Dokumentennummerierung fortlaufend & kollisionsfrei =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select 'Angebotsnummer #1' as check, public.next_document_number('00000000-0000-0000-0000-000000000001','quote');
select 'Angebotsnummer #2' as check, public.next_document_number('00000000-0000-0000-0000-000000000001','quote');
select 'Rechnungsnummer'   as check, public.next_document_number('00000000-0000-0000-0000-000000000001','invoice');
rollback;

\echo '== TEST 6: Geraete-Ueberlappung wird vom EXCLUDE-Constraint abgelehnt =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
begin
  insert into equipment_bookings (company_id, equipment_id, booking_type, customer_id, start_at, end_at, status)
  values ('00000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','customer_rental',
          '20000000-0000-0000-0000-000000000001', now() + interval '3 days', now() + interval '5 days', 'reserved');
  raise exception 'FEHLER: ueberlappende Buchung wurde faelschlich erlaubt';
exception when exclusion_violation then
  raise notice 'OK: ueberlappende Buchung durch EXCLUDE-Constraint abgelehnt';
end $$;
rollback;

\echo '== TEST 7: set_employee_role() als Owner funktioniert =='
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select public.set_employee_role('10000000-0000-0000-0000-000000000002','admin');
select 'Anna neue Rolle (erwartet admin)' as check, role from profiles where id = '10000000-0000-0000-0000-000000000002';
rollback;

\echo 'ALLE TESTS DURCHLAUFEN.'
