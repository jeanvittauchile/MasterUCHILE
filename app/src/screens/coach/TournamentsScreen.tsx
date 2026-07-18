import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import { useCreateTournament, useTournaments } from '../../api/hooks/useTournaments';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

function statusTone(estado: string): string {
  return estado.toLowerCase().includes('final') ? colors.textTertiary : colors.red;
}

export function TournamentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tournaments = useTournaments();
  const createTournament = useCreateTournament();

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');

  const handleCreate = () => {
    if (!nombre.trim() || !fecha.trim() || !lugar.trim()) return;
    createTournament.mutate(
      { nombre: nombre.trim(), fecha: fecha.trim(), lugar: lugar.trim() },
      {
        onSuccess: () => {
          setShowForm(false);
          setNombre('');
          setFecha('');
          setLugar('');
        },
      },
    );
  };

  const list = tournaments.data?.tournaments ?? [];

  return (
    <ScreenLayout title="Torneos">
      <PrimaryButton label={showForm ? 'CERRAR FORMULARIO' : '+ AGREGAR TORNEO'} onPress={() => setShowForm((v) => !v)} />

      {showForm ? (
        <Card style={{ gap: 12 }}>
          <FormField label="Nombre del torneo" value={nombre} onChangeText={setNombre} placeholder="Copa Máster UChile" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormField label="Fecha" value={fecha} onChangeText={setFecha} placeholder="02 AGO" />
            <FormField label="Lugar" value={lugar} onChangeText={setLugar} placeholder="Piscina UChile" />
          </View>
          <PrimaryButton label="GUARDAR TORNEO" variant="danger" loading={createTournament.isPending} onPress={handleCreate} />
        </Card>
      ) : null}

      {tournaments.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : list.length === 0 ? (
        <EmptyState message="Aún no hay torneos agregados." />
      ) : (
        list.map((t) => (
          <Pressable key={t.id} style={styles.card} onPress={() => navigation.navigate('TournamentDetail', { tournamentId: t.id })}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{t.fecha ?? '—'}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>{t.nombre}</Text>
              <Text style={styles.place}>{t.lugar ?? '—'}</Text>
              <View style={{ marginTop: 9 }}>
                <Pill label={t.estado.toUpperCase()} tone={statusTone(t.estado)} />
              </View>
            </View>
          </Pressable>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  dateBox: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: radii.input,
    paddingVertical: 10,
  },
  dateText: { fontFamily: fonts.oswaldBold, fontSize: 13, color: colors.white, textAlign: 'center' },
  name: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy, lineHeight: 19 },
  place: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 3 },
});
