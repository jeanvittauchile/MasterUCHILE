-- Agrega estilo (para salida) y combinación de viraje (para viraje) a las evaluaciones técnicas.
-- Mutuamente excluyentes según "tipo": salida requiere estilo, viraje requiere combinación.

create type technical_evaluation_stroke as enum ('crol', 'espalda', 'pecho', 'mariposa');

create type technical_evaluation_turn_combo as enum (
  'crol_crol',
  'espalda_espalda',
  'mariposa_mariposa',
  'pecho_pecho',
  'mariposa_espalda',
  'espalda_pecho',
  'pecho_crol'
);

alter table technical_evaluations add column estilo technical_evaluation_stroke;
alter table technical_evaluations add column combinacion technical_evaluation_turn_combo;

-- "not valid" para no romper filas ya existentes (creadas antes de este campo); se aplica igual
-- a todo insert/update nuevo.
alter table technical_evaluations add constraint technical_evaluations_estilo_combinacion_check check (
  (tipo = 'salida' and estilo is not null and combinacion is null) or
  (tipo = 'viraje' and combinacion is not null and estilo is null)
) not valid;
