export type UserRole = 'coach' | 'swimmer';
export type SwimmerGroup = 'AM' | 'PM';
export type Sexo = 'Masculino' | 'Femenino';
export type TrainingGroup = 'AM' | 'PM' | 'Ambos';
export type AttendanceStatus = 'confirmado' | 'declinado' | 'sin_responder' | 'asistio' | 'falto';
export type TournamentEntryStatus = 'inscrito' | 'participo';
export type SplitDistance = '25' | '50';

/** Claims del JWT propio, firmado por el backend con SUPABASE_JWT_SECRET. */
export interface AppJwtClaims {
  sub: string; // user id (uuid)
  role: 'authenticated'; // rol de Postgres que PostgREST debe asumir — NO es el rol de la app
  app_role: UserRole;
  iat: number;
  exp: number;
}
