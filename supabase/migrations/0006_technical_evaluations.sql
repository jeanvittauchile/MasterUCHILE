-- Evaluación técnica de viraje/salida: por intento se cronometra el tiempo y se cuentan
-- brazadas/patadas/movimientos subacuáticos (según tipo). Complementa a "evaluations" (nota
-- cualitativa 1-10 general), esta es específica y con datos crudos por intento.

create type technical_evaluation_type as enum ('viraje', 'salida');

create table technical_evaluations (
  id uuid primary key default gen_random_uuid(),
  swimmer_id uuid not null references users(id) on delete cascade,
  tipo technical_evaluation_type not null,
  fecha date not null default current_date,
  nota text,
  creado_por uuid references users(id),
  created_at timestamptz not null default now()
);
create index technical_evaluations_swimmer_fecha_idx on technical_evaluations (swimmer_id, fecha desc);

create table technical_evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references technical_evaluations(id) on delete cascade,
  numero_intento int not null,
  tiempo_centesimas int not null check (tiempo_centesimas > 0),
  brazadas int,
  patadas int,
  subacuatico int,
  constraint technical_evaluation_attempts_unique unique (evaluation_id, numero_intento)
);
create index technical_evaluation_attempts_eval_idx on technical_evaluation_attempts (evaluation_id);

alter table technical_evaluations enable row level security;
alter table technical_evaluation_attempts enable row level security;

-- mismo patrón que "evaluations" (0004_rls_policies.sql): coach administra, nadador solo lee lo propio.
create policy technical_evaluations_all_coach on technical_evaluations for all using (is_coach()) with check (is_coach());
create policy technical_evaluations_select_self on technical_evaluations for select using (swimmer_id = auth.uid());

create policy technical_evaluation_attempts_all_coach on technical_evaluation_attempts for all using (is_coach()) with check (is_coach());
create policy technical_evaluation_attempts_select_self on technical_evaluation_attempts for select using (
  exists (select 1 from technical_evaluations te where te.id = evaluation_id and te.swimmer_id = auth.uid())
);
