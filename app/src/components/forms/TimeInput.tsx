import React from 'react';
import { isValidTimeInput } from '@masteruchile/shared';
import { FormField } from './FormField';

/** Tiempo en formato estándar m:ss.d (ej "1:02.4") o ss.d (ej "29.8"). Valida en vivo con packages/shared. */
export function TimeInput({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
  const showError = value.length > 0 && !isValidTimeInput(value);
  return (
    <FormField
      label="Tiempo estándar (00:00.0)"
      value={value}
      onChangeText={onChangeText}
      placeholder="01:02.4"
      inputMode="numeric"
      error={showError ? 'Formato inválido, usa m:ss.d (ej. 1:02.4)' : null}
    />
  );
}
