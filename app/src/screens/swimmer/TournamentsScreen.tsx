import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTournaments, useToggleMyParticipation, type Tournament } from '../../api/hooks/useTournaments';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Agenda de torneos del equipo, con marcado rápido de participación del propio nadador. */
export function TournamentsScreen() {
  const tournaments = useTournaments();

  if (tournaments.isLoading) {
    return (
      <ScreenLayout title="Torneos">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const list = tournaments.data?.tournaments ?? [];

  return (
    <ScreenLayout title="Torneos">
      <Text style={styles.sectionTitle}>MIS TORNEOS</Text>
      {list.length === 0 ? <EmptyState message="No hay torneos programados por ahora." /> : list.map((t) => <TournamentRow key={t.id} tournament={t} />)}
    </ScreenLayout>
  );
}

function TournamentRow({ tournament }: { tournament: Tournament }) {
  const toggle = useToggleMyParticipation(tournament.id);
  const [attending, setAttending] = useState(false);

  const onToggle = () => {
    const next = !attending;
    setAttending(next);
    toggle.mutate(next ? 'participo' : 'inscrito');
  };

  const d = tournament.fecha ? parseIsoDate(tournament.fecha) : null;

  return (
    <View style={styles.row}>
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{d ? String(d.getDate()).padStart(2, '0') : '--'}</Text>
        <Text style={styles.dateMonth}>{d ? MONTHS[d.getMonth()] : ''}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{tournament.nombre}</Text>
        <Text style={styles.rowMeta}>{tournament.lugar ?? '—'}</Text>
        <Pressable
          style={[styles.attendBtn, { backgroundColor: attending ? colors.green : colors.chipInfoBg }]}
          onPress={onToggle}
          disabled={toggle.isPending}
        >
          <Text style={[styles.attendBtnLabel, { color: attending ? colors.white : colors.chipInfoText }]}>
            {attending ? '✓ Participando' : 'Marcar participación'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radii.card, padding: 16, ...shadows.card },
  dateBox: { width: 58, alignItems: 'center', backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 10 },
  dateDay: { fontFamily: fonts.oswaldBold, fontSize: 22, color: colors.white, lineHeight: 24 },
  dateMonth: { fontFamily: fonts.barlowSemiBold, fontSize: 11, color: colors.white, opacity: 0.85, letterSpacing: 1, marginTop: 2 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy, lineHeight: 19 },
  rowMeta: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 3 },
  attendBtn: { marginTop: 9, alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  attendBtnLabel: { fontFamily: fonts.barlowBold, fontSize: 11.5 },
});
