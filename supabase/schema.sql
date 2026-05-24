-- FreeMe: estrutura de dados (Supabase PARTILHADO)
-- Todas as tabelas prefixadas com freeme_ para nao chocar com outros produtos
-- Executar no SQL Editor do Supabase Dashboard

-- Perfil FreeMe da utilizadora
create table public.freeme_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'pt' check (locale in ('pt', 'en')),
  paid boolean not null default false,
  paid_at timestamptz,
  paypal_order_id text,
  created_at timestamptz not null default now()
);

alter table public.freeme_profiles enable row level security;

create policy "freeme_profiles_select"
  on public.freeme_profiles for select
  using (auth.uid() = id);

create policy "freeme_profiles_update"
  on public.freeme_profiles for update
  using (auth.uid() = id);

create policy "freeme_profiles_insert"
  on public.freeme_profiles for insert
  with check (auth.uid() = id);

-- Criar perfil FreeMe automaticamente ao registar
-- Usa INSERT ON CONFLICT para nao falhar se o user ja existe
create or replace function public.freeme_handle_new_user()
returns trigger as $$
begin
  insert into public.freeme_profiles (id, locale)
  values (new.id, coalesce(new.raw_user_meta_data->>'locale', 'pt'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger freeme_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.freeme_handle_new_user();

-- Diagnostico
create table public.freeme_diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  responses jsonb not null default '[]',
  blocker_totals jsonb not null default '{}',
  active_blockers text[] not null default '{}',
  path_order text[] not null default '{}',
  trauma_flag boolean not null default false,
  completed_at timestamptz not null default now()
);

alter table public.freeme_diagnostics enable row level security;

create policy "freeme_diagnostics_select"
  on public.freeme_diagnostics for select
  using (auth.uid() = user_id);

create policy "freeme_diagnostics_insert"
  on public.freeme_diagnostics for insert
  with check (auth.uid() = user_id);

-- Percurso (jornada)
create table public.freeme_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnostic_id uuid not null references public.freeme_diagnostics(id) on delete cascade,
  path_order text[] not null default '{}',
  current_index int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.freeme_journeys enable row level security;

create policy "freeme_journeys_select"
  on public.freeme_journeys for select
  using (auth.uid() = user_id);

create policy "freeme_journeys_insert"
  on public.freeme_journeys for insert
  with check (auth.uid() = user_id);

create policy "freeme_journeys_update"
  on public.freeme_journeys for update
  using (auth.uid() = user_id);

-- Progresso por bloqueio
create table public.freeme_blocker_progress (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.freeme_journeys(id) on delete cascade,
  blocker_name text not null,
  order_in_path int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unlocked_at timestamptz
);

alter table public.freeme_blocker_progress enable row level security;

create policy "freeme_blocker_progress_select"
  on public.freeme_blocker_progress for select
  using (
    exists (
      select 1 from public.freeme_journeys
      where freeme_journeys.id = freeme_blocker_progress.journey_id
        and freeme_journeys.user_id = auth.uid()
    )
  );

create policy "freeme_blocker_progress_insert"
  on public.freeme_blocker_progress for insert
  with check (
    exists (
      select 1 from public.freeme_journeys
      where freeme_journeys.id = freeme_blocker_progress.journey_id
        and freeme_journeys.user_id = auth.uid()
    )
  );

create policy "freeme_blocker_progress_update"
  on public.freeme_blocker_progress for update
  using (
    exists (
      select 1 from public.freeme_journeys
      where freeme_journeys.id = freeme_blocker_progress.journey_id
        and freeme_journeys.user_id = auth.uid()
    )
  );

-- Anotacoes (o diario da mae, critico para a validacao final)
create table public.freeme_annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blocker_name text not null,
  step_index int not null,
  is_integration boolean not null default false,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.freeme_annotations enable row level security;

create policy "freeme_annotations_select"
  on public.freeme_annotations for select
  using (auth.uid() = user_id);

create policy "freeme_annotations_insert"
  on public.freeme_annotations for insert
  with check (auth.uid() = user_id);

create policy "freeme_annotations_update"
  on public.freeme_annotations for update
  using (auth.uid() = user_id);

create index idx_freeme_annotations_integration
  on public.freeme_annotations (user_id, is_integration)
  where is_integration = true;
