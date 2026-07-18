import type {
  AttendanceStatus,
  SplitDistance,
  SwimmerGroup,
  TournamentEntryStatus,
  TrainingGroup,
  UserRole,
} from './roles';
import type { EvaluationScores } from '../domain/evaluation';

export interface UserRow {
  id: string;
  rol: UserRole;
  rut: string;
  nombre: string;
  pin_temporal: boolean;
  activo: boolean;
  created_at: string;
}

export interface SwimmerProfileRow {
  user_id: string;
  fecha_nacimiento: string | null;
  email: string | null;
  telefono: string | null;
  estilo_1: string | null;
  estilo_2: string | null;
  prueba_fav_1: string | null;
  prueba_fav_2: string | null;
  grupo: SwimmerGroup;
  prescripcion_medica: string | null;
  contacto_emergencia: string | null;
  perfil_completo: boolean;
}

export interface TrainingRow {
  id: string;
  fecha: string;
  hora: string | null;
  foco: string | null;
  distancia_total: number | null;
  grupo: TrainingGroup;
  sets: string[];
  creado_por: string | null;
  created_at: string;
}

export interface TrainingAttendanceRow {
  training_id: string;
  swimmer_id: string;
  estado: AttendanceStatus;
  confirmado_en: string | null;
}

export interface TournamentRow {
  id: string;
  nombre: string;
  fecha: string | null;
  lugar: string | null;
  estado: string;
}

export interface TournamentEntryRow {
  tournament_id: string;
  swimmer_id: string;
  pruebas: string[];
  estado: TournamentEntryStatus;
}

export interface ResultRow {
  id: string;
  swimmer_id: string;
  prueba: string;
  tiempo_centesimas: number;
  parciales: number[] | null;
  split_dist: SplitDistance | null;
  fecha: string;
  es_pb: boolean;
}

export interface EvaluationRow {
  id: string;
  swimmer_id: string;
  fecha: string;
  scores: EvaluationScores;
  nota: string | null;
  creado_por: string | null;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  accion: string;
  entidad: string | null;
  entidad_id: string | null;
  detalle: Record<string, unknown> | null;
  fecha: string;
}
