-- Sexo del nadador (Masculino/Femenino), necesario para desglosar reportes de evaluaciones
-- técnicas por sexo. Nullable: nadadores existentes no tienen este dato hasta completarlo.

create type sexo as enum ('Masculino', 'Femenino');

alter table swimmer_profiles add column sexo sexo;
