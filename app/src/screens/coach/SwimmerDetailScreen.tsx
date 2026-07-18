import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ageForSeason } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { KpiTile } from '../../components/ui/KpiTile';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { LineChart } from '../../components/charts/LineChart';
import { useSwimmerFicha } from '../../api/hooks/useSwimmers';
import { useRestorePin } from '../../api/hooks/useAuth';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—';
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}-${m}-${y}`;
}

function asText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export function SwimmerDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SwimmerDetail'>>();
  const { swimmerId } = route.params;
  const ficha = useSwimmerFicha(swimmerId);
  const restorePin = useRestorePin();

  const [selectedPrueba, setSelectedPrueba] = useState<string | null>(null);

  const pruebas = useMemo(() => {
    const set = new Set((ficha.data?.results ?? []).map((r) => r.prueba));
    return Array.from(set);
  }, [ficha.data]);

  const activePrueba = selectedPrueba ?? pruebas[0] ?? null;

  const chartData = useMemo(() => {
    if (!activePrueba) return [];
    return (ficha.data?.results ?? [])
      .filter((r) => r.prueba === activePrueba)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((r) => ({ label: r.fecha.slice(5), value: r.tiempo_centesimas / 100 }));
  }, [ficha.data, activePrueba]);

  if (ficha.isLoading || !ficha.data) {
    return (
      <ScreenLayout title="Nadador">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const sel = ficha.data;
  const perfil = sel.perfil ?? {};
  const age = typeof perfil.fecha_nacimiento === 'string' ? ageForSeason(perfil.fecha_nacimiento) : null;

  const fichaRows: { k: string; v: string }[] = [
    { k: 'Fecha de nacimiento', v: formatDate(perfil.fecha_nacimiento) },
    { k: 'Grupo', v: asText(perfil.grupo) },
    { k: 'Email', v: asText((perfil as Record<string, unknown>).email) },
    { k: 'Teléfono', v: asText((perfil as Record<string, unknown>).telefono) },
    { k: 'Estilo 1', v: asText((perfil as Record<string, unknown>).estilo_1) },
    { k: 'Estilo 2', v: asText((perfil as Record<string, unknown>).estilo_2) },
    { k: 'Prueba favorita 1', v: asText((perfil as Record<string, unknown>).prueba_fav_1) },
    { k: 'Prueba favorita 2', v: asText((perfil as Record<string, unknown>).prueba_fav_2) },
  ];

  const medical = asText((perfil as Record<string, unknown>).prescripcion_medica);
  const emergencyContact = asText((perfil as Record<string, unknown>).contacto_emergencia);

  return (
    <ScreenLayout title={sel.nombre}>
      <View style={styles.headerCard}>
        <Avatar name={sel.nombre} size={64} />
        <View>
          <Text style={styles.headerName}>{sel.nombre}</Text>
          <Text style={styles.headerMeta}>
            {sel.categoria?.label ?? 'Sin categoría'}
            {age != null ? ` · ${age} años` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.pinCard}>
        <Text style={styles.pinLabel}>PIN DE INGRESO</Text>
        <Text style={styles.pinHelp}>
          Por seguridad el PIN nunca se muestra tras su creación. Genera uno nuevo si el nadador lo olvidó.
        </Text>
        <PrimaryButton
          label="RESTAURAR PIN"
          variant="danger"
          loading={restorePin.isPending}
          onPress={() => restorePin.mutate(swimmerId)}
        />
        {restorePin.data ? (
          <View style={styles.pinResult}>
            <Text style={styles.pinResultValue}>{restorePin.data.pin}</Text>
            <Text style={styles.pinResultNote}>
              ✓ PIN temporal generado. El nadador deberá cambiarlo en su próximo ingreso. No volverá a mostrarse.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.kpiRow}>
        <KpiTile value={sel.pb?.tiempo ?? '—'} label={sel.pb ? `PB ${sel.pb.prueba}` : 'Sin PB'} />
        <KpiTile value={sel.attendancePct != null ? `${sel.attendancePct}%` : '—'} label="Asistencia" color={colors.green} />
        <KpiTile value={sel.categoria?.label?.replace('Máster ', '') ?? '—'} label="Categoría" color={colors.red} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>FICHA DEL NADADOR</Text>
        {fichaRows.map((r) => (
          <View key={r.k} style={styles.fichaRow}>
            <Text style={styles.fichaKey}>{r.k}</Text>
            <Text style={styles.fichaValue}>{r.v}</Text>
          </View>
        ))}
        <View style={styles.medicalBox}>
          <Text style={styles.medicalTitle}>⚕ PRESCRIPCIÓN MÉDICA · CONFIDENCIAL</Text>
          <Text style={styles.medicalText}>{medical}</Text>
          <Text style={styles.medicalTitle}>☎ CONTACTO DE EMERGENCIA · CONFIDENCIAL</Text>
          <Text style={styles.medicalText}>{emergencyContact}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>EVOLUCIÓN POR PRUEBA (seg)</Text>
        <Text style={styles.chartHint}>▼ El tiempo baja = mejora</Text>
        {pruebas.length === 0 ? (
          <EmptyState message="Aún no hay resultados registrados para este nadador." />
        ) : (
          <>
            <View style={styles.chipsRow}>
              {pruebas.map((p) => (
                <Chip key={p} label={p} active={p === activePrueba} onPress={() => setSelectedPrueba(p)} />
              ))}
            </View>
            {chartData.length >= 2 ? (
              <LineChart data={chartData} />
            ) : (
              <EmptyState message="Se necesitan al menos 2 resultados para graficar la evolución." />
            )}
          </>
        )}
      </Card>
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
    padding: 18,
  },
  headerName: { fontFamily: fonts.oswaldBold, fontSize: 21, color: colors.navy },
  headerMeta: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary, marginTop: 5 },
  pinCard: { backgroundColor: colors.navy, borderRadius: radii.card, padding: 18, gap: 12 },
  pinLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 11, color: colors.white, letterSpacing: 1.5, opacity: 0.8 },
  pinHelp: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.white, opacity: 0.85, lineHeight: 18 },
  pinResult: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radii.input, padding: 12, gap: 4 },
  pinResultValue: { fontFamily: fonts.oswaldBold, fontSize: 28, color: colors.white, letterSpacing: 6, textAlign: 'center' },
  pinResultNote: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.white },
  kpiRow: { flexDirection: 'row', gap: 10 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5, marginBottom: 12 },
  fichaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  fichaKey: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary },
  fichaValue: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.navy, textAlign: 'right', flexShrink: 1 },
  medicalBox: {
    marginTop: 12,
    backgroundColor: colors.medicalBg,
    borderWidth: 1,
    borderColor: colors.medicalBorder,
    borderRadius: radii.input,
    padding: 13,
    gap: 4,
  },
  medicalTitle: { fontFamily: fonts.barlowBold, fontSize: 11, color: colors.medicalText, letterSpacing: 0.5, marginTop: 8 },
  medicalText: { fontFamily: fonts.barlowRegular, fontSize: 13, color: '#334' },
  chartHint: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textTertiary, marginBottom: 10, marginTop: -6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
});
