import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export interface ResultItem {
  id: string;
  swimmer_id: string;
  prueba: string;
  tiempo: string;
  tiempo_centesimas: number;
  parciales: number[] | null;
  split_dist: '25' | '50' | null;
  fecha: string;
  es_pb: boolean;
}

export function useResults(swimmerId: string | undefined, prueba?: string) {
  const qs = new URLSearchParams({ ...(swimmerId ? { swimmerId } : {}), ...(prueba ? { prueba } : {}) }).toString();
  return useQuery({
    queryKey: ['results', swimmerId, prueba ?? null],
    queryFn: () => apiFetch<{ results: ResultItem[] }>(`/results?${qs}`),
    enabled: !!swimmerId,
  });
}

export function useAddResult(swimmerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { prueba: string; tiempo: string; splitDist?: '25' | '50'; parciales?: number[] }) =>
      apiFetch<ResultItem>('/results', { method: 'POST', body: { swimmerId, ...input } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['results', swimmerId] });
      qc.invalidateQueries({ queryKey: ['swimmer', swimmerId] });
    },
  });
}
