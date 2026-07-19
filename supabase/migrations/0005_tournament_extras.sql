-- Soporte para torneos de varios días y prioridad, necesarios para el calendario real del equipo
-- (ej. "24-26 Julio" o "6-9 Enero 2027", varios marcados como prioritarios por el coach).
alter table tournaments add column if not exists fecha_fin date;
alter table tournaments add column if not exists prioritario boolean not null default false;

comment on column tournaments.fecha is 'Fecha de inicio del torneo (o única fecha si es de un solo día).';
comment on column tournaments.fecha_fin is 'Fecha de término, solo si el torneo dura más de un día. NULL = torneo de un solo día.';
comment on column tournaments.prioritario is 'Marcado por el coach como prioritario en el calendario de la temporada.';
