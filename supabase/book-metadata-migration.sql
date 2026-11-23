-- Run once in the existing project's Supabase SQL Editor. No book rows are deleted.
begin;
alter table public.books add column if not exists translator text not null default '';
alter table public.books add column if not exists publisher text not null default '';
alter table public.books add column if not exists pages integer check (pages > 0);
alter table public.books add column if not exists keywords text not null default '';
alter table public.books add column if not exists spine text not null default '';
alter table public.books alter column rating type numeric(2,1) using rating::numeric(2,1);
alter table public.books drop constraint if exists books_rating_check;
alter table public.books add constraint books_rating_check check (rating = 0 or (rating between 1 and 5 and mod(rating,0.5)=0));
commit;
