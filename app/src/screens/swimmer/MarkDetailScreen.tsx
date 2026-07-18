import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LineChart } from '../../components/charts/LineChart';
import { useResults } from '../../api/hooks/useResults';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function shortDate(iso: string) {
  const d = parseIsoDate(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

/** Evolución de una prueba específica: mejor marca, gráfico de línea e historial con parciales. */
export function MarkDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'MarkDetail'>>();
  const { prueba } = route.params;
  const user = useAuthStore((s) => s.user);
  const results = useResults(user?.id, prueba);

  const history = useMemo(() => [...(results.data?.results ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha)), [results.data]);
  const chartData = useMemo(
    () =>
      [...history]
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map((r) => ({ label: shortDate(r.fecha), value: r.tiempo_centesimas / 100 })),
    [history],
  );
  const best = history.find((r) => r.es_pb) ?? history[0];

  if (results.isLoading) {
    return (
      <ScreenLayout title={prueba}>
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={prueba}>
      {best ? (
        <LinearGradient colors={[colors.red, colors.redDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroLabel}>MEJOR MARCA</Text>
          <Text style={styles.heroTime}>{best.tiempo}</Text>
          <Text style={styles.heroMeta}>
            {prueba} · {history.length} registros
          </Text>
        </LinearGradient>
      ) : (
        <EmptyState message="Aún no tienes registros para esta prueba." />
      )}

      <Card>
        <Text style={styles.cardTitle}>EVOLUCIÓN (seg)</Text>
        <Text style={styles.hint}>▼ El tiempo baja = mejora · {history.length} registros</Text>
        {chartData.length >= 2 ? (
          <LineChart data={chartData} height={150} />
        ) : (
          <EmptyState message="Necesitas al menos 2 registros para ver la evolución." />
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>HISTORIAL</Text>
        {history.length === 0 ? (
          <EmptyState message="Sin historial todavía." />
        ) : (
          history.map((h) => (
            <View key={h.id} style={styles.histRow}>
              <View style={styles.histTopRow}>
                <Text style={styles.histDate}>{shortDate(h.fecha)}</Text>
                <View style={styles.histRight}>
                  {h.es_pb ? (
                    <View style={styles.pbTag}>
                      <Text style={styles.pbTagLabel}>PB</Text>
                    </View>
                  ) : null}
                  <Text style={styles.histTime}>{h.tiempo}</Text>
                </View>
              </View>
              {h.parciales && h.parciales.length > 0 ? (
                <View style={styles.splitChips}>
                  {h.parciales.map((p, i) => (
                    <View key={i} style={styles.splitChip}>
                      <Text style={styles.splitChipLabel}>{(p / 100).toFixed(1)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        )}
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: radii.card, padding: 20 },
  heroLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.white, letterSpacing: 1.5, opacity: 0.85 },
  heroTime: { fontFamily: fonts.oswaldBold, fontSize: 38, color: colors.white, marginTop: 6 },
  heroMeta: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.white, opacity: 0.9, marginTop: 2 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  hint: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary, marginBottom: 8 },
  histRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.separator },
  histTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histDate: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary },
  histRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pbTag: { backgroundColor: colors.red, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  pbTagLabel: { fontFamily: fonts.barlowBold, fontSize: 10, color: colors.white },
  histTime: { fontFamily: fonts.oswaldBold, fontSize: 17, color: colors.navy },
  splitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  splitChip: { backgroundColor: colors.chipInfoBg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 9 },
  splitChipLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 11, color: colors.chipInfoText },
});
