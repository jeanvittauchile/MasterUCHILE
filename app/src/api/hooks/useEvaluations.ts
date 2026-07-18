import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EvaluationScores } from '@masteruchile/shared';
import { apiFetch } from '../client';

export interface EvaluationItem {
  id: string;
  swimmer_id: string;
  fecha: string;
  scores: EvaluationScores;
  nota: string | null;
  promedio: number;
}

export function useEvaluations(swimmerId: string | undefined) {
  return useQuery({
    queryKey: ['evaluations', swimmerId],
    queryFn: () => apiFetch<{ evaluations: EvaluationItem[]; latest: EvaluationItem | null }>(`/evaluations?swimmerId=${swimmerId}`),
    enabled: !!swimmerId,
  });
}

export function useAddEvaluation(swimmerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { scores: EvaluationScores; nota?: string }) =>
      apiFetch<EvaluationItem>('/evaluations', { method: 'POST', body: { swimmerId, ...input } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations', swimmerId] }),
  });
}
