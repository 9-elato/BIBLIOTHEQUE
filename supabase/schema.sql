-- 1. Supabase SQL Editor에서 실행합니다.
-- 2. 'YOUR_OWNER_AUTH_UID'를 Auth > Users에 표시되는 실제 사용자 UUID로 변경하세요.
-- 3. 이 테이블의 모든 데이터는 공개 열람용입니다. 비공개 메모를 넣지 마세요.
create extension if not exists pgcrypto;
create table if not exists public.books (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 300),
 author text not null default '',
 category text not null default '기타',
 status text not null default '읽고 싶음' check (status in ('완독','읽는 중','읽고 싶음')),
 rating integer not null default 0 check (rating between 0 and 5),
 year integer not null default 2026 check (year between 1900 and 2100),
 completed date,
 notes text not null default '',
 quote text not null default '',
 cover text not null default '',
 color text not null default '#71817c',
 created_at timestamptz not null default now()
);
alter table public.books enable row level security;
revoke all on table public.books from anon,authenticated;
grant select on table public.books to anon,authenticated;
grant insert,update,delete on table public.books to authenticated;
-- 방문자는 모든 책과 감상을 열람할 수 있습니다.
create policy "Anyone can read public books" on public.books for select to anon,authenticated using (true);
-- 실제 UUID로 변경할 때 작은따옴표는 유지하세요.
create policy "Only owner may add" on public.books for insert to authenticated with check (auth.uid() = 'YOUR_OWNER_AUTH_UID'::uuid);
create policy "Only owner may edit" on public.books for update to authenticated using (auth.uid() = 'YOUR_OWNER_AUTH_UID'::uuid) with check (auth.uid() = 'YOUR_OWNER_AUTH_UID'::uuid);
create policy "Only owner may delete" on public.books for delete to authenticated using (auth.uid() = 'YOUR_OWNER_AUTH_UID'::uuid);
