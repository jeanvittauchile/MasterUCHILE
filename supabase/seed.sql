-- Datos iniciales de producción: solo el coach real del equipo. Los datos de ejemplo del
-- prototipo (6 nadadores demo, coach "Andrés Contreras", entrenamientos, torneos y marcas de
-- muestra) se usaron para verificar el despliegue end-to-end y luego se eliminaron de la base
-- real — este seed ya no los recrea, para que un `db reset`/reinstalación no los vuelva a
-- introducir. El propio coach da de alta nadadores, sesiones y torneos reales desde la app.
-- pin_hash se genera con pgcrypto (bcrypt) directamente en SQL: crypt(pin, gen_salt('bf')).
-- PIN de acceso (ver README): Jean Paull Vitta 1932.

insert into users (rol, rut, nombre, pin_hash, pin_temporal, activo) values
  ('coach', '17.691.204-9', 'Jean Paull Vitta', crypt('1932', gen_salt('bf')), false, true);
