-- ============================================================
-- WG Marketing — Sistema Interno
-- Schema inicial (Supabase / Postgres)
-- MVP: Clientes + Atividades + Metas
-- ============================================================

-- Extensão para uuid
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
create type client_status as enum ('prospect', 'ativo', 'pausado', 'encerrado');

create table clients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  segment             text,                          -- ex: "estética", "e-commerce", "pavimentação"
  status              client_status not null default 'prospect',
  services            text[] default '{}',            -- ex: {'trafego_pago','whatsapp_ai','site'}
  recurring_value     numeric(10,2),                  -- ticket recorrente mensal
  acquisition_channel text,                           -- como o cliente chegou
  contact_name        text,
  contact_phone       text,
  contact_email       text,
  country             text default 'BR',
  start_date          date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- METAS (Goals)
-- ------------------------------------------------------------
create type goal_status as enum ('em_andamento', 'atingida', 'atrasada', 'cancelada');

create table goals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,                        -- ex: "Reduzir CAC do cliente X"
  metric_name   text not null,                         -- ex: "CAC", "ROAS", "novos_clientes"
  target_value  numeric,
  current_value numeric default 0,
  unit          text,                                  -- ex: "R$", "%", "un"
  client_id     uuid references clients(id) on delete cascade,  -- null = meta interna da agência
  deadline      date,
  status        goal_status not null default 'em_andamento',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ATIVIDADES (Tasks)
-- ------------------------------------------------------------
create type activity_type as enum ('campanha', 'prospeccao', 'atendimento', 'financeiro', 'desenvolvimento', 'outro');
create type activity_priority as enum ('baixa', 'media', 'alta', 'urgente');
create type activity_status as enum ('pendente', 'em_andamento', 'concluida', 'cancelada');

create table activities (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  type            activity_type not null default 'outro',
  priority        activity_priority not null default 'media',
  status          activity_status not null default 'pendente',
  client_id       uuid references clients(id) on delete set null,  -- null = atividade interna
  goal_id         uuid references goals(id) on delete set null,    -- vincula a atividade a uma meta
  due_date        date,
  is_recurring    boolean not null default false,
  recurrence_rule text,                                -- ex: "daily", "weekly:mon,thu"
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices básicos pra dashboard (filtros do dia a dia)
-- ------------------------------------------------------------
create index idx_activities_status on activities(status);
create index idx_activities_due_date on activities(due_date);
create index idx_activities_client on activities(client_id);
create index idx_goals_client on goals(client_id);
create index idx_goals_status on goals(status);

-- ------------------------------------------------------------
-- Trigger simples pra manter updated_at em dia
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger trg_goals_updated_at before update on goals
  for each row execute function set_updated_at();
create trigger trg_activities_updated_at before update on activities
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- RLS (ativa por padrão no Supabase — como é uso solo, libera
-- tudo pro seu usuário autenticado; ajuste se for ter equipe)
-- ------------------------------------------------------------
alter table clients enable row level security;
alter table goals enable row level security;
alter table activities enable row level security;

create policy "acesso total autenticado" on clients
  for all using (auth.role() = 'authenticated');
create policy "acesso total autenticado" on goals
  for all using (auth.role() = 'authenticated');
create policy "acesso total autenticado" on activities
  for all using (auth.role() = 'authenticated');
