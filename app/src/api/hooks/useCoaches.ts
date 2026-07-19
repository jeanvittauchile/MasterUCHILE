import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export interface CoachListItem {
  id: string;
  nombre: string;
  rut: string;
  activo: boolean;
}

export function useCoaches() {
  return useQuery({
    queryKey: ['coaches'],
    queryFn: () => apiFetch<{ coaches: CoachListItem[] }>('/coaches'),
  });
}

export function useCreateCoach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nombre: string; rut: string }) =>
      apiFetch<{ id: string; nombre: string; pin: string }>('/coaches', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coaches'] }),
  });
}

export function useRestoreCoachPin() {
  return useMutation({
    mutationFn: (coachId: string) =>
      apiFetch<{ pin: string }>(`/coaches/${coachId}/restore-pin`, { method: 'POST' }),
  });
}
