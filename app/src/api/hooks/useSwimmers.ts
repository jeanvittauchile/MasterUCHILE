import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export interface SwimmerListItem {
  id: string;
  nombre: string;
  pending: boolean;
  categoria: string | null;
}

export function useSwimmers(search?: string) {
  return useQuery({
    queryKey: ['swimmers', search ?? ''],
    queryFn: () => apiFetch<{ swimmers: SwimmerListItem[] }>(`/swimmers${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  });
}

export interface SwimmerFicha {
  id: string;
  nombre: string;
  rut: string;
  categoria: { label: string } | null;
  perfil: Record<string, unknown> & { fecha_nacimiento?: string | null; grupo?: string; prescripcion_medica?: string | null };
  attendancePct: number | null;
  pb: { prueba: string; tiempo: string } | null;
  results: { id: string; prueba: string; tiempo: string; tiempo_centesimas: number; fecha: string; es_pb: boolean }[];
}

export function useSwimmerFicha(swimmerId: string | undefined) {
  return useQuery({
    queryKey: ['swimmer', swimmerId],
    queryFn: () => apiFetch<SwimmerFicha>(`/swimmers/${swimmerId}`),
    enabled: !!swimmerId,
  });
}

export function useCreateSwimmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nombre: string; rut: string }) =>
      apiFetch<{ id: string; nombre: string; pin: string }>('/swimmers', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmers'] }),
  });
}

export function useImportSwimmers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiFetch<{
        imported: { nombre: string; rut: string; pin: string }[];
        rejected: { line: string; reason: string }[];
        count: number;
      }>('/swimmers/import', { method: 'POST', body: { text } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmers'] }),
  });
}

export function useUpdateSwimmerProfile(swimmerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => apiFetch(`/swimmers/${swimmerId}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swimmer', swimmerId] });
      qc.invalidateQueries({ queryKey: ['swimmers'] });
    },
  });
}

export function useSetFeaturedMarks(swimmerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultIds: string[]) =>
      apiFetch(`/swimmers/${swimmerId}/featured`, { method: 'PUT', body: { resultIds } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimmer', swimmerId] }),
  });
}
