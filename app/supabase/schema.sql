-- FreeMe: estrutura de dados (Supabase)
-- Executar no SQL Editor do Supabase Dashboard

-- Perfil da utilizadora (estende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'pt' check (locale in ('pt', 'en')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Criar perfil automaticamente ao registar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, locale)
  values (new.id, coalesce(new.raw_user_meta_data->>'locale', 'pt'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Diagnostico
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  responses jsonb not null default '[]',
  blocker_totals jsonb not null default '{}',
  active_blockers text[] not null default '{}',
  path_order text[] not null default '{}',
  trauma_flag boolean not null default false,
  completed_at timestamptz not null default now()
);

alter table public.diagnostics enable row level security;

create policy "Users read own diagnostics"
  on public.diagnostics for select
  using (auth.uid() = user_id);

create policy "Users insert own diagnostics"
  on public.diagnostics for insert
  with check (auth.uid() = user_id);

-- Percurso (jornada)
create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  path_order text[] not null default '{}',
  current_index int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.journeys enable row level security;

create policy "Users read own journeys"
  on public.journeys for select
  using (auth.uid() = user_id);

create policy "Users insert own journeys"
  on public.journeys for insert
  with check (auth.uid() = user_id);

create policy "Users update own journeys"
  on public.journeys for update
  using (auth.uid() = user_id);

-- Progresso por bloqueio
create table public.blocker_progress (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  blocker_name text not null,
  order_in_path int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unlocked_at timestamptz
);

alter table public.blocker_progress enable row level security;

create policy "Users read own blocker progress"
  on public.blocker_progress for select
  using (
    exists (
      select 1 from public.journeys
      where journeys.id = blocker_progress.journey_id
        and journeys.user_id = auth.uid()
    )
  );

create policy "Users insert own blocker progress"
  on public.blocker_progress for insert
  with check (
    exists (
      select 1 from public.journeys
      where journeys.id = blocker_progress.journey_id
        and journeys.user_id = auth.uid()
    )
  );

create policy "Users update own blocker progress"
  on public.blocker_progress for update
  using (
    exists (
      select 1 from public.journeys
      where journeys.id = blocker_progress.journey_id
        and journeys.user_id = auth.uid()
    )
  );

-- Anotacoes (o diario da mae, critico para a validacao final)
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blocker_name text not null,
  step_index int not null,
  is_integration boolean not null default false,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.annotations enable row level security;

create policy "Users read own annotations"
  on public.annotations for select
  using (auth.uid() = user_id);

create policy "Users insert own annotations"
  on public.annotations for insert
  with check (auth.uid() = user_id);

create policy "Users update own annotations"
  on public.annotations for update
  using (auth.uid() = user_id);

-- Indice para buscar anotacoes de integracao rapidamente (validacao final)
create index idx_annotations_integration
  on public.annotations (user_id, is_integration)
  where is_integration = true;
