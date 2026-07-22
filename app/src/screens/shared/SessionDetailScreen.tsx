import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TrainingGroup } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import {
  useConfirmAttendance,
  useDeleteTraining,
  useTrainingDetail,
  useUpdateTraining,
} from '../../api/hooks/useTrainings';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const GROUP_OPTIONS: TrainingGroup[] = ['AM', 'PM', 'Ambos'];

export function SessionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SessionDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { trainingId } = route.params;
  const user = useAuthStore((s) => s.user);
  const training = useTrainingDetail(trainingId);
  const confirmAttendance = useConfirmAttendance(trainingId);
  const updateTraining = useUpdateTraining(trainingId);
  const deleteTraining = useDeleteTraining();

  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fecha, setFecha] = useState('');
  const [distancia, setDistancia] = useState('');
  const [foco, setFoco] = useState('');
  const [grupo, setGrupo] = useState<TrainingGroup>('AM');
  const [body, setBody] = useState('');

  if (training.isLoading || !training.data) {
    return (
      <ScreenLayout title="Sesión">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const selS = training.data;

  const openEdit = () => {
    setFecha(selS.fecha);
    setDistancia(String(selS.distancia_total ?? ''));
    setFoco(selS.foco ?? '');
    setGrupo(selS.grupo);
    setBody(selS.sets.join('\n'));
    setShowEdit(true);
  };

  const handleUpdate = () => {
    const sets = body.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!fecha.trim() || !foco.trim() || sets.length === 0) return;
    updateTraining.mutate(
      { fecha: fecha.trim(), foco: foco.trim(), distancia_total: Number(distancia) || 0, grupo, sets },
      { onSuccess: () => setShowEdit(false) },
    );
  };

  const handleDelete = () => {
    deleteTraining.mutate(trainingId, { onSuccess: () => navigation.goBack() });
  };

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

      {user?.rol === 'coach' && !showEdit ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="EDITAR SESIÓN" variant="outline" onPress={openEdit} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="ELIMINAR SESIÓN" variant="outline" onPress={() => setConfirmDelete(true)} />
          </View>
        </View>
      ) : null}

      {confirmDelete ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>¿ELIMINAR ESTA SESIÓN?</Text>
          <Text style={styles.warnText}>
            Esta acción no se puede deshacer. Se borrará también el registro de asistencia asociado.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="CANCELAR" variant="outline" onPress={() => setConfirmDelete(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="SÍ, ELIMINAR"
                variant="danger"
                loading={deleteTraining.isPending}
                onPress={handleDelete}
              />
            </View>
          </View>
        </Card>
      ) : null}

      {showEdit ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>EDITAR SESIÓN</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormField label="Día (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} placeholder="2026-07-17" />
            <FormField label="Distancia (m)" value={distancia} onChangeText={setDistancia} placeholder="3200" inputMode="numeric" />
          </View>
          <FormField label="Enfoque" value={foco} onChangeText={setFoco} placeholder="Velocidad · Sprint" />
          <View>
            <Text style={styles.fieldLabel}>Grupo</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {GROUP_OPTIONS.map((g) => (
                <Chip key={g} label={g} active={grupo === g} onPress={() => setGrupo(g)} />
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>Plan de la sesión — una serie por línea</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={6}
              placeholderTextColor={colors.textTertiary}
              style={styles.textarea}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="CANCELAR" variant="outline" onPress={() => setShowEdit(false)} />
            </View>
            <View style={{ flex: 2 }}>
              <PrimaryButton
                label="GUARDAR CAMBIOS"
                variant="danger"
                loading={updateTraining.isPending}
                onPress={handleUpdate}
              />
            </View>
          </View>
        </Card>
      ) : null}

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
            selS.attendance.map((a) => {
              // La confirmación del nadador ES la asistencia: quien no confirma queda inasistente.
              const confirmed = a.estado === 'confirmado' || a.estado === 'asistio';
              return (
                <View key={a.swimmer_id} style={styles.attendanceRow}>
                  <Text style={styles.attendanceName}>{a.users?.nombre ?? '—'}</Text>
                  <Pill label={confirmed ? 'Confirmado' : 'Inasistente'} bg={confirmed ? colors.green : colors.red} />
                </View>
              );
            })
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
  warnText: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  fieldLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: 12,
    fontSize: 14,
    color: colors.navy,
    fontFamily: fonts.barlowRegular,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  attendanceName: { flex: 1, fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
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
