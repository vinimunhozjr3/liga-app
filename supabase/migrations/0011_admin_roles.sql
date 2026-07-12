-- =========================================================
-- 0011_admin_roles.sql
-- =========================================================
-- Perfis de usuario com flag de admin. Usado pelas policies de
-- escrita das demais tabelas (migration 0012).

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "authenticated can select profiles"
  on public.profiles for select
  to authenticated using (true);

-- cria o profile automaticamente pra qualquer novo cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill pra quem ja tem conta antes dessa migration
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- helper usado nas policies de escrita de todas as tabelas
create or replace function public.is_admin()
returns boolean as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$ language sql security definer stable;
