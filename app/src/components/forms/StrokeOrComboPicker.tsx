import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  TECHNICAL_EVALUATION_STROKES,
  TECHNICAL_EVALUATION_STROKE_LABELS,
  TURN_COMBINATIONS,
  TURN_COMBINATION_LABELS,
  type TechnicalEvaluationStroke,
  type TechnicalEvaluationType,
  type TurnCombination,
} from '@masteruchile/shared';
import { colors, fonts, radii } from '../../theme/tokens';

interface StrokeOrComboPickerProps {
  tipo: TechnicalEvaluationType;
  estilo: TechnicalEvaluationStroke | undefined;
  combinacion: TurnCombination | undefined;
  onChangeEstilo: (estilo: TechnicalEvaluationStroke) => void;
  onChangeCombinacion: (combinacion: TurnCombination) => void;
}

export function StrokeOrComboPicker({
  tipo,
  estilo,
  combinacion,
  onChangeEstilo,
  onChangeCombinacion,
}: StrokeOrComboPickerProps) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{tipo === 'salida' ? 'Estilo' : 'Combinación de viraje'}</Text>
      <View style={styles.chipRow}>
        {tipo === 'salida'
          ? TECHNICAL_EVALUATION_STROKES.map((s) => (
              <Pressable key={s} style={[styles.chip, estilo === s && styles.chipActive]} onPress={() => onChangeEstilo(s)}>
                <Text style={[styles.chipText, estilo === s && styles.chipTextActive]}>
                  {TECHNICAL_EVALUATION_STROKE_LABELS[s]}
                </Text>
              </Pressable>
            ))
          : TURN_COMBINATIONS.map((c) => (
              <Pressable key={c} style={[styles.chip, combinacion === c && styles.chipActive]} onPress={() => onChangeCombinacion(c)}>
                <Text style={[styles.chipText, combinacion === c && styles.chipTextActive]}>
                  {TURN_COMBINATION_LABELS[c]}
                </Text>
              </Pressable>
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.cardSm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  chipText: { fontFamily: fonts.barlowSemiBold, fontSize: 12.5, color: colors.navy },
  chipTextActive: { color: colors.white },
});
