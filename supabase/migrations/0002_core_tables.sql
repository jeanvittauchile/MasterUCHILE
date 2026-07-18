-- Tablas núcleo. id uuid pk en todas salvo login_attempts (pk natural = identidad normalizada).

create table users (
  id uuid primary key default gen_random_uuid(),
  rol user_role not null,
  rut text not null,
  rut_normalizado text generated always as (upper(regexp_replace(rut, '[^0-9kK]', '', 'g'))) stored,
  nombre text not null,
  pin_hash text not null,
  pin_temporal boolean not null default true,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index users_rut_normalizado_key on users (rut_normalizado);
create index users_nombre_idx on users (lower(nombre));
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();

-- Dato personal/identificador nacional: rut se guarda pero id (uuid) es la única FK/llave pública.
comment on column users.rut is 'Dato personal (Ley 19.628) — nunca usar como llave en URLs, solo id.';

create table swimmer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  fecha_nacimiento date,
  email text,
  telefono text,
  estilo_1 text,
  estilo_2 text,
  prueba_fav_1 text,
  prueba_fav_2 text,
  grupo swimmer_group not null default 'AM',
  prescripcion_medica text,
  contacto_emergencia text,
  -- hasta 3 resultados que el nadador eligió destacar en su Inicio ("mejores marcas").
  featured_result_ids uuid[] not null default '{}',
  perfil_completo boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint swimmer_profiles_featured_max3 check (array_length(featured_result_ids, 1) is null or array_length(featured_result_ids, 1) <= 3)
);
create trigger swimmer_profiles_set_updated_at before update on swimmer_profiles
  for each row execute function set_updated_at();

comment on column swimmer_profiles.prescripcion_medica is 'Dato sensible (Ley 19.628) — solo visible para el propio nadador y su entrenador.';
comment on column swimmer_profiles.contacto_emergencia is 'Dato sensible (Ley 19.628) — solo visible para el propio nadador y su entrenador.';

create table trainings (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora time,
  foco text,
  distancia_total int,
  grupo training_group not null default 'Ambos',
  sets jsonb not null default '[]',
  creado_por uuid references users(id),
  created_at timestamptz not null default now()
);
create index trainings_fecha_idx on trainings (fecha);

create table training_attendance (
  training_id uuid not null references trainings(id) on delete cascade,
  swimmer_id uuid not null references users(id) on delete cascade,
  estado attendance_status not null default 'sin_responder',
  confirmado_en timestamptz,
  primary key (training_id, swimmer_id)
);

create table tournaments (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date,
  lugar text,
  estado text not null default 'planificada',
  created_at timestamptz not null default now()
);
create index tournaments_fecha_idx on tournaments (fecha);

create table tournament_entries (
  tournament_id uuid not null references tournaments(id) on delete cascade,
  swimmer_id uuid not null references users(id) on delete cascade,
  pruebas text[] not null default '{}',
  estado tournament_entry_status not null default 'inscrito',
  primary key (tournament_id, swimmer_id)
);

create table results (
  id uuid primary key default gen_random_uuid(),
  swimmer_id uuid not null references users(id) on delete cascade,
  prueba text not null,
  tiempo_centesimas int not null check (tiempo_centesimas > 0),
  parciales int[],
  split_dist split_distance,
  fecha date not null default current_date,
  es_pb boolean not null default false,
  created_at timestamptz not null default now()
);
create index results_swimmer_prueba_idx on results (swimmer_id, prueba, tiempo_centesimas);
create index results_swimmer_fecha_idx on results (swimmer_id, fecha);

-- nota: featured_result_ids no lleva FK de array nativa en Postgres; la integridad referencial
-- (que cada id exista y pertenezca al propio nadador) se valida en la API (services/swimmers.service.ts).

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  swimmer_id uuid not null references users(id) on delete cascade,
  fecha date not null default current_date,
  scores jsonb not null,
  nota text,
  creado_por uuid references users(id),
  created_at timestamptz not null default now()
);
create index evaluations_swimmer_fecha_idx on evaluations (swimmer_id, fecha desc);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  accion text not null,
  entidad text,
  entidad_id uuid,
  detalle jsonb,
  fecha timestamptz not null default now()
);
create index audit_log_fecha_idx on audit_log (fecha desc);

-- Rate-limiting de login persistente (el backend corre en funciones serverless sin memoria compartida).
create table login_attempts (
  identidad text primary key,
  intentos_fallidos int not null default 0,
  bloqueado_hasta timestamptz,
  ultimo_intento_en timestamptz
);
