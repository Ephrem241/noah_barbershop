-- Trigger-only functions should not be callable through the API (/rest/v1/rpc/...).
-- Triggers still fire: EXECUTE is only checked when the trigger is created.
revoke execute on function public.validate_booking_request() from public, anon, authenticated;
revoke execute on function public.prevent_last_admin_delete() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- public.is_admin() stays executable on purpose: RLS policies evaluate it for every role, and the admin
-- panel calls rpc('is_admin') to decide what to show. It only reveals whether the caller is an admin.

create index admins_added_by_idx on public.admins (added_by);
