import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export interface Tournament {
  id: string;
  nombre: string;
  fecha: string | null;
  fecha_fin: string | null;
  lugar: string | null;
  estado: string;
  prioritario: boolean;
}

export interface TournamentReport extends Tournament {
  totalParticipants: number;
  totalEntries: number;
  participants: { swimmerId: string; nombre: string; categoria: string | null; pruebas: string[]; estado: string }[];
}

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: () => apiFetch<{ tournaments: Tournament[] }>('/tournaments'),
  });
}

export function useTournamentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => apiFetch<TournamentReport>(`/tournaments/${id}`),
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nombre: string; fecha: string; fechaFin?: string; lugar?: string; prioritario?: boolean }) =>
      apiFetch<Tournament>('/tournaments', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  });
}

export interface ImportTournamentsResult {
  imported: { nombre: string; fecha: string; fechaFin: string | null; prioritario: boolean }[];
  rejected: { line: string; reason: string }[];
  count: number;
}

export function useImportTournaments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => apiFetch<ImportTournamentsResult>('/tournaments/import', { method: 'POST', body: { text } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  });
}

export function useUpdateTournament(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      nombre?: string;
      fecha?: string;
      fechaFin?: string | null;
      lugar?: string | null;
      estado?: string;
      prioritario?: boolean;
    }) => apiFetch<Tournament>(`/tournaments/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      qc.invalidateQueries({ queryKey: ['tournament', id] });
    },
  });
}

export function useDeleteTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/tournaments/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  });
}

export function useAddEntry(tournamentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { swimmerId: string; pruebas: string[] }) =>
      apiFetch(`/tournaments/${tournamentId}/entries`, { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournament', tournamentId] }),
  });
}

export function useToggleMyParticipation(tournamentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estado: 'inscrito' | 'participo') =>
      apiFetch(`/tournaments/${tournamentId}/entries/me`, { method: 'PUT', body: { estado } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      qc.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}
