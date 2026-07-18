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
