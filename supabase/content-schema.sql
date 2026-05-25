-- FreeMe: tabelas de produção de conteúdo para redes sociais
-- Executar no SQL Editor do Supabase (adiciona às tabelas freeme_* existentes)

create table public.freeme_content_items (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  type text not null check (type in ('carousel', 'video')),
  subtype text,
  categoria text,
  title text,
  slug text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'rendering', 'rendered', 'published', 'failed')),
  caption text,
  hashtags text,
  platforms text[] default '{"ig", "tiktok"}',
  scheduled_at timestamptz,
  output_urls jsonb default '{}',
  last_job_id text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.freeme_content_slides (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.freeme_content_items(id) on delete cascade,
  idx int not null,
  layout text not null default 'conteudo',
  body text not null default '',
  design jsonb default '{}',
  voice_url text,
  duration_sec numeric,
  created_at timestamptz not null default now()
);

create table public.freeme_render_jobs (
  job_id text primary key,
  item_id uuid not null references public.freeme_content_items(id) on delete cascade,
  kind text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  progress int default 0,
  message text,
  manifest_url text,
  result_url text,
  output jsonb default '{}'
);

create index idx_freeme_content_status on public.freeme_content_items(status);
create index idx_freeme_content_scheduled on public.freeme_content_items(scheduled_at) where scheduled_at is not null;
