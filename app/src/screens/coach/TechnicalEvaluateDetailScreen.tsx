import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  TECHNICAL_EVALUATION_CONFIG,
  TECHNICAL_EVALUATION_METRIC_LABELS,
  TECHNICAL_EVALUATION_STROKE_LABELS,
  TURN_COMBINATION_LABELS,
  bestAttempt,
  formatCentiseconds,
  isValidTimeInput,
  type TechnicalEvaluationStroke,
  type TurnCombination,
} from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { TechnicalAttemptsEditor, newAttempt, type AttemptDraft } from '../../components/forms/TechnicalAttemptsEditor';
import { StrokeOrComboPicker } from '../../components/forms/StrokeOrComboPicker';
import { useSwimmerFicha } from '../../api/hooks/useSwimmers';
import { useAddTechnicalEvaluation, useTechnicalEvaluations } from '../../api/hooks/useTechnicalEvaluations';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function TechnicalEvaluateDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TechnicalEvaluateDetail'>>();
  const { swimmerId, tipo } = route.params;
  const config = TECHNICAL_EVALUATION_CONFIG[tipo];

  const swimmer = useSwimmerFicha(swimmerId);
  const evaluations = useTechnicalEvaluations(swimmerId, tipo);
  const addEvaluation = useAddTechnicalEvaluation(swimmerId);

  const [showForm, setShowForm] = useState(false);
  const [estilo, setEstilo] = useState<TechnicalEvaluationStroke | undefined>(undefined);
  const [combinacion, setCombinacion] = useState<TurnCombination | undefined>(undefined);
  const [attempts, setAttempts] = useState<AttemptDraft[]>([newAttempt(1)]);
  const [nota, setNota] = useState('');

  const validAttempts = attempts.filter((a) => isValidTimeInput(a.tiempo));
  const hasStyleSelection = tipo === 'salida' ? !!estilo : !!combinacion;
  const canSave = validAttempts.length > 0 && hasStyleSelection;

  const resetForm = () => {
    setAttempts([newAttempt(1)]);
    setNota('');
  };

  const handleSave = () => {
    addEvaluation.mutate(
      {
        tipo,
        estilo: tipo === 'salida' ? estilo : undefined,
        combinacion: tipo === 'viraje' ? combinacion : undefined,
        nota: nota.trim() || undefined,
        attempts: validAttempts.map((a) => ({
          numeroIntento: a.numeroIntento,
          tiempo: a.tiempo,
          ...(config.metrics.includes('brazadas') ? { brazadas: a.brazadas } : {}),
          ...(config.metrics.includes('patadas') ? { patadas: a.patadas } : {}),
          ...(config.metrics.includes('subacuatico') ? { subacuatico: a.subacuatico } : {}),
        })),
      },
      { onSuccess: () => { setShowForm(false); resetForm(); } },
    );
  };

  const history = evaluations.data?.evaluations ?? [];

  return (
    <ScreenLayout title={`${config.label} · ${swimmer.data?.nombre ?? ''}`}>
      <View style={styles.headerCard}>
        <Avatar name={swimmer.data?.nombre ?? '—'} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{swimmer.data?.nombre ?? '—'}</Text>
          <Text style={styles.headerMeta}>{history.length} evaluaciones de {config.label.toLowerCase()} registradas</Text>
        </View>
      </View>

      {showForm ? (
        <Card style={{ gap: 16 }}>
          <Text style={styles.cardTitle}>NUEVA EVALUACIÓN · {config.label.toUpperCase()}</Text>
          <Text style={styles.helpText}>{config.tiempoLabel}</Text>

          <StrokeOrComboPicker
            tipo={tipo}
            estilo={estilo}
            combinacion={combinacion}
            onChangeEstilo={setEstilo}
            onChangeCombinacion={setCombinacion}
          />

          <TechnicalAttemptsEditor tipo={tipo} attempts={attempts} onChange={setAttempts} />

          <View>
            <Text style={styles.fieldLabel}>Observaciones</Text>
            <TextInput
              value={nota}
              onChangeText={setNota}
              multiline
              numberOfLines={3}
              placeholder="Comentarios técnicos…"
              placeholderTextColor={colors.textTertiary}
              style={styles.textarea}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="CANCELAR" variant="outline" onPress={() => { setShowForm(false); resetForm(); }} />
            </View>
            <View style={{ flex: 2 }}>
              <PrimaryButton
                label="GUARDAR EVALUACIÓN"
                variant="danger"
                loading={addEvaluation.isPending}
                disabled={!canSave}
                onPress={handleSave}
              />
            </View>
          </View>
        </Card>
      ) : (
        <PrimaryButton label={`+ NUEVA EVALUACIÓN DE ${config.label.toUpperCase()}`} onPress={() => setShowForm(true)} />
      )}

      {!showForm ? (
        <>
          <Text style={styles.sectionTitle}>HISTORIAL</Text>
          {evaluations.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : history.length === 0 ? (
            <EmptyState message={`Sin evaluaciones de ${config.label.toLowerCase()} aún. Registra la primera con el botón de arriba.`} />
          ) : (
            history.map((h) => {
              const best = bestAttempt(h.attempts);
              const badge = h.estilo
                ? TECHNICAL_EVALUATION_STROKE_LABELS[h.estilo]
                : h.combinacion
                  ? TURN_COMBINATION_LABELS[h.combinacion]
                  : null;
              return (
                <View key={h.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDate}>{h.fecha}</Text>
                      {badge ? <Text style={styles.historyBadge}>{badge}</Text> : null}
                    </View>
                    {best ? <Text style={styles.historyBest}>Mejor: {formatCentiseconds(best.tiempo_centesimas)}</Text> : null}
                  </View>
                  {h.attempts
                    .slice()
                    .sort((a, b) => a.numero_intento - b.numero_intento)
                    .map((a) => (
                      <View key={a.id} style={styles.attemptRow}>
                        <Text style={styles.attemptRowLabel}>Intento {a.numero_intento}</Text>
                        <Text style={styles.attemptRowTime}>{formatCentiseconds(a.tiempo_centesimas)}</Text>
                        <View style={styles.attemptRowCounts}>
                          {config.metrics.map((metric) => (
                            <Text key={metric} style={styles.attemptRowCount}>
                              {TECHNICAL_EVALUATION_METRIC_LABELS[metric]}: {a[metric] ?? 0}
                            </Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  {h.nota ? <Text style={styles.noteBox}>{h.nota}</Text> : null}
                </View>
              );
            })
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
  },
  headerName: { fontFamily: fonts.oswaldBold, fontSize: 19, color: colors.navy },
  headerMeta: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 4 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  helpText: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: -12 },
  fieldLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: 12,
    fontSize: 14,
    color: colors.navy,
    fontFamily: fonts.barlowRegular,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  historyCard: { backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 15, gap: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.textSecondary },
  historyBadge: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.blueAccent, marginTop: 2 },
  historyBest: { fontFamily: fonts.oswaldBold, fontSize: 14, color: colors.navy },
  attemptRow: { borderTopWidth: 1, borderTopColor: colors.separator, paddingTop: 8, gap: 4 },
  attemptRowLabel: { fontFamily: fonts.barlowBold, fontSize: 12.5, color: colors.navy },
  attemptRowTime: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy },
  attemptRowCounts: { flexDirection: 'row', gap: 14 },
  attemptRowCount: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary },
  noteBox: {
    backgroundColor: colors.background,
    borderRadius: radii.input,
    padding: 12,
    fontFamily: fonts.barlowRegular,
    fontSize: 13,
    color: '#334',
    lineHeight: 18,
  },
});
