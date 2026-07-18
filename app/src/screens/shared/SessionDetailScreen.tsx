import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useConfirmAttendance, useMarkAttendance, useTrainingDetail } from '../../api/hooks/useTrainings';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function SessionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SessionDetail'>>();
  const { trainingId } = route.params;
  const user = useAuthStore((s) => s.user);
  const training = useTrainingDetail(trainingId);
  const confirmAttendance = useConfirmAttendance(trainingId);
  const markAttendance = useMarkAttendance(trainingId);

  if (training.isLoading || !training.data) {
    return (
      <ScreenLayout title="Sesión">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const selS = training.data;

  return (
    <ScreenLayout title="Sesión">
      <View style={styles.headerCard}>
        <Text style={styles.headerDate}>
          {selS.fecha} {selS.hora ?? ''}
        </Text>
        <Text style={styles.headerTitle}>{selS.foco ?? 'Sesión'}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>{selS.distancia_total ?? 0} m</Text>
          </View>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>Grupo {selS.grupo}</Text>
          </View>
        </View>
      </View>

      {user?.rol === 'swimmer' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="✓ CONFIRMAR"
              variant="primary"
              loading={confirmAttendance.isPending}
              onPress={() => confirmAttendance.mutate('confirmado')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="✕ NO PUEDO"
              variant="outline"
              loading={confirmAttendance.isPending}
              onPress={() => confirmAttendance.mutate('declinado')}
            />
          </View>
        </View>
      ) : null}

      {user?.rol === 'coach' ? (
        <Card>
          <Text style={styles.cardTitle}>ASISTENCIA</Text>
          {!selS.attendance || selS.attendance.length === 0 ? (
            <EmptyState message="Aún no hay confirmaciones registradas para esta sesión." />
          ) : (
            selS.attendance.map((a) => (
              <View key={a.swimmer_id} style={styles.attendanceRow}>
                <Text style={styles.attendanceName}>{a.users?.nombre ?? '—'}</Text>
                <Pill
                  label={a.estado}
                  bg={
                    a.estado === 'confirmado' || a.estado === 'asistio'
                      ? colors.green
                      : a.estado === 'declinado' || a.estado === 'falto'
                        ? colors.red
                        : colors.textTertiary
                  }
                />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable
                    style={styles.miniBtn}
                    onPress={() => markAttendance.mutate({ swimmerId: a.swimmer_id, estado: 'asistio' })}
                  >
                    <Text style={styles.miniBtnText}>Asistió</Text>
                  </Pressable>
                  <Pressable
                    style={styles.miniBtn}
                    onPress={() => markAttendance.mutate({ swimmerId: a.swimmer_id, estado: 'falto' })}
                  >
                    <Text style={styles.miniBtnText}>Faltó</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>SET PRINCIPAL</Text>
        {selS.sets.length === 0 ? (
          <EmptyState message="Esta sesión no tiene series registradas." />
        ) : (
          selS.sets.map((text, i) => (
            <View key={i} style={styles.setRow}>
              <View style={styles.setIndex}>
                <Text style={styles.setIndexText}>{i + 1}</Text>
              </View>
              <Text style={styles.setText}>{text}</Text>
            </View>
          ))
        )}
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCard: { backgroundColor: colors.navy, borderRadius: radii.card, padding: 20, gap: 6 },
  headerDate: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.white, opacity: 0.8, letterSpacing: 1.5 },
  headerTitle: { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.white },
  headerTag: { backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 5, paddingHorizontal: 11, borderRadius: 9 },
  headerTagText: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.white },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 16, color: colors.navy, letterSpacing: 0.5, marginBottom: 12 },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  attendanceName: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
  miniBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
  miniBtnText: { fontFamily: fonts.barlowSemiBold, fontSize: 11, color: colors.textSecondary },
  setRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  setIndex: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.chipInfoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setIndexText: { fontFamily: fonts.barlowBold, fontSize: 12, color: colors.chipInfoText },
  setText: { flex: 1, fontFamily: fonts.barlowRegular, fontSize: 14, color: '#334', lineHeight: 19 },
});
