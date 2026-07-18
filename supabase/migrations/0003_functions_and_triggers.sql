-- Espejo SQL de packages/shared/src/domain/age.ts (categoryForBirthDate), para reportes agregados
-- que necesiten agrupar por categoría directo en SQL. La fuente de verdad canónica y testeada con
-- Jest sigue siendo la función TypeScript; esta es un espejo intencional, no la única implementación.
-- Regla (igual que el prototipo): edad = season_year - año de nacimiento (corte 31-dic), bandas de
-- 5 años desde 25, letra "A" empieza en la banda 30-34.
create or replace function category_for(birth date, season_year int default extract(year from now())::int)
returns text
language plpgsql
immutable
as $$
declare
  age int := season_year - extract(year from birth)::int;
  band_start int := greatest(25, floor(age / 5.0) * 5)::int;
  letter_index int := greatest(0, (band_start - 30) / 5);
  letter text := chr(65 + letter_index);
begin
  return 'Máster ' || letter || ' · ' || band_start || '–' || (band_start + 4);
end;
$$;

-- El cálculo de es_pb se hace en la capa de aplicación (results.service.ts), dentro de una transacción
-- que también des-marca el PB anterior — así queda como una función pura testeable con Jest normal,
-- sin depender de un trigger SQL difícil de testear unitariamente. Postgres solo aporta el CHECK de
-- rango y los índices (results_swimmer_prueba_idx) como respaldo para esa lógica.
