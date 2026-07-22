import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  TECHNICAL_EVALUATION_CONFIG,
  TECHNICAL_EVALUATION_METRIC_LABELS,
  type TechnicalEvaluationMetric,
  type TechnicalEvaluationType,
} from '@masteruchile/shared';
import { TimeInput } from './TimeInput';
import { Stepper } from './Stepper';
import { colors, fonts, radii } from '../../theme/tokens';

export interface AttemptDraft {
  numeroIntento: number;
  tiempo: string;
  brazadas: number;
  patadas: number;
  subacuatico: number;
}

export function newAttempt(numeroIntento: number): AttemptDraft {
  return { numeroIntento, tiempo: '', brazadas: 0, patadas: 0, subacuatico: 0 };
}

interface TechnicalAttemptsEditorProps {
  tipo: TechnicalEvaluationType;
  attempts: AttemptDraft[];
  onChange: (attempts: AttemptDraft[]) => void;
}

export function TechnicalAttemptsEditor({ tipo, attempts, onChange }: TechnicalAttemptsEditorProps) {
  const config = TECHNICAL_EVALUATION_CONFIG[tipo];

  const updateAttempt = (index: number, patch: Partial<AttemptDraft>) => {
    onChange(attempts.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const addAttemptRow = () => onChange([...attempts, newAttempt(attempts.length + 1)]);

  const removeAttemptRow = (index: number) => {
    onChange(attempts.filter((_, i) => i !== index).map((a, i) => ({ ...a, numeroIntento: i + 1 })));
  };

  return (
    <View style={{ gap: 12 }}>
      {attempts.map((attempt, index) => (
        <View key={index} style={styles.attemptCard}>
          <View style={styles.attemptHeader}>
            <Text style={styles.attemptTitle}>Intento {attempt.numeroIntento}</Text>
            {attempts.length > 1 ? (
              <Text style={styles.removeLink} onPress={() => removeAttemptRow(index)}>
                ✕ Quitar
              </Text>
            ) : null}
          </View>
          <TimeInput value={attempt.tiempo} onChangeText={(v) => updateAttempt(index, { tiempo: v })} />
          <View style={{ gap: 10, marginTop: 12 }}>
            {config.metrics.map((metric: TechnicalEvaluationMetric) => (
              <Stepper
                key={metric}
                label={TECHNICAL_EVALUATION_METRIC_LABELS[metric]}
                value={attempt[metric]}
                onValueChange={(v) => updateAttempt(index, { [metric]: v } as Partial<AttemptDraft>)}
              />
            ))}
          </View>
        </View>
      ))}
      <Text style={styles.addLink} onPress={addAttemptRow}>
        + Agregar intento
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  attemptCard: { backgroundColor: colors.background, borderRadius: radii.cardSm, padding: 14 },
  attemptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  attemptTitle: { fontFamily: fonts.barlowBold, fontSize: 13.5, color: colors.navy },
  removeLink: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.red },
  addLink: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.blueAccent, textAlign: 'center' },
});
