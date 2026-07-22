import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EVALUATION_LEVEL_LABELS, type EvaluationLevel } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { BarChart } from '../../components/charts/BarChart';
import { GroupedBarChart } from '../../components/charts/GroupedBarChart';
import { LineChart } from '../../components/charts/LineChart';
import { LevelReferenceTable } from '../../components/reports/LevelReferenceTable';
import {
  useGeneralTournamentReport,
  useTechnicalEvaluationsReport,
  useWeeklyAttendance,
  useWeeklyVolume,
  generalTournamentPdfUrl,
} from '../../api/hooks/useReports';
import { useTournaments } from '../../api/hooks/useTournaments';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const LEVEL_TONE: Record<EvaluationLevel, string> = {
  AR: colors.green,
  A: colors.blueAccent,
  I: colors.textSecondary,
  P: colors.red,
};

export function ReportsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const logout = useAuthStore((s) => s.logout);
  const volume = useWeeklyVolume();
  const attendance = useWeeklyAttendance();
  const general = useGeneralTournamentReport();
  const tournaments = useTournaments();
  const technical = useTechnicalEvaluationsReport();
  const [showLevelReference, setShowLevelReference] = useState(false);

  const lastVolume = volume.data?.weeks.at(-1)?.meters;
  const lastAttendance = attendance.data?.weeks.at(-1)?.pct;

  const salidaGenderData = (() => {
    const m = technical.data?.byGender.Masculino.salida;
    const f = technical.data?.byGender.Femenino.salida;
    if (!m || !f || (!m.count && !f.count)) return [];
    return [
      { label: 'Tiempo (s)', a: m.avgTiempo ?? 0, b: f.avgTiempo ?? 0 },
      { label: 'Subacuático', a: m.avgSubacuatico ?? 0, b: f.avgSubacuatico ?? 0 },
      { label: 'Brazadas', a: m.avgBrazadas ?? 0, b: f.avgBrazadas ?? 0 },
    ];
  })();

  const virajeGenderData = (() => {
    const m = technical.data?.byGender.Masculino.viraje;
    const f = technical.data?.byGender.Femenino.viraje;
    if (!m || !f || (!m.count && !f.count)) return [];
    return [
      { label: 'Tiempo (s)', a: m.avgTiempo ?? 0, b: f.avgTiempo ?? 0 },
      { label: 'Patadas', a: m.avgPatadas ?? 0, b: f.avgPatadas ?? 0 },
      { label: 'Brazadas', a: m.avgBrazadas ?? 0, b: f.avgBrazadas ?? 0 },
    ];
  })();

  const salidaProgress = (technical.data?.progress.salida ?? []).map((p) => ({ label: p.period.slice(5), value: p.avgTiempo }));
  const virajeProgress = (technical.data?.progress.viraje ?? []).map((p) => ({ label: p.period.slice(5), value: p.avgTiempo }));
  const swimmerLevels = technical.data?.swimmerLevels ?? [];

  const isLoading = volume.isLoading || attendance.isLoading || general.isLoading || tournaments.isLoading || technical.isLoading;

  return (
    <ScreenLayout title="Reportes">
      {isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : (
        <>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiBox, { backgroundColor: colors.navy }]}>
              <Text style={styles.kpiValue}>{lastVolume != null ? `${lastVolume}m` : '—'}</Text>
              <Text style={styles.kpiLabel}>Volumen semanal</Text>
            </View>
            <View style={[styles.kpiBox, { backgroundColor: colors.red }]}>
              <Text style={styles.kpiValue}>{lastAttendance != null ? `${lastAttendance}%` : '—'}</Text>
              <Text style={styles.kpiLabel}>Asistencia media</Text>
            </View>
          </View>

          <Card>
            <Text style={styles.cardTitle}>ASISTENCIA POR SEMANA</Text>
            {attendance.data?.weeks.length ? (
              <BarChart data={attendance.data.weeks.map((w) => ({ label: w.week.slice(5), value: w.pct }))} color={colors.red} />
            ) : (
              <EmptyState message="Aún no hay datos de asistencia registrados." />
            )}
          </Card>

          <Text style={styles.sectionTitle}>EVALUACIONES TÉCNICAS · SALIDAS Y VIRAJES</Text>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiBox, { backgroundColor: colors.navy }]}>
              <Text style={styles.kpiValue}>{technical.data?.overall.salida.count ?? 0}</Text>
              <Text style={styles.kpiLabel}>Intentos de salida</Text>
            </View>
            <View style={[styles.kpiBox, { backgroundColor: colors.red }]}>
              <Text style={styles.kpiValue}>{technical.data?.overall.viraje.count ?? 0}</Text>
              <Text style={styles.kpiLabel}>Intentos de viraje</Text>
            </View>
          </View>

          <Card>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>SALIDA — PROMEDIO POR SEXO</Text>
            {salidaGenderData.length ? (
              <GroupedBarChart data={salidaGenderData} legendA="Hombres" legendB="Mujeres" />
            ) : (
              <EmptyState message="Aún no hay evaluaciones de salida con sexo registrado." />
            )}
          </Card>

          <Card>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>VIRAJE — PROMEDIO POR SEXO</Text>
            {virajeGenderData.length ? (
              <GroupedBarChart data={virajeGenderData} legendA="Hombres" legendB="Mujeres" />
            ) : (
              <EmptyState message="Aún no hay evaluaciones de viraje con sexo registrado." />
            )}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>PROGRESO — TIEMPO PROMEDIO DE SALIDA (seg)</Text>
            <Text style={styles.chartHint}>▼ El tiempo baja = mejora</Text>
            {salidaProgress.length >= 2 ? (
              <LineChart data={salidaProgress} />
            ) : (
              <EmptyState message="Se necesitan al menos 2 meses con evaluaciones de salida para graficar el progreso." />
            )}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>PROGRESO — TIEMPO PROMEDIO DE VIRAJE (seg)</Text>
            <Text style={styles.chartHint}>▼ El tiempo baja = mejora</Text>
            {virajeProgress.length >= 2 ? (
              <LineChart data={virajeProgress} />
            ) : (
              <EmptyState message="Se necesitan al menos 2 meses con evaluaciones de viraje para graficar el progreso." />
            )}
          </Card>

          <Card>
            <Pressable onPress={() => setShowLevelReference((v) => !v)}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.cardTitle}>TABLA DE REFERENCIA DE NIVELES</Text>
                <Text style={styles.cardLink}>{showLevelReference ? 'OCULTAR ▲' : 'VER ▼'}</Text>
              </View>
            </Pressable>
            {showLevelReference ? <LevelReferenceTable /> : null}
          </Card>

          <Card>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>NIVEL POR NADADOR</Text>
            {swimmerLevels.length === 0 ? (
              <EmptyState message="Aún no hay evaluaciones técnicas registradas." />
            ) : (
              swimmerLevels.map((s) => (
                <View key={s.swimmerId} style={styles.swimmerRow}>
                  <Avatar name={s.nombre} size={34} />
                  <Text style={styles.swimmerName}>{s.nombre}</Text>
                  <View style={{ gap: 4, alignItems: 'flex-end' }}>
                    <Pill
                      label={s.salida ? `Salida · ${EVALUATION_LEVEL_LABELS[s.salida.nivel]}` : 'Salida sin evaluar'}
                      tone={s.salida ? LEVEL_TONE[s.salida.nivel] : colors.textTertiary}
                    />
                    <Pill
                      label={s.viraje ? `Viraje · ${EVALUATION_LEVEL_LABELS[s.viraje.nivel]}` : 'Viraje sin evaluar'}
                      tone={s.viraje ? LEVEL_TONE[s.viraje.nivel] : colors.textTertiary}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>

          <Text style={styles.sectionTitle}>RESUMEN GENERAL DE TORNEOS</Text>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiBox, { backgroundColor: colors.navy }]}>
              <Text style={styles.kpiValue}>{general.data?.totalTournaments ?? 0}</Text>
              <Text style={styles.kpiLabel}>Torneos a la fecha</Text>
            </View>
            <View style={[styles.kpiBox, { backgroundColor: colors.green }]}>
              <Text style={styles.kpiValue}>{general.data?.totalEntries ?? 0}</Text>
              <Text style={styles.kpiLabel}>Participaciones totales</Text>
            </View>
          </View>

          <Card>
            <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: 10 }]}>TORNEOS POR NADADOR</Text>
            {!general.data?.bySwimmer.length ? (
              <EmptyState message="Aún no hay inscripciones registradas." />
            ) : (
              general.data.bySwimmer.map((r) => (
                <View key={r.nombre} style={styles.swimmerRow}>
                  <Avatar name={r.nombre} size={34} />
                  <Text style={styles.swimmerName}>{r.nombre}</Text>
                  <Text style={styles.swimmerCount}>{r.count}</Text>
                  <Text style={styles.swimmerUnit}>torneos</Text>
                </View>
              ))
            )}
          </Card>

          <Pressable onPress={() => Linking.openURL(generalTournamentPdfUrl())}>
            <Text style={styles.exportLink}>EXPORTAR REPORTE GENERAL (PDF) ↓</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>CUENTA</Text>
          <Pressable style={styles.tourRow} onPress={() => navigation.navigate('Coaches')}>
            <View>
              <Text style={styles.tourName}>Entrenadores</Text>
              <Text style={styles.tourMeta}>Agregar entrenador o recuperar un PIN olvidado</Text>
            </View>
            <Text style={styles.tourLink}>GESTIONAR ›</Text>
          </Pressable>
          <PrimaryButton label="CERRAR SESIÓN" variant="outline" onPress={logout} />

          <Text style={styles.sectionTitle}>REPORTES DE TORNEO</Text>
          {tournaments.data?.tournaments.length ? (
            tournaments.data.tournaments.map((t) => (
              <Pressable key={t.id} style={styles.tourRow} onPress={() => navigation.navigate('TournamentDetail', { tournamentId: t.id })}>
                <View>
                  <Text style={styles.tourName}>{t.nombre}</Text>
                  <Text style={styles.tourMeta}>
                    {t.fecha ?? '—'} · {t.lugar ?? '—'}
                  </Text>
                </View>
                <Text style={styles.tourLink}>VER ›</Text>
              </Pressable>
            ))
          ) : (
            <EmptyState message="Aún no hay torneos registrados." />
          )}
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiBox: { flex: 1, borderRadius: 16, padding: 16 },
  kpiValue: { fontFamily: fonts.oswaldBold, fontSize: 28, color: colors.white, lineHeight: 30 },
  kpiLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.white, opacity: 0.85, marginTop: 4 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLink: { fontFamily: fonts.oswaldSemiBold, fontSize: 12, color: colors.blueAccent },
  chartHint: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary, marginBottom: 10, marginTop: -6 },
  swimmerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.separator },
  swimmerName: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
  swimmerCount: { fontFamily: fonts.oswaldBold, fontSize: 16, color: colors.navy },
  swimmerUnit: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textTertiary, width: 52 },
  exportLink: { textAlign: 'center', fontFamily: fonts.oswaldSemiBold, fontSize: 13, color: colors.blueAccent, letterSpacing: 0.5 },
  tourRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tourName: { fontFamily: fonts.barlowBold, fontSize: 15, color: colors.navy },
  tourMeta: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  tourLink: { fontFamily: fonts.oswaldSemiBold, fontSize: 13, color: colors.blueAccent },
});
