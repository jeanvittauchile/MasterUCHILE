import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TechnicalEvaluationType } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSwimmers } from '../../api/hooks/useSwimmers';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

type Modo = 'individual' | 'simultanea';

export function EvaluateListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [tipo, setTipo] = useState<TechnicalEvaluationType>('viraje');
  const [modo, setModo] = useState<Modo>('individual');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  const swimmers = useSwimmers(modo === 'individual' ? search || undefined : undefined);
  const list = swimmers.data?.swimmers ?? [];

  const qualitativeSwimmers = useSwimmers();
  const qualitativeList = qualitativeSwimmers.data?.swimmers ?? [];

  return (
    <ScreenLayout title="Evaluar">
      <Text style={styles.sectionTitle}>EVALUACIÓN TÉCNICA · VIRAJE Y SALIDA</Text>
      <Card style={{ gap: 14 }}>
        <View>
          <Text style={styles.fieldLabel}>Tipo</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="VIRAJE" variant={tipo === 'viraje' ? 'danger' : 'outline'} onPress={() => setTipo('viraje')} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="SALIDA" variant={tipo === 'salida' ? 'danger' : 'outline'} onPress={() => setTipo('salida')} />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Modo</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="INDIVIDUAL" variant={modo === 'individual' ? 'danger' : 'outline'} onPress={() => setModo('individual')} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="SIMULTÁNEA"
                variant={modo === 'simultanea' ? 'danger' : 'outline'}
                onPress={() => setModo('simultanea')}
              />
            </View>
          </View>
        </View>

        {modo === 'simultanea' ? (
          <PrimaryButton
            label="SELECCIONAR NADADORES"
            onPress={() => navigation.navigate('TechnicalEvaluateGroup', { tipo })}
          />
        ) : (
          <View style={{ gap: 10 }}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Buscar nadador…"
                placeholderTextColor={colors.textTertiary}
                style={styles.searchInput}
              />
            </View>
            {swimmers.isLoading ? (
              <ActivityIndicator color={colors.navy} />
            ) : list.length === 0 ? (
              <EmptyState message="No hay nadadores que coincidan con la búsqueda." />
            ) : (
              list.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.row}
                  onPress={() => navigation.navigate('TechnicalEvaluateDetail', { swimmerId: s.id, tipo })}
                >
                  <Avatar name={s.nombre} size={40} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.rowName}>{s.nombre}</Text>
                    <Text style={styles.rowCat}>{s.categoria ?? '—'}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </Card>

      <Text style={styles.sectionTitle}>EVALUACIONES CUALITATIVAS</Text>
      <Text style={styles.sectionHelp}>Toca un nadador para ver o registrar su evaluación 1-10</Text>

      {qualitativeSwimmers.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : qualitativeList.length === 0 ? (
        <EmptyState message="Aún no hay nadadores registrados." />
      ) : (
        qualitativeList.map((s) => (
          <Pressable key={s.id} style={styles.row} onPress={() => navigation.navigate('EvaluateDetail', { swimmerId: s.id })}>
            <Avatar name={s.nombre} size={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowName}>{s.nombre}</Text>
              <Text style={styles.rowCat}>{s.categoria ?? '—'}</Text>
            </View>
            <Text style={styles.link}>VER EVALUACIÓN ›</Text>
          </Pressable>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5 },
  sectionHelp: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary, marginTop: -12 },
  fieldLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.cardSm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchIcon: { color: colors.textTertiary },
  searchInput: { flex: 1, fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.textPrimary },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  rowName: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy },
  rowCat: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary },
  link: { fontFamily: fonts.oswaldSemiBold, fontSize: 12.5, color: colors.blueAccent },
  chevron: { color: colors.textTertiary, fontSize: 20 },
});
