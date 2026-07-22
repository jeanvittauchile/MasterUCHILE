import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TechnicalEvaluationStroke, TechnicalEvaluationType, TurnCombination } from '@masteruchile/shared';
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
  estilo: TechnicalEvaluationStroke | null;
  combinacion: TurnCombination | null;
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
      estilo?: TechnicalEvaluationStroke;
      combinacion?: TurnCombination;
      nota?: string;
      attempts: TechnicalEvaluationAttemptInput[];
    }) => apiFetch<TechnicalEvaluationItem>('/technical-evaluations', { method: 'POST', body: { swimmerId, ...input } }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['technical-evaluations', swimmerId, variables.tipo] }),
  });
}

export interface BulkTechnicalEvaluationEntryInput {
  swimmerId: string;
  nota?: string;
  attempts: TechnicalEvaluationAttemptInput[];
}

export function useAddBulkTechnicalEvaluations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tipo: TechnicalEvaluationType;
      estilo?: TechnicalEvaluationStroke;
      combinacion?: TurnCombination;
      entries: BulkTechnicalEvaluationEntryInput[];
    }) => apiFetch<{ evaluations: TechnicalEvaluationItem[] }>('/technical-evaluations/bulk', { method: 'POST', body: input }),
    onSuccess: (_data, variables) => {
      for (const entry of variables.entries) {
        qc.invalidateQueries({ queryKey: ['technical-evaluations', entry.swimmerId, variables.tipo] });
      }
    },
  });
}
