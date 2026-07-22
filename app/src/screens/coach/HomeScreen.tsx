import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { KpiTile } from '../../components/ui/KpiTile';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { BarChart } from '../../components/charts/BarChart';
import { GroupedBarChart } from '../../components/charts/GroupedBarChart';
import { useSwimmers } from '../../api/hooks/useSwimmers';
import { useTrainings } from '../../api/hooks/useTrainings';
import { useTournaments } from '../../api/hooks/useTournaments';
import { useWeeklyVolume } from '../../api/hooks/useReports';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, groupTone, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const swimmers = useSwimmers();
  const trainings = useTrainings();
  const tournaments = useTournaments();
  const volume = useWeeklyVolume();

  const today = todayIso();
  const todaysSessions = (trainings.data?.trainings ?? []).filter((t) => t.fecha === today);
  const nextSession = (trainings.data?.trainings ?? [])
    .filter((t) => t.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  const activeTournaments = (tournaments.data?.tournaments ?? []).filter((t) => !t.fecha || t.fecha >= today).length;

  const groups = useMemo(() => {
    const byGroup: Record<'AM' | 'PM', { label: string; sub: string; members: { name: string; confLabel: string; confColor: string }[] }> = {
      AM: { label: 'AM', sub: '', members: [] },
      PM: { label: 'PM', sub: '', members: [] },
    };
    for (const session of todaysSessions) {
      const targets: ('AM' | 'PM')[] = session.grupo === 'Ambos' ? ['AM', 'PM'] : [session.grupo as 'AM' | 'PM'];
      for (const g of targets) {
        for (const att of session.attendance ?? []) {
          const confirmed = att.estado === 'confirmado' || att.estado === 'asistio';
          byGroup[g].members.push({
            name: (att as any).users?.nombre ?? '—',
            confLabel: confirmed ? 'Confirmado' : att.estado === 'declinado' ? 'No puede' : 'Sin responder',
            confColor: confirmed ? colors.green : att.estado === 'declinado' ? colors.red : colors.textTertiary,
          });
        }
      }
    }
    return byGroup;
  }, [trainings.data]);

  const attendanceTotals = useMemo(() => {
    let confirmed = 0;
    let notConfirmed = 0;
    for (const t of trainings.data?.trainings ?? []) {
      for (const att of t.attendance ?? []) {
        if (att.estado === 'confirmado' || att.estado === 'asistio') confirmed += 1;
        else notConfirmed += 1;
      }
    }
    return { confirmed, notConfirmed };
  }, [trainings.data]);

  const confirmationsBySession = useMemo(
    () =>
      (trainings.data?.trainings ?? []).slice(-8).map((t) => {
        let a = 0;
        let b = 0;
        for (const att of t.attendance ?? []) {
          if (att.estado === 'confirmado' || att.estado === 'asistio') a += 1;
          else b += 1;
        }
        return { label: t.fecha.slice(5), a, b };
      }),
    [trainings.data],
  );

  if (swimmers.isLoading || trainings.isLoading) {
    return (
      <ScreenLayout title="Inicio">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Inicio">
      <View>
        <Text style={styles.greeting}>Hola, Coach {user?.nombre?.split(' ')[0] ?? ''}</Text>
        <Text style={styles.dateLine}>{swimmers.data?.swimmers.length ?? 0} nadadores activos</Text>
      </View>

      {nextSession ? (
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>
            PRÓXIMA SESIÓN · {nextSession.fecha === today ? 'HOY' : nextSession.fecha} {nextSession.hora ?? ''}
          </Text>
          <Text style={styles.nextTitle}>{nextSession.foco}</Text>
          <Text style={styles.nextMeta}>
            {nextSession.distancia_total ?? 0} m · Grupo {nextSession.grupo}
          </Text>
        </View>
      ) : (
        <EmptyState message="No hay próximas sesiones. Programa una desde la pestaña Sesiones." />
      )}

      <View style={styles.kpiRow}>
        <KpiTile value={String(swimmers.data?.swimmers.length ?? 0)} label="Nadadores" />
        <KpiTile value={volume.data?.weeks.length ? `${volume.data.weeks.at(-1)?.meters ?? 0}m` : '—'} label="Volumen sem." color={colors.green} />
        <KpiTile value={String(activeTournaments)} label="Torneos activos" color={colors.red} />
      </View>

      <Card>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>VOLUMEN SEMANAL</Text>
        </View>
        {volume.data?.weeks.length ? (
          <BarChart data={volume.data.weeks.map((w) => ({ label: w.week.slice(5), value: w.meters }))} />
        ) : (
          <EmptyState message="Aún no hay sesiones registradas para graficar volumen." />
        )}
      </Card>

      <Card>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>CONFIRMACIONES POR SESIÓN</Text>
        </View>
        <View style={styles.kpiRow}>
          <KpiTile value={String(attendanceTotals.confirmed)} label="Confirmados/asistidos" color={colors.green} />
          <KpiTile value={String(attendanceTotals.notConfirmed)} label="No confirmados" color={colors.red} />
        </View>
        {confirmationsBySession.length ? (
          <GroupedBarChart data={confirmationsBySession} legendA="Confirmados/asistidos" legendB="No confirmados" />
        ) : (
          <EmptyState message="Aún no hay sesiones con nadadores asignados." />
        )}
      </Card>

      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>CONFIRMACIONES DE HOY</Text>
      </View>
      {todaysSessions.length === 0 ? (
        <EmptyState message="No hay sesiones programadas para hoy." />
      ) : (
        (['AM', 'PM'] as const).map((g) =>
          groups[g].members.length ? (
            <View key={g} style={{ gap: 8 }}>
              <Pill label={g} tone={groupTone[g]} />
              {groups[g].members.map((m, i) => (
                <View key={i} style={styles.memberRow}>
                  <Avatar name={m.name} size={38} />
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Pill label={m.confLabel} bg={m.confColor} />
                </View>
              ))}
            </View>
          ) : null,
        )
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.oswaldSemiBold, fontSize: 26, color: colors.navy },
  dateLine: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  nextCard: { backgroundColor: colors.red, borderRadius: radii.card, padding: 18 },
  nextLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.white, letterSpacing: 1.5, opacity: 0.85 },
  nextTitle: { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.white, marginTop: 6 },
  nextMeta: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.white, opacity: 0.9, marginTop: 2 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 11 },
  memberName: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14.5, color: colors.navy },
});
