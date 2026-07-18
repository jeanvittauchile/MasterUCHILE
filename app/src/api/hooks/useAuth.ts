import { useMutation } from '@tanstack/react-query';
import type { UserRole } from '@masteruchile/shared';
import { apiFetch } from '../client';
import { useAuthStore } from '../../store/authStore';

interface LoginResponse {
  token: string;
  user: { id: string; nombre: string; rol: UserRole; pinTemporal: boolean };
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: { identidad: string; pin: string }) =>
      apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: input }),
    onSuccess: (data) => setSession(data.token, data.user),
  });
}

export function useChangePin() {
  const clearPinTemporal = useAuthStore((s) => s.clearPinTemporal);
  return useMutation({
    mutationFn: (input: { pinActual?: string; pinNuevo: string; pinRepetido: string }) =>
      apiFetch<{ ok: true }>('/auth/change-pin', { method: 'POST', body: input }),
    onSuccess: clearPinTemporal,
  });
}

export function useRestorePin() {
  return useMutation({
    mutationFn: (swimmerId: string) =>
      apiFetch<{ pin: string }>(`/auth/swimmers/${swimmerId}/restore-pin`, { method: 'POST' }),
  });
}
