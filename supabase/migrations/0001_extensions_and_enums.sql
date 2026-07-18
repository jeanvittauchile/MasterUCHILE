-- Extensiones y tipos enumerados compartidos por el esquema.

create extension if not exists pgcrypto;

create type user_role as enum ('coach', 'swimmer');
create type swimmer_group as enum ('AM', 'PM');
create type training_group as enum ('AM', 'PM', 'Ambos');
create type attendance_status as enum ('confirmado', 'declinado', 'sin_responder', 'asistio', 'falto');
create type tournament_entry_status as enum ('inscrito', 'participo');
create type split_distance as enum ('25', '50');

-- Trigger genérico para mantener updated_at.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
