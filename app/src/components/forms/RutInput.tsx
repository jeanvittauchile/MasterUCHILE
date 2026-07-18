import React from 'react';
import { isValidRut } from '@masteruchile/shared';
import { FormField } from './FormField';

export function RutInput({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
  const showError = value.length > 0 && !isValidRut(value);
  return (
    <FormField
      label="RUT"
      value={value}
      onChangeText={onChangeText}
      placeholder="12.345.678-5"
      error={showError ? 'RUT inválido' : null}
    />
  );
}
