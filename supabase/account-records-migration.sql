-- Run in the existing project's SQL editor. Private records, never anonymous reads.
create table if not exists public.account_records (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 1,
 payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object'),
 updated_at timestamptz not null default now()
);
alter table public.account_records enable row level security;
revoke all on public.account_records from anon;
grant select,insert,update on public.account_records to authenticated;
drop policy if exists "own records only" on public.account_records;
create policy "own records only" on public.account_records to authenticated
 using (auth.uid()=user_id) with check (auth.uid()=user_id);
create or replace function public.save_account_records(expected_revision bigint, new_payload jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare affected integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if expected_revision=0 then
  insert into public.account_records(user_id,revision,payload) values(auth.uid(),1,new_payload) on conflict do nothing;
 else
  update public.account_records set payload=new_payload, revision=revision+1,updated_at=now()
  where user_id=auth.uid() and revision=expected_revision;
 end if;
 get diagnostics affected=row_count;
 return affected=1;
end; $$;
revoke all on function public.save_account_records(bigint,jsonb) from public,anon;
grant execute on function public.save_account_records(bigint,jsonb) to authenticated;
