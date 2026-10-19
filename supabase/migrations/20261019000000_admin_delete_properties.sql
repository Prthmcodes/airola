-- Admin delete for properties: only admins, and only when no cleaning task points at the property.
-- NOT YET APPLIED. Apply in the Supabase SQL editor, then run the security advisor.
--
-- Before this, "admin delete properties" was DELETE using is_admin() for role public. The FK
-- cleaning_tasks.property_id is ON DELETE SET NULL, so a delete would silently detach that
-- property's jobs. The app already refuses; this enforces the same rule in the database.

begin;

drop policy if exists "admin delete properties" on public.properties;

create policy "admin delete properties"
  on public.properties for delete
  to authenticated
  using (
    public.is_admin()
    and not exists (
      select 1 from public.cleaning_tasks t where t.property_id = properties.id
    )
  );

-- Signed-out visitors never delete properties; the policy already blocks them, this removes the grant too.
revoke delete on public.properties from anon;

commit;
