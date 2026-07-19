import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isValidTimeInput } from '@masteruchile/shared';
import { colors, fonts, radii } from '../../theme/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const MAX_DIGITS = 5; // mm ss d (décimas)

function formatDigits(digits: string): string {
  const padded = digits.padStart(5, '0');
  const minutes = parseInt(padded.slice(0, 2), 10);
  const seconds = padded.slice(2, 4);
  const tenths = padded.slice(4, 5);
  return minutes > 0 ? `${minutes}:${seconds}.${tenths}` : `${seconds}.${tenths}`;
}

/**
 * Teclado numérico para anotar tiempos, igual al de ingreso de PIN: se tipean solo dígitos
 * y arman mm:ss.d de derecha a izquierda (como una calculadora), sin depender del teclado
 * nativo del dispositivo, que en modo numérico no siempre ofrece ":" ni ".".
 */
export function TimeInput({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
  const [digits, setDigits] = useState('');

  useEffect(() => {
    if (value === '') setDigits('');
  }, [value]);

  const display = formatDigits(digits);
  const showError = digits.length > 0 && !isValidTimeInput(display);

  const handlePress = (key: string) => {
    if (key === '') return;
    if (key === '⌫') {
      const next = digits.slice(0, -1);
      setDigits(next);
      onChangeText(next ? formatDigits(next) : '');
      return;
    }
    if (digits.length >= MAX_DIGITS) return;
    const next = digits + key;
    setDigits(next);
    onChangeText(formatDigits(next));
  };

  return (
    <View>
      <Text style={styles.label}>Tiempo (mm:ss.d)</Text>
      <View style={[styles.display, showError && styles.displayError]}>
        <Text style={styles.displayText}>{display}</Text>
      </View>
      {showError ? <Text style={styles.error}>Revisa el tiempo: los segundos deben ser menores a 60</Text> : null}
      <View style={styles.grid}>
        {KEYS.map((key, i) => (
          <Pressable
            key={i}
            disabled={key === ''}
            onPress={() => handlePress(key)}
            style={[styles.key, key === '' && styles.keyEmpty]}
          >
            <Text style={styles.keyLabel}>{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  display: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  displayError: { borderColor: colors.red },
  displayText: { fontFamily: fonts.oswaldBold, fontSize: 30, color: colors.navy, letterSpacing: 1 },
  error: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.red, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 10 },
  key: {
    width: '30%',
    height: 50,
    borderRadius: radii.cardSm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  keyLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 20, color: colors.navy },
});
