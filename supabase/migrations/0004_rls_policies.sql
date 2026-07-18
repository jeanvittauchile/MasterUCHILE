-- RLS + grants. El backend firma su propio JWT (mismo SUPABASE_JWT_SECRET) con:
--   { sub: <user.id uuid>, role: "authenticated", app_role: "coach"|"swimmer" }
-- "role" (claim estándar) le dice a PostgREST a qué rol de Postgres cambiar — SIEMPRE "authenticated"
-- aquí (nunca usamos "anon": nuestro login es propio, no hay sesiones anónimas). "app_role" es el
-- claim custom que las policies usan para autorizar por rol de negocio. auth.uid() lee "sub".

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
-- anon no recibe privilegios: no hay acceso sin autenticar contra nuestro backend.

create or replace function is_coach()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'app_role', '') = 'coach';
$$;

alter table users enable row level security;
alter table swimmer_profiles enable row level security;
alter table trainings enable row level security;
alter table training_attendance enable row level security;
alter table tournaments enable row level security;
alter table tournament_entries enable row level security;
alter table results enable row level security;
alter table evaluations enable row level security;
alter table audit_log enable row level security;
alter table login_attempts enable row level security;
-- login_attempts: sin policies para authenticated/anon a propósito — solo accesible vía
-- supabaseAdmin (service_role bypassa RLS). Nunca debe ser legible/escribible desde el cliente.

-- users: cada quien lee su propia fila; coach lee el roster completo.
-- Sin insert/update/delete por RLS: altas, import, restaurar PIN y cambio de PIN se hacen
-- exclusivamente con supabaseAdmin en el backend (requieren tocar pin_hash con cuidado).
create policy users_select_self on users for select using (id = auth.uid());
create policy users_select_coach on users for select using (is_coach());

-- swimmer_profiles: dueño lee/edita lo propio; coach todo. Insert propio permitido para que el
-- nadador pueda completar su perfil la primera vez si no existe fila aún.
create policy swimmer_profiles_select_self on swimmer_profiles for select using (user_id = auth.uid());
create policy swimmer_profiles_insert_self on swimmer_profiles for insert with check (user_id = auth.uid());
create policy swimmer_profiles_update_self on swimmer_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy swimmer_profiles_all_coach on swimmer_profiles for all using (is_coach()) with check (is_coach());

-- trainings: coach administra todo; el nadador solo ve sesiones de su propio grupo o "Ambos".
create policy trainings_all_coach on trainings for all using (is_coach()) with check (is_coach());
create policy trainings_select_own_group on trainings for select using (
  grupo = 'Ambos'
  or grupo::text = (select sp.grupo::text from swimmer_profiles sp where sp.user_id = auth.uid())
);

-- training_attendance: coach administra todo (incluye crear filas al programar sesiones);
-- el nadador solo ve y actualiza su propia confirmación (Confirmar / No puedo).
create policy attendance_all_coach on training_attendance for all using (is_coach()) with check (is_coach());
create policy attendance_select_self on training_attendance for select using (swimmer_id = auth.uid());
create policy attendance_update_self on training_attendance for update using (swimmer_id = auth.uid()) with check (swimmer_id = auth.uid());

-- tournaments: coach administra; el calendario de torneos es visible para cualquier usuario autenticado.
create policy tournaments_all_coach on tournaments for all using (is_coach()) with check (is_coach());
create policy tournaments_select_authenticated on tournaments for select using (auth.role() = 'authenticated');

-- tournament_entries: coach administra todo (inscribir por prueba); el nadador ve y gestiona su
-- propia inscripción/participación (RSVP), pero no puede tocar las de otros nadadores.
create policy entries_all_coach on tournament_entries for all using (is_coach()) with check (is_coach());
create policy entries_select_self on tournament_entries for select using (swimmer_id = auth.uid());
create policy entries_insert_self on tournament_entries for insert with check (swimmer_id = auth.uid());
create policy entries_update_self on tournament_entries for update using (swimmer_id = auth.uid()) with check (swimmer_id = auth.uid());

-- results: coach administra todo; el nadador ve su propio historial y solo puede insertar (append-only,
-- no editar/borrar marcas ya registradas).
create policy results_all_coach on results for all using (is_coach()) with check (is_coach());
create policy results_select_self on results for select using (swimmer_id = auth.uid());
create policy results_insert_self on results for insert with check (swimmer_id = auth.uid());

-- evaluations: coach administra todo (las escribe); el nadador solo lee las propias (solo lectura).
create policy evaluations_all_coach on evaluations for all using (is_coach()) with check (is_coach());
create policy evaluations_select_self on evaluations for select using (swimmer_id = auth.uid());

-- audit_log: exclusivo de coach (auditoría de restauraciones de PIN y ediciones de datos de salud).
create policy audit_log_all_coach on audit_log for all using (is_coach()) with check (is_coach());
