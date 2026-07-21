import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TechnicalEvaluationType } from '@masteruchile/shared';
import { apiFetch } from '../client';

export interface TechnicalEvaluationAttemptItem {
  id: string;
  numero_intento: number;
  tiempo_centesimas: number;
  brazadas: number | null;
  patadas: number | null;
  subacuatico: number | null;
}

export interface TechnicalEvaluationItem {
  id: string;
  swimmer_id: string;
  tipo: TechnicalEvaluationType;
  fecha: string;
  nota: string | null;
  attempts: TechnicalEvaluationAttemptItem[];
}

export interface TechnicalEvaluationAttemptInput {
  numeroIntento: number;
  tiempo: string;
  brazadas?: number;
  patadas?: number;
  subacuatico?: number;
}

export function useTechnicalEvaluations(swimmerId: string | undefined, tipo: TechnicalEvaluationType) {
  return useQuery({
    queryKey: ['technical-evaluations', swimmerId, tipo],
    queryFn: () =>
      apiFetch<{ evaluations: TechnicalEvaluationItem[] }>(
        `/technical-evaluations?swimmerId=${swimmerId}&tipo=${tipo}`,
      ),
    enabled: !!swimmerId,
  });
}

export function useAddTechnicalEvaluation(swimmerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tipo: TechnicalEvaluationType;
      nota?: string;
      attempts: TechnicalEvaluationAttemptInput[];
    }) => apiFetch<TechnicalEvaluationItem>('/technical-evaluations', { method: 'POST', body: { swimmerId, ...input } }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['technical-evaluations', swimmerId, variables.tipo] }),
  });
}
