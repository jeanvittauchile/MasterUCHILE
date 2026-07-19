import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import { useAddEntry, useTournamentDetail, useToggleMyParticipation } from '../../api/hooks/useTournaments';
import { useSwimmers } from '../../api/hooks/useSwimmers';
import { tournamentPdfUrl } from '../../api/hooks/useReports';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function TournamentDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TournamentDetail'>>();
  const { tournamentId } = route.params;
  const user = useAuthStore((s) => s.user);
  const detail = useTournamentDetail(tournamentId);
  const swimmers = useSwimmers();
  const addEntry = useAddEntry(tournamentId);
  const toggleParticipation = useToggleMyParticipation(tournamentId);

  const [showInscForm, setShowInscForm] = useState(false);
  const [pickedSwimmer, setPickedSwimmer] = useState<{ id: string; nombre: string } | null>(null);
  const [pruebasText, setPruebasText] = useState('');

  if (detail.isLoading || !detail.data) {
    return (
      <ScreenLayout title="Torneo">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const selC = detail.data;
  const inscribedIds = new Set(selC.participants.map((p) => p.swimmerId));
  const candidates = (swimmers.data?.swimmers ?? []).filter((s) => !inscribedIds.has(s.id));

  const handleAddEntry = () => {
    if (!pickedSwimmer) return;
    const pruebas = pruebasText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (pruebas.length === 0) return;
    addEntry.mutate(
      { swimmerId: pickedSwimmer.id, pruebas },
      {
        onSuccess: () => {
          setPickedSwimmer(null);
          setPruebasText('');
          setShowInscForm(false);
        },
      },
    );
  };

  return (
    <ScreenLayout title={selC.nombre}>
      <View style={styles.headerCard}>
        <Text style={styles.headerMeta}>
          {selC.fecha ?? '—'}
          {selC.fecha_fin && selC.fecha_fin !== selC.fecha ? ` – ${selC.fecha_fin}` : ''}
          {selC.lugar ? ` · ${selC.lugar}` : ''}
        </Text>
        <Text style={styles.headerTitle}>
          {selC.prioritario ? '★ ' : ''}
          {selC.nombre}
        </Text>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>{selC.estado}</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiBox, { backgroundColor: colors.red }]}>
          <Text style={styles.kpiValue}>{selC.totalParticipants}</Text>
          <Text style={styles.kpiLabel}>Participantes inscritos</Text>
        </View>
        <View style={styles.kpiBoxWhite}>
          <Text style={styles.kpiValueDark}>{selC.totalEntries}</Text>
          <Text style={styles.kpiLabelDark}>Inscripciones a pruebas</Text>
        </View>
      </View>

      {user?.rol === 'coach' ? (
        <>
          <PrimaryButton
            label={showInscForm ? 'CERRAR FORMULARIO' : '+ INSCRIBIR NADADOR'}
            onPress={() => setShowInscForm((v) => !v)}
          />
          {showInscForm ? (
            <Card style={{ gap: 10 }}>
              <Text style={styles.cardHelp}>Toca un nadador para inscribirlo</Text>
              {candidates.length === 0 ? (
                <EmptyState message="Todos los nadadores ya están inscritos en este torneo." />
              ) : (
                candidates.map((s) => (
                  <Pressable
                    key={s.id}
                    style={[styles.candidateRow, pickedSwimmer?.id === s.id && styles.candidateRowActive]}
                    onPress={() => setPickedSwimmer({ id: s.id, nombre: s.nombre })}
                  >
                    <Avatar name={s.nombre} size={34} />
                    <Text style={styles.candidateName}>{s.nombre}</Text>
                    <Text style={styles.candidatePlus}>{pickedSwimmer?.id === s.id ? '✓' : '+'}</Text>
                  </Pressable>
                ))
              )}
              {pickedSwimmer ? (
                <View style={{ gap: 10 }}>
                  <FormField
                    label={`Pruebas de ${pickedSwimmer.nombre} (separadas por coma)`}
                    value={pruebasText}
                    onChangeText={setPruebasText}
                    placeholder="100 libre, 50 mariposa"
                  />
                  <PrimaryButton label="INSCRIBIR" variant="danger" loading={addEntry.isPending} onPress={handleAddEntry} />
                </View>
              ) : null}
            </Card>
          ) : null}
        </>
      ) : (
        <PrimaryButton
          label="MARCAR PARTICIPACIÓN"
          loading={toggleParticipation.isPending}
          onPress={() => toggleParticipation.mutate('participo')}
        />
      )}

      <Card>
        <Text style={styles.cardTitle}>LISTA DE PARTICIPANTES</Text>
        {selC.participants.length === 0 ? (
          <EmptyState message="Aún no hay nadadores inscritos en este torneo." />
        ) : (
          selC.participants.map((p) => (
            <View key={p.swimmerId} style={styles.participantRow}>
              <Avatar name={p.nombre} size={38} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.participantName}>{p.nombre}</Text>
                <Text style={styles.participantMeta}>
                  {p.categoria ?? '—'} · {p.pruebas.join(', ')}
                </Text>
              </View>
            </View>
          ))
        )}
        {user?.rol === 'coach' ? (
          <Pressable onPress={() => Linking.openURL(tournamentPdfUrl(tournamentId))}>
            <Text style={styles.exportLink}>EXPORTAR REPORTE (PDF) ↓</Text>
          </Pressable>
        ) : null}
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCard: { backgroundColor: colors.navy, borderRadius: radii.card, padding: 20, gap: 6 },
  headerMeta: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.white, opacity: 0.8, letterSpacing: 1.5 },
  headerTitle: { fontFamily: fonts.oswaldBold, fontSize: 23, color: colors.white },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 9,
  },
  headerTagText: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.white },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiBox: { flex: 1, borderRadius: 16, padding: 16 },
  kpiValue: { fontFamily: fonts.oswaldBold, fontSize: 32, color: colors.white, lineHeight: 34 },
  kpiLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.white, opacity: 0.9, marginTop: 4 },
  kpiBoxWhite: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  kpiValueDark: { fontFamily: fonts.oswaldBold, fontSize: 32, color: colors.navy, lineHeight: 34 },
  kpiLabelDark: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  cardHelp: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.textSecondary },
  candidateRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  candidateRowActive: { borderColor: colors.navy, backgroundColor: colors.chipInfoBg },
  candidateName: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
  candidatePlus: { fontFamily: fonts.barlowBold, fontSize: 20, color: colors.green },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5, marginBottom: 10 },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  participantName: { fontFamily: fonts.barlowSemiBold, fontSize: 14.5, color: colors.navy },
  participantMeta: { fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.textSecondary },
  exportLink: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.oswaldSemiBold,
    fontSize: 13,
    color: colors.blueAccent,
    letterSpacing: 0.5,
  },
});
