import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { KpiTile } from '../../components/ui/KpiTile';
import { EmptyState } from '../../components/ui/EmptyState';
import { BarChart } from '../../components/charts/BarChart';
import { useSwimmerFicha, useSetFeaturedMarks, type SwimmerFicha } from '../../api/hooks/useSwimmers';
import { useTrainings } from '../../api/hooks/useTrainings';
import { useTournaments } from '../../api/hooks/useTournaments';
import { useAuthStore } from '../../store/authStore';
import { todayIso, shortDate } from '../../lib/date';
import { colors, fonts, radii, shadows } from '../../theme/tokens';
import type { RootStackParamList, SwimmerTabParamList } from '../../navigation/types';

type FichaResult = SwimmerFicha['results'][number];
type Nav = CompositeNavigationProp<BottomTabNavigationProp<SwimmerTabParamList>, NativeStackNavigationProp<RootStackParamList>>;

const FEATURED_GRADIENTS: [string, string][] = [
  [colors.red, colors.redDark],
  [colors.navy, colors.navySecondary],
  [colors.blueAccent, colors.navy],
];

/** Inicio del nadador: próxima sesión, KPIs, próximo torneo y mejores marcas destacadas. */
export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const ficha = useSwimmerFicha(user?.id);
  const trainings = useTrainings();
  const tournaments = useTournaments();
  const setFeatured = useSetFeaturedMarks(user?.id ?? '');

  const [editingFeatured, setEditingFeatured] = useState(false);
  // Nota: el backend no expone featured_result_ids en SwimmerFicha todavía, así que la selección
  // vive solo en esta sesión (no se precarga desde el servidor). Ver reporte final.
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);

  const today = todayIso();
  const myGroup = ficha.data?.perfil?.grupo as string | undefined;

  const nextSession = useMemo(
    () =>
      (trainings.data?.trainings ?? [])
        .filter((t) => t.fecha >= today && (t.grupo === 'Ambos' || t.grupo === myGroup))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))[0],
    [trainings.data, today, myGroup],
  );

  const nextTournament = useMemo(
    () =>
      (tournaments.data?.tournaments ?? [])
        .filter((t) => !!t.fecha && t.fecha >= today)
        .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''))[0],
    [tournaments.data, today],
  );

  const results = ficha.data?.results ?? [];
  const pbCount = results.filter((r) => r.es_pb).length;

  const myConfirmations = useMemo(() => {
    let confirmed = 0;
    let notConfirmed = 0;
    for (const t of trainings.data?.trainings ?? []) {
      if (t.grupo !== 'Ambos' && t.grupo !== myGroup) continue;
      const estado = t.attendance?.[0]?.estado;
      if (estado === 'confirmado' || estado === 'asistio') confirmed += 1;
      else notConfirmed += 1;
    }
    return { confirmed, notConfirmed };
  }, [trainings.data, myGroup]);

  const toggleFeatured = (id: string) => {
    setFeaturedIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev;
      if (user?.id && next !== prev) setFeatured.mutate(next);
      return next;
    });
  };

  const featuredResults: FichaResult[] = featuredIds
    .map((id) => results.find((r) => r.id === id))
    .filter((r): r is FichaResult => !!r);

  if (ficha.isLoading || trainings.isLoading) {
    return (
      <ScreenLayout title="Inicio">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Inicio">
      <View>
        <Text style={styles.greeting}>Hola, {user?.nombre?.split(' ')[0] ?? ''}</Text>
        <Text style={styles.dateLine}>{ficha.data?.categoria?.label ?? '—'} · ¡A romper marcas!</Text>
      </View>

      {nextSession ? (
        <Pressable onPress={() => navigation.navigate('SessionDetail', { trainingId: nextSession.id })}>
          <LinearGradient
            colors={[colors.navy, colors.navySecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextCard}
          >
            <Text style={styles.nextLabel}>TU PRÓXIMO ENTRENAMIENTO</Text>
            <Text style={styles.nextTitle}>{nextSession.foco ?? 'Entrenamiento'}</Text>
            <Text style={styles.nextMeta}>
              {shortDate(nextSession.fecha)}
              {nextSession.fecha === today ? ' · Hoy' : ''} {nextSession.hora ?? ''} · {nextSession.distancia_total ?? 0} m
            </Text>
            <View style={styles.nextBtn}>
              <Text style={styles.nextBtnLabel}>Ver y confirmar asistencia →</Text>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <EmptyState message="No tienes próximos entrenamientos asignados." />
      )}

      <View style={styles.kpiRow}>
        <KpiTile value={ficha.data?.attendancePct != null ? `${ficha.data.attendancePct}%` : '—'} label="Asistencia" color={colors.green} />
        <KpiTile value={String(pbCount)} label="PBs del ciclo" color={colors.red} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>PRÓXIMO TORNEO</Text>
        {nextTournament ? (
          <>
            <Text style={styles.tournamentName}>{nextTournament.nombre}</Text>
            <Text style={styles.tournamentMeta}>
              {nextTournament.fecha ? shortDate(nextTournament.fecha) : '—'} · {nextTournament.lugar ?? '—'}
            </Text>
          </>
        ) : (
          <Text style={styles.tournamentMeta}>No hay torneos programados por ahora.</Text>
        )}
      </Card>

      <Pressable onPress={() => navigation.navigate('Sesiones')}>
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>MIS CONFIRMACIONES</Text>
            <Text style={styles.cardLink}>Ver sesiones ›</Text>
          </View>
          {myConfirmations.confirmed + myConfirmations.notConfirmed > 0 ? (
            <BarChart
              data={[
                { label: 'Confirmadas', value: myConfirmations.confirmed, color: colors.green },
                { label: 'No confirmadas', value: myConfirmations.notConfirmed, color: colors.red },
              ]}
            />
          ) : (
            <EmptyState message="Aún no tienes entrenamientos asignados." />
          )}
        </Card>
      </Pressable>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.cardTitle}>MIS MEJORES MARCAS</Text>
        <Pressable
          style={[styles.editBtn, { backgroundColor: editingFeatured ? colors.navy : colors.chipInfoBg }]}
          onPress={() => setEditingFeatured((v) => !v)}
        >
          <Text style={[styles.editBtnLabel, { color: editingFeatured ? colors.white : colors.chipInfoText }]}>
            {editingFeatured ? 'Listo' : 'Editar'}
          </Text>
        </Pressable>
      </View>

      {editingFeatured ? (
        <Card>
          <Text style={styles.editHint}>Elige hasta 3 marcas para mostrar como motivación</Text>
          {results.length === 0 ? (
            <EmptyState message="Aún no tienes marcas registradas." />
          ) : (
            results.map((r) => {
              const checked = featuredIds.includes(r.id);
              return (
                <Pressable key={r.id} style={[styles.choiceRow, checked && styles.choiceRowActive]} onPress={() => toggleFeatured(r.id)}>
                  <View style={[styles.checkbox, checked && styles.checkboxActive]}>{checked ? <Text style={styles.checkboxMark}>✓</Text> : null}</View>
                  <Text style={styles.choiceEvent}>{r.prueba}</Text>
                  <Text style={styles.choiceTime}>{r.tiempo}</Text>
                </Pressable>
              );
            })
          )}
          <Text style={styles.editCount}>{featuredIds.length} de 3 seleccionadas</Text>
        </Card>
      ) : null}

      {featuredResults.length > 0 ? (
        <View style={styles.featuredGrid}>
          {featuredResults.map((r, i) => (
            <Pressable key={r.id} style={styles.featuredCardWrap} onPress={() => navigation.navigate('MarkDetail', { prueba: r.prueba })}>
              <LinearGradient
                colors={FEATURED_GRADIENTS[i % FEATURED_GRADIENTS.length]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featuredCard}
              >
                <Text style={styles.featuredIcon}>🏅</Text>
                <Text style={styles.featuredTime}>{r.tiempo}</Text>
                <Text style={styles.featuredEvent}>{r.prueba}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState message="Toca «Editar» para destacar tus mejores marcas aquí." />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.oswaldSemiBold, fontSize: 26, color: colors.navy },
  dateLine: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  nextCard: { borderRadius: radii.card, padding: 18, ...shadows.cta },
  nextLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.white, letterSpacing: 1.5, opacity: 0.85 },
  nextTitle: { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.white, marginTop: 6 },
  nextMeta: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.white, opacity: 0.9, marginTop: 2 },
  nextBtn: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14 },
  nextBtnLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.white },
  kpiRow: { flexDirection: 'row', gap: 10 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  cardLink: { fontFamily: fonts.oswaldSemiBold, fontSize: 12, color: colors.blueAccent },
  tournamentName: { fontFamily: fonts.barlowBold, fontSize: 15, color: colors.navy, marginTop: 6 },
  tournamentMeta: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { borderRadius: 9, paddingVertical: 7, paddingHorizontal: 13 },
  editBtnLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 12, letterSpacing: 0.5 },
  editHint: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginBottom: 10 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 11, marginBottom: 8 },
  choiceRowActive: { borderColor: colors.navy, backgroundColor: colors.chipInfoBg },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  checkboxMark: { color: colors.white, fontSize: 12, fontFamily: fonts.barlowBold },
  choiceEvent: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
  choiceTime: { fontFamily: fonts.oswaldBold, fontSize: 15, color: colors.navy },
  editCount: { fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.textTertiary },
  featuredGrid: { flexDirection: 'row', gap: 10 },
  featuredCardWrap: { flex: 1 },
  featuredCard: { borderRadius: radii.cardSm, padding: 14 },
  featuredIcon: { fontSize: 16 },
  featuredTime: { fontFamily: fonts.oswaldBold, fontSize: 19, color: colors.white, marginTop: 10 },
  featuredEvent: { fontFamily: fonts.barlowRegular, fontSize: 10.5, color: colors.white, opacity: 0.9, marginTop: 4 },
});
