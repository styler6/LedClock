-- Storage buckets for generated PDFs, logos, and field photos.
-- Path convention for every bucket: {company_id}/... so a single policy
-- pattern (first path segment must equal the caller's company) covers all of
-- them.

insert into storage.buckets (id, name, public)
values
  ('company-logos', 'company-logos', false),
  ('quote-pdfs', 'quote-pdfs', false),
  ('invoice-pdfs', 'invoice-pdfs', false),
  ('project-photos', 'project-photos', false)
on conflict (id) do nothing;

create policy "read own company files" on storage.objects
  for select using (
    bucket_id in ('company-logos', 'quote-pdfs', 'invoice-pdfs', 'project-photos')
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "admins write own company files" on storage.objects
  for insert with check (
    bucket_id in ('company-logos', 'quote-pdfs', 'invoice-pdfs', 'project-photos')
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and public.current_role() in ('owner', 'admin')
  );

create policy "admins update own company files" on storage.objects
  for update using (
    bucket_id in ('company-logos', 'quote-pdfs', 'invoice-pdfs', 'project-photos')
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and public.current_role() in ('owner', 'admin')
  );

create policy "employees write their own project photos" on storage.objects
  for insert with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
