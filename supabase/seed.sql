-- Datos de ejemplo espejo del prototipo (Natacion Master.dc.html), con RUTs corregidos a dígitos
-- verificadores realmente válidos (los del prototipo son ficticios y no pasan módulo 11).
-- pin_hash se genera con pgcrypto (bcrypt) directamente en SQL: crypt(pin, gen_salt('bf')).
-- PINs de demo (ver README): coach 1234 · Valentina 4821 · Matías 1097 · Camila 3355 · Diego 7788 ·
-- Francisca 9012 · Sebastián 6543 · Jean Paull Vitta 1932.

insert into users (rol, rut, nombre, pin_hash, pin_temporal, activo) values
  ('coach',   '98.765.432-5', 'Andrés Contreras',  crypt('1234', gen_salt('bf')), false, true),
  ('coach',   '17.691.204-9', 'Jean Paull Vitta',   crypt('1932', gen_salt('bf')), false, true),
  ('swimmer', '17.845.221-5', 'Valentina Rojas',    crypt('4821', gen_salt('bf')), false, true),
  ('swimmer', '15.220.984-3', 'Matías Fuentes',     crypt('1097', gen_salt('bf')), false, true),
  ('swimmer', '18.331.740-7', 'Camila Soto',        crypt('3355', gen_salt('bf')), false, true),
  ('swimmer', '13.998.210-K', 'Diego Herrera',      crypt('7788', gen_salt('bf')), false, true),
  ('swimmer', '15.660.033-4', 'Francisca Lagos',    crypt('9012', gen_salt('bf')), false, true),
  ('swimmer', '17.101.556-1', 'Sebastián Núñez',    crypt('6543', gen_salt('bf')), false, true);

insert into swimmer_profiles (user_id, fecha_nacimiento, email, telefono, estilo_1, estilo_2, prueba_fav_1, prueba_fav_2, grupo, prescripcion_medica, contacto_emergencia, perfil_completo)
select id, '1993-05-14'::date, 'v.rojas@uchile.cl', '+56 9 8123 4567', 'Libre', 'Espalda', '100 m Libre', '50 m Libre', 'AM'::swimmer_group, 'Sin restricciones · control cardiológico anual', 'María Díaz (madre) · +56 9 9871 2233', true
from users where nombre = 'Valentina Rojas'
union all
select id, '1988-11-02'::date, 'm.fuentes@uchile.cl', '+56 9 7333 1122', 'Libre', 'Mariposa', '100 m Libre', '200 m Libre', 'PM'::swimmer_group, 'Asma leve · usa inhalador pre-esfuerzo', 'Ana Pérez (esposa) · +56 9 6210 4590', true
from users where nombre = 'Matías Fuentes'
union all
select id, '1994-02-20'::date, 'c.soto@uchile.cl', '+56 9 5011 8890', 'Espalda', 'Libre', '100 m Libre', '200 m Libre', 'AM'::swimmer_group, 'Sin restricciones', 'Pedro Soto (padre) · +56 9 8890 1122', true
from users where nombre = 'Camila Soto'
union all
select id, '1983-07-30'::date, 'd.herrera@uchile.cl', '+56 9 4422 7788', 'Libre', 'Pecho', '100 m Libre', '100 m Espalda', 'PM'::swimmer_group, 'Hernia lumbar leve · evitar sobrecarga de piernas', 'Rosa Lira (esposa) · +56 9 3311 9900', true
from users where nombre = 'Diego Herrera'
union all
select id, '1987-09-12'::date, 'f.lagos@uchile.cl', '+56 9 6677 2211', 'Mariposa', 'Libre', '100 m Libre', '100 m Mariposa', 'AM'::swimmer_group, 'Sin restricciones', 'Luis Lagos (hermano) · +56 9 2200 5566', true
from users where nombre = 'Francisca Lagos'
union all
select id, '1992-12-05'::date, 's.nunez@uchile.cl', '+56 9 8001 3344', 'Libre', 'Mariposa', '100 m Libre', '50 m Mariposa', 'PM'::swimmer_group, 'Sin restricciones', 'Clara Núñez (madre) · +56 9 7788 3322', true
from users where nombre = 'Sebastián Núñez';

-- Entrenamientos (calendario de julio 2026)
insert into trainings (fecha, hora, foco, distancia_total, grupo, sets, creado_por)
select '2026-07-15'::date, '07:00'::time, 'Técnica', 2800, 'Ambos'::training_group,
  '["400 m calentamiento suave","8 × 50 m drills (catch-up / puño)","6 × 100 m técnica libre r/20\"","4 × 50 m nado perfecto","200 m vuelta a la calma"]'::jsonb,
  id from users where nombre = 'Andrés Contreras'
union all
select '2026-07-17'::date, '07:00'::time, 'Velocidad', 3200, 'AM'::training_group,
  '["600 m calentamiento progresivo","12 × 25 m máx r/45\"","6 × 50 m fuerte r/1:00","300 m suave","8 × 50 m salidas"]'::jsonb,
  id from users where nombre = 'Andrés Contreras'
union all
select '2026-07-19'::date, '07:00'::time, 'Aeróbico', 4000, 'PM'::training_group,
  '["800 m calentamiento","3 × 800 m ritmo umbral r/40\"","4 × 100 m estilos","200 m suave"]'::jsonb,
  id from users where nombre = 'Andrés Contreras'
union all
select '2026-07-20'::date, '09:00'::time, 'Control', 2000, 'Ambos'::training_group,
  '["1000 m calentamiento completo","2 × 100 m a ritmo","100 m TEST cronometrado","400 m recuperación"]'::jsonb,
  id from users where nombre = 'Andrés Contreras';

-- Asistencia: una fila por nadador y sesión que le corresponde por grupo (Ambos aplica a todos).
insert into training_attendance (training_id, swimmer_id, estado, confirmado_en)
select t.id, u.id,
  case when u.nombre in ('Diego Herrera', 'Sebastián Núñez') then 'sin_responder' else 'confirmado' end::attendance_status,
  case when u.nombre in ('Diego Herrera', 'Sebastián Núñez') then null else now() end
from trainings t
join swimmer_profiles sp on true
join users u on u.id = sp.user_id
where t.grupo = 'Ambos' or t.grupo::text = sp.grupo::text;

-- Torneos
insert into tournaments (nombre, fecha, lugar, estado) values
  ('Campeonato Regional Máster', '2026-08-02', 'Piscina Scotiabank, Santiago', 'Inscripción abierta'),
  ('Copa Invierno UChile', '2026-08-24', 'CDA, Ñuñoa', 'Próxima'),
  ('Nacional Máster', '2026-10-05', 'Complejo Acuático, Talca', 'Planificada');

insert into tournament_entries (tournament_id, swimmer_id, pruebas, estado)
select tr.id, u.id, entry.pruebas, 'inscrito'::tournament_entry_status
from tournaments tr
join (values
  ('Valentina Rojas', array['100 m Libre', '50 m Libre']),
  ('Camila Soto',     array['100 m Libre', '200 m Libre']),
  ('Sebastián Núñez', array['100 m Libre', '50 m Mariposa'])
) as entry(nombre, pruebas) on true
join users u on u.nombre = entry.nombre
where tr.nombre = 'Campeonato Regional Máster';

-- Marcas / resultados (tiempos en centésimas: parseTimeToCentiseconds("m:ss.d")).
insert into results (swimmer_id, prueba, tiempo_centesimas, parciales, split_dist, fecha, es_pb)
select u.id, r.prueba, r.tiempo, r.parciales::int[], r.split_dist::split_distance, r.fecha::date, r.es_pb
from users u
join (values
  ('Valentina Rojas', '100 m Libre',  6240, array[3090,3150], '50', '2026-07-13', true),
  ('Valentina Rojas', '50 m Libre',   2980, array[1440,1540], '25', '2026-07-13', true),
  ('Valentina Rojas', '100 m Libre',  6360, array[3120,3240], '50', '2026-06-29', false),
  ('Valentina Rojas', '100 m Espalda',7520, array[3680,3840], '50', '2026-07-06', true),
  ('Valentina Rojas', '100 m Libre',  6480, array[3180,3300], '50', '2026-06-15', false),
  ('Valentina Rojas', '200 m Libre', 14410, array[3420,3610,3680,3700], '50', '2026-06-29', true),
  ('Matías Fuentes',  '100 m Libre',  5890, null, null, '2026-07-10', true),
  ('Camila Soto',     '100 m Libre',  6810, null, null, '2026-07-10', true),
  ('Diego Herrera',   '100 m Libre',  6570, null, null, '2026-07-10', true),
  ('Francisca Lagos', '100 m Libre',  7130, null, null, '2026-07-10', true),
  ('Sebastián Núñez', '100 m Libre',  5620, null, null, '2026-07-10', true)
) as r(nombre, prueba, tiempo, parciales, split_dist, fecha, es_pb) on r.nombre = u.nombre;

-- Ficha del nadador: destacar sus mejores marcas de 100 m y 50 m Libre (hasta 3 permitidas, ver
-- prototype featIds) — Valentina.
update swimmer_profiles
set featured_result_ids = (
  select array_agg(id) from results
  where swimmer_id = (select id from users where nombre = 'Valentina Rojas')
    and es_pb = true and prueba in ('100 m Libre', '50 m Libre')
)
where user_id = (select id from users where nombre = 'Valentina Rojas');

-- Evaluaciones técnicas
insert into evaluations (swimmer_id, fecha, scores, nota, creado_por)
select u.id, e.fecha::date, e.scores::jsonb, e.nota, (select id from users where nombre = 'Andrés Contreras')
from users u
join (values
  ('Valentina Rojas', '2026-07-02', '{"libre":8.5,"espalda":7.8,"pecho":6.9,"mariposa":7.2,"virajes":8.0,"salidas":7.5}', 'Excelente técnica de libre. Mejorar patada de pecho.'),
  ('Valentina Rojas', '2026-06-04', '{"libre":8.0,"espalda":7.5,"pecho":6.5,"mariposa":6.8,"virajes":7.4,"salidas":7.0}', 'Buen avance general.'),
  ('Camila Soto',     '2026-07-02', '{"libre":7.6,"espalda":8.4,"pecho":7.0,"mariposa":6.5,"virajes":7.8,"salidas":7.2}', 'Espalda muy sólida.')
) as e(nombre, fecha, scores, nota) on e.nombre = u.nombre;
