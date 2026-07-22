import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTrainings } from '../../api/hooks/useTrainings';
import { useSwimmerFicha } from '../../api/hooks/useSwimmers';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii, shadows } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const WEEKDAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function dayBadge(iso: string) {
  const d = parseIsoDate(iso);
  return { top: WEEKDAYS[d.getDay()], bottom: String(d.getDate()) };
}

function longDate(iso: string, hora?: string | null) {
  const d = parseIsoDate(iso);
  const weekday = WEEKDAYS[d.getDay()];
  const label = `${weekday.charAt(0)}${weekday.slice(1).toLowerCase()} ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
  return hora ? `${label} · ${hora}` : label;
}

// La confirmación del nadador ES la asistencia: sin confirmar (o habiendo declinado) queda inasistente.
const ATTENDANCE_LABEL: Record<string, { label: string; color: string }> = {
  confirmado: { label: 'Confirmado', color: colors.green },
  asistio: { label: 'Confirmado', color: colors.green },
};

/** Lista de entrenamientos asignados al grupo del nadador, con su estado de confirmación. */
export function SessionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const ficha = useSwimmerFicha(user?.id);
  const trainings = useTrainings();

  const myGroup = ficha.data?.perfil?.grupo as string | undefined;
  const sessions = (trainings.data?.trainings ?? [])
    .filter((t) => t.grupo === 'Ambos' || t.grupo === myGroup)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (trainings.isLoading || ficha.isLoading) {
    return (
      <ScreenLayout title="Sesiones">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Sesiones">
      <Text style={styles.sectionTitle}>MIS ENTRENAMIENTOS ASIGNADOS</Text>
      {sessions.length === 0 ? (
        <EmptyState message="No tienes entrenamientos asignados todavía." />
      ) : (
        sessions.map((s) => {
          const badge = dayBadge(s.fecha);
          const estado = s.attendance?.[0]?.estado;
          const conf = (estado ? ATTENDANCE_LABEL[estado] : undefined) ?? { label: 'Inasistente', color: colors.red };
          return (
            <Pressable key={s.id} style={styles.row} onPress={() => navigation.navigate('SessionDetail', { trainingId: s.id })}>
              <View style={styles.dayBox}>
                <Text style={styles.dayTop}>{badge.top}</Text>
                <Text style={styles.dayBottom}>{badge.bottom}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{s.foco ?? 'Entrenamiento'}</Text>
                <Text style={styles.rowDate}>{longDate(s.fecha, s.hora)}</Text>
                <View style={styles.tagRow}>
                  <View style={styles.distTag}>
                    <Text style={styles.distTagLabel}>{s.distancia_total ?? 0} m</Text>
                  </View>
                  <View style={[styles.confTag, { backgroundColor: conf.color }]}>
                    <Text style={styles.confTagLabel}>{conf.label}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 14, ...shadows.card },
  dayBox: { width: 52, alignItems: 'center' },
  dayTop: { fontFamily: fonts.oswaldBold, fontSize: 13, color: colors.blueAccent },
  dayBottom: { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.navy, marginTop: 2 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy },
  rowDate: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' },
  distTag: { backgroundColor: colors.chipInfoBg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 9 },
  distTagLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 11, color: colors.chipInfoText },
  confTag: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 9 },
  confTagLabel: { fontFamily: fonts.barlowBold, fontSize: 11, color: colors.white },
  chevron: { color: colors.textTertiary, fontSize: 22 },
});
