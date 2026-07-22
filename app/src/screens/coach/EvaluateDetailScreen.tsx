import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { EVALUATION_CRITERIA, type EvaluationCriterion, type EvaluationScores } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RadarChart } from '../../components/charts/RadarChart';
import { ScoreSlider } from '../../components/forms/ScoreSlider';
import { useSwimmerFicha } from '../../api/hooks/useSwimmers';
import { useAddEvaluation, useEvaluations } from '../../api/hooks/useEvaluations';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const LABELS: Record<EvaluationCriterion, string> = {
  libre: 'Libre',
  espalda: 'Espalda',
  pecho: 'Pecho',
  mariposa: 'Mariposa',
  virajes: 'Virajes',
  salidas: 'Salidas',
};

function defaultScores(): EvaluationScores {
  return EVALUATION_CRITERIA.reduce((acc, c) => ({ ...acc, [c]: 5 }), {} as EvaluationScores);
}

export function EvaluateDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'EvaluateDetail'>>();
  const { swimmerId } = route.params;

  const swimmer = useSwimmerFicha(swimmerId);
  const evaluations = useEvaluations(swimmerId);
  const addEvaluation = useAddEvaluation(swimmerId);

  const [showForm, setShowForm] = useState(false);
  const [scores, setScores] = useState<EvaluationScores>(defaultScores);
  const [nota, setNota] = useState('');

  const handleSave = () => {
    addEvaluation.mutate(
      { scores, nota: nota.trim() || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setScores(defaultScores());
          setNota('');
        },
      },
    );
  };

  const latest = evaluations.data?.latest ?? null;
  const history = evaluations.data?.evaluations ?? [];

  return (
    <ScreenLayout title={swimmer.data?.nombre ?? 'Evaluación'}>
      <View style={styles.headerCard}>
        <Avatar name={swimmer.data?.nombre ?? '—'} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{swimmer.data?.nombre ?? '—'}</Text>
          <Text style={styles.headerMeta}>{history.length} evaluaciones registradas</Text>
        </View>
      </View>

      {showForm ? (
        <Card style={{ gap: 16 }}>
          <Text style={styles.cardTitle}>NUEVA EVALUACIÓN</Text>
          {EVALUATION_CRITERIA.map((c) => (
            <ScoreSlider
              key={c}
              label={LABELS[c]}
              value={scores[c]}
              onValueChange={(v) => setScores((s) => ({ ...s, [c]: v }))}
            />
          ))}
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
              <PrimaryButton label="CANCELAR" variant="outline" onPress={() => setShowForm(false)} />
            </View>
            <View style={{ flex: 2 }}>
              <PrimaryButton label="GUARDAR EVALUACIÓN" variant="danger" loading={addEvaluation.isPending} onPress={handleSave} />
            </View>
          </View>
        </Card>
      ) : (
        <>
          <PrimaryButton label="+ NUEVA EVALUACIÓN" onPress={() => setShowForm(true)} />

          {evaluations.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : latest ? (
            <Card>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>PERFIL TÉCNICO</Text>
                <Text style={styles.latestDate}>{latest.fecha}</Text>
              </View>
              <RadarChart
                criteria={EVALUATION_CRITERIA as unknown as string[]}
                labels={EVALUATION_CRITERIA.map((c) => LABELS[c])}
                scores={latest.scores}
              />
              <Text style={styles.avgText}>Promedio {latest.promedio} / 10</Text>
              {latest.nota ? <Text style={styles.noteBox}>{latest.nota}</Text> : null}
            </Card>
          ) : (
            <EmptyState message="Sin evaluaciones aún. Registra la primera con el botón de arriba." />
          )}

          <Text style={styles.sectionTitle}>HISTORIAL</Text>
          {history.length === 0 ? (
            <EmptyState message="Aún no hay evaluaciones registradas." />
          ) : (
            history.map((h) => (
              <View key={h.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{h.fecha}</Text>
                  <Text style={styles.historyScore}>{h.promedio} / 10</Text>
                </View>
                <View style={{ gap: 7 }}>
                  {EVALUATION_CRITERIA.map((c) => (
                    <View key={c} style={styles.barRow}>
                      <Text style={styles.barLabel}>{LABELS[c]}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${(h.scores[c] / 10) * 100}%` }]} />
                      </View>
                      <Text style={styles.barValue}>{h.scores[c]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </>
      )}
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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  latestDate: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary },
  avgText: { textAlign: 'center', fontFamily: fonts.oswaldBold, fontSize: 15, color: colors.navy },
  noteBox: {
    backgroundColor: colors.background,
    borderRadius: radii.input,
    padding: 12,
    fontFamily: fonts.barlowRegular,
    fontSize: 13,
    color: '#334',
    marginTop: 12,
    lineHeight: 18,
  },
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
  historyCard: { backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 15 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyDate: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.textSecondary },
  historyScore: { fontFamily: fonts.oswaldBold, fontSize: 16, color: colors.navy },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, width: 64 },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.trackBg, borderRadius: 4 },
  barFill: { height: '100%', backgroundColor: colors.red, borderRadius: 4 },
  barValue: { fontFamily: fonts.barlowBold, fontSize: 12, color: colors.navy, width: 26, textAlign: 'right' },
});
