import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EVALUATION_CRITERIA } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { LineChart } from '../../components/charts/LineChart';
import { RadarChart } from '../../components/charts/RadarChart';
import { TimeInput } from '../../components/forms/TimeInput';
import { useResults, useAddResult } from '../../api/hooks/useResults';
import { useEvaluations } from '../../api/hooks/useEvaluations';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii, shadows } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const EVENTS = ['50 m Libre', '100 m Libre', '200 m Libre', '100 m Espalda', '100 m Pecho', '100 m Mariposa'];
const CRITERIA_LABELS: Record<string, string> = {
  libre: 'Libre',
  espalda: 'Espalda',
  pecho: 'Pecho',
  mariposa: 'Mariposa',
  virajes: 'Virajes',
  salidas: 'Salidas',
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function shortDate(iso: string) {
  const d = parseIsoDate(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

/** Evolución de marcas por prueba + evaluación técnica de solo lectura + registro de nuevos tiempos. */
export function ProgressScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[1]);
  const eventResults = useResults(user?.id, selectedEvent);
  const allResults = useResults(user?.id);
  const evaluations = useEvaluations(user?.id);
  const addResult = useAddResult(user?.id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [formEvent, setFormEvent] = useState(EVENTS[1]);
  const [formTime, setFormTime] = useState('');
  const [splitDist, setSplitDist] = useState<'25' | '50'>('50');
  const [splitsText, setSplitsText] = useState('');

  const chartData = useMemo(
    () =>
      [...(eventResults.data?.results ?? [])]
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map((r) => ({ label: shortDate(r.fecha), value: r.tiempo_centesimas / 100 })),
    [eventResults.data],
  );

  const latest = evaluations.data?.latest ?? null;

  const submitResult = () => {
    const parciales = splitsText
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    addResult.mutate(
      { prueba: formEvent, tiempo: formTime, splitDist, parciales: parciales.length ? parciales : undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setFormTime('');
          setSplitsText('');
        },
      },
    );
  };

  if (allResults.isLoading) {
    return (
      <ScreenLayout title="Progreso">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Progreso">
      <Card>
        <Text style={styles.cardTitle}>EVOLUCIÓN POR PRUEBA (seg)</Text>
        <Text style={styles.hint}>▼ El tiempo baja = mejora</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {EVENTS.map((e) => (
            <Chip key={e} label={e} active={selectedEvent === e} onPress={() => setSelectedEvent(e)} />
          ))}
        </ScrollView>
        {chartData.length >= 2 ? (
          <LineChart data={chartData} />
        ) : (
          <EmptyState message="Necesitas al menos 2 registros de esta prueba para ver la evolución." />
        )}
      </Card>

      {latest ? (
        <Card>
          <View style={styles.evalHeaderRow}>
            <Text style={styles.cardTitle}>MI EVALUACIÓN TÉCNICA</Text>
            <Text style={styles.evalDate}>{shortDate(latest.fecha)}</Text>
          </View>
          <RadarChart
            criteria={[...EVALUATION_CRITERIA]}
            labels={EVALUATION_CRITERIA.map((c) => CRITERIA_LABELS[c])}
            scores={latest.scores as Record<string, number>}
          />
          <Text style={styles.evalScore}>Promedio {latest.promedio} / 10</Text>
          {latest.nota ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>💬 {latest.nota}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.cardTitle}>MIS MARCAS</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.addBtnLabel}>+ REGISTRAR</Text>
        </Pressable>
      </View>

      {showForm ? (
        <Card>
          <Text style={styles.label}>Prueba</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {EVENTS.map((e) => (
              <Chip key={e} label={e} active={formEvent === e} onPress={() => setFormEvent(e)} />
            ))}
          </ScrollView>
          <TimeInput value={formTime} onChangeText={setFormTime} />
          <Text style={styles.label}>Parciales cada</Text>
          <View style={styles.splitRow}>
            {(['25', '50'] as const).map((d) => (
              <Pressable key={d} style={[styles.splitBtn, splitDist === d && styles.splitBtnActive]} onPress={() => setSplitDist(d)}>
                <Text style={[styles.splitBtnLabel, splitDist === d && styles.splitBtnLabelActive]}>{d} m</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Pasadas ({splitDist} m) — separadas por coma</Text>
          <TextInput
            value={splitsText}
            onChangeText={setSplitsText}
            placeholder="30.9, 31.5"
            style={styles.splitsInput}
            placeholderTextColor={colors.textTertiary}
          />
          <PrimaryButton label="GUARDAR TIEMPO" onPress={submitResult} loading={addResult.isPending} disabled={!formTime} />
        </Card>
      ) : null}

      {(allResults.data?.results ?? []).length === 0 ? (
        <EmptyState message="Aún no registras marcas." />
      ) : (
        (allResults.data?.results ?? []).map((r) => (
          <Pressable key={r.id} style={styles.resultRow} onPress={() => navigation.navigate('MarkDetail', { prueba: r.prueba })}>
            <View>
              <Text style={styles.resultEvent}>{r.prueba}</Text>
              <Text style={styles.resultDate}>{shortDate(r.fecha)} · ver evolución ›</Text>
            </View>
            <View style={styles.resultRight}>
              {r.es_pb ? (
                <View style={styles.pbTag}>
                  <Text style={styles.pbTagLabel}>PB</Text>
                </View>
              ) : null}
              <Text style={styles.resultTime}>{r.tiempo}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  hint: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary, marginBottom: 10 },
  chipsRow: { marginBottom: 10 },
  evalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  evalDate: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary },
  evalScore: { fontFamily: fonts.oswaldBold, fontSize: 15, color: colors.navy, textAlign: 'center' },
  noteBox: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginTop: 12 },
  noteText: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: colors.red, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  addBtnLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 12, color: colors.white, letterSpacing: 0.5 },
  label: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginTop: 8 },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  splitBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  splitBtnLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 13, color: colors.navy },
  splitBtnLabelActive: { color: colors.white },
  splitsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.barlowRegular,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    padding: 14,
    ...shadows.card,
  },
  resultEvent: { fontFamily: fonts.barlowBold, fontSize: 15, color: colors.navy },
  resultDate: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  resultRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pbTag: { backgroundColor: colors.red, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  pbTagLabel: { fontFamily: fonts.barlowBold, fontSize: 10, color: colors.white, letterSpacing: 0.5 },
  resultTime: { fontFamily: fonts.oswaldBold, fontSize: 19, color: colors.navy },
});
