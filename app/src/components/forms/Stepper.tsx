import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

export function Stepper({ label, value, onValueChange }: { label: string; value: number; onValueChange: (v: number) => void }) {
  const dec = () => onValueChange(Math.max(0, value - 1));
  const inc = () => onValueChange(value + 1);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={dec}>
          <Text style={styles.buttonLabel}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable style={styles.button} onPress={inc}>
          <Text style={styles.buttonLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.barlowSemiBold, fontSize: 13.5, color: colors.textPrimary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: {
    width: 32,
    height: 32,
    borderRadius: radii.cardSm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontFamily: fonts.oswaldBold, fontSize: 18, color: colors.navy, lineHeight: 20 },
  value: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, minWidth: 22, textAlign: 'center' },
});
