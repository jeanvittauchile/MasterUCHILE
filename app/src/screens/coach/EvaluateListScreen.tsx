import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSwimmers } from '../../api/hooks/useSwimmers';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function EvaluateListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const swimmers = useSwimmers();
  const list = swimmers.data?.swimmers ?? [];

  return (
    <ScreenLayout title="Evaluar">
      <Text style={styles.sectionTitle}>EVALUACIONES TÉCNICAS</Text>
      <Text style={styles.sectionHelp}>Toca un nadador para ver o registrar su evaluación</Text>

      {swimmers.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : list.length === 0 ? (
        <EmptyState message="Aún no hay nadadores registrados." />
      ) : (
        list.map((s) => (
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
});
