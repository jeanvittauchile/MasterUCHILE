import React from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { BarChart } from '../../components/charts/BarChart';
import { useGeneralTournamentReport, useWeeklyAttendance, useWeeklyVolume, generalTournamentPdfUrl } from '../../api/hooks/useReports';
import { useTournaments } from '../../api/hooks/useTournaments';
import { colors, fonts } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function ReportsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const volume = useWeeklyVolume();
  const attendance = useWeeklyAttendance();
  const general = useGeneralTournamentReport();
  const tournaments = useTournaments();

  const lastVolume = volume.data?.weeks.at(-1)?.meters;
  const lastAttendance = attendance.data?.weeks.at(-1)?.pct;

  const isLoading = volume.isLoading || attendance.isLoading || general.isLoading || tournaments.isLoading;

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
