import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiUrl } from '../client';

export function useWeeklyVolume() {
  return useQuery({
    queryKey: ['reports', 'weekly-volume'],
    queryFn: () => apiFetch<{ weeks: { week: string; meters: number }[] }>('/reports/weekly-volume'),
  });
}

export function useWeeklyAttendance() {
  return useQuery({
    queryKey: ['reports', 'attendance'],
    queryFn: () => apiFetch<{ weeks: { week: string; pct: number }[] }>('/reports/attendance'),
  });
}

export function useGeneralTournamentReport() {
  return useQuery({
    queryKey: ['reports', 'tournaments-general'],
    queryFn: () => apiFetch<{ totalTournaments: number; totalEntries: number; bySwimmer: { nombre: string; count: number }[] }>(
      '/reports/tournaments/general',
    ),
  });
}

export const tournamentPdfUrl = (id: string) => apiUrl(`/reports/tournaments/${id}.pdf`);
export const generalTournamentPdfUrl = () => apiUrl('/reports/tournaments/general.pdf');

export interface TechnicalEvaluationTypeSummary {
  count: number;
  avgTiempo: number | null;
  avgSubacuatico?: number | null;
  avgPatadas?: number | null;
  avgBrazadas: number | null;
}

export interface TechnicalEvaluationsReport {
  overall: { salida: TechnicalEvaluationTypeSummary; viraje: TechnicalEvaluationTypeSummary };
  byGender: {
    Masculino: { salida: TechnicalEvaluationTypeSummary; viraje: TechnicalEvaluationTypeSummary };
    Femenino: { salida: TechnicalEvaluationTypeSummary; viraje: TechnicalEvaluationTypeSummary };
  };
  progress: {
    salida: { period: string; avgTiempo: number }[];
    viraje: { period: string; avgTiempo: number }[];
  };
  swimmerLevels: {
    swimmerId: string;
    nombre: string;
    sexo: 'Masculino' | 'Femenino' | null;
    salida: { estilo: string; mejorTiempo: number; nivel: 'AR' | 'A' | 'I' | 'P' } | null;
    viraje: { combinacion: string; mejorTiempo: number; nivel: 'AR' | 'A' | 'I' | 'P' } | null;
  }[];
}

export function useTechnicalEvaluationsReport() {
  return useQuery({
    queryKey: ['reports', 'technical-evaluations'],
    queryFn: () => apiFetch<TechnicalEvaluationsReport>('/reports/technical-evaluations'),
  });
}
