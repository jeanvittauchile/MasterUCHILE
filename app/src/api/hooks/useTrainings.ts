import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TrainingGroup } from '@masteruchile/shared';
import { apiFetch } from '../client';

export interface Training {
  id: string;
  fecha: string;
  hora: string | null;
  foco: string | null;
  distancia_total: number | null;
  grupo: TrainingGroup;
  sets: string[];
  attendance?: { swimmer_id: string; estado: string; confirmado_en: string | null; users?: { nombre: string } }[];
}

export function useTrainings(range?: { from: string; to: string }) {
  const qs = range ? `?from=${range.from}&to=${range.to}` : '';
  return useQuery({
    queryKey: ['trainings', range?.from, range?.to],
    queryFn: () => apiFetch<{ trainings: Training[] }>(`/trainings${qs}`),
  });
}

export function useTrainingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['training', id],
    queryFn: () => apiFetch<Training>(`/trainings/${id}`),
    enabled: !!id,
  });
}

export function useCreateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { fecha: string; hora?: string; foco: string; distancia_total: number; grupo: TrainingGroup; sets: string[] }) =>
      apiFetch<Training>('/trainings', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainings'] }),
  });
}

export function useConfirmAttendance(trainingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estado: 'confirmado' | 'declinado') =>
      apiFetch(`/trainings/${trainingId}/attendance/me`, { method: 'PATCH', body: { estado } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training', trainingId] });
      qc.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

export function useMarkAttendance(trainingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ swimmerId, estado }: { swimmerId: string; estado: string }) =>
      apiFetch(`/trainings/${trainingId}/attendance/${swimmerId}`, { method: 'PATCH', body: { estado } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training', trainingId] }),
  });
}
