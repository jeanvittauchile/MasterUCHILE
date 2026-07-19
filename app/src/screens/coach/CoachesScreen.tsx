import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import { RutInput } from '../../components/forms/RutInput';
import { useCoaches, useCreateCoach, useRestoreCoachPin } from '../../api/hooks/useCoaches';
import { colors, fonts, radii } from '../../theme/tokens';

export function CoachesScreen() {
  const coaches = useCoaches();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addNombre, setAddNombre] = useState('');
  const [addRut, setAddRut] = useState('');
  const createCoach = useCreateCoach();

  const restorePin = useRestoreCoachPin();
  const [activeCoachId, setActiveCoachId] = useState<string | null>(null);
  const [restoredPins, setRestoredPins] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!addNombre.trim() || !addRut.trim()) return;
    createCoach.mutate({ nombre: addNombre.trim(), rut: addRut.trim() }, { onSuccess: () => setAddNombre('') });
  };

  const handleRestore = (coachId: string) => {
    setActiveCoachId(coachId);
    restorePin.mutate(coachId, {
      onSuccess: (data) => setRestoredPins((prev) => ({ ...prev, [coachId]: data.pin })),
    });
  };

  const list = coaches.data?.coaches ?? [];

  return (
    <ScreenLayout title="Entrenadores">
      <Text style={styles.help}>
        Aquí puedes dar de alta a otro entrenador y, si alguien olvida su PIN, generarle uno nuevo temporal.
      </Text>

      <View style={styles.headerRow}>
        <Text style={styles.countText}>{list.length} entrenadores</Text>
        <Pressable onPress={() => setShowAddForm((v) => !v)}>
          <Text style={styles.addLink}>+ AGREGAR</Text>
        </Pressable>
      </View>

      {showAddForm ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Agregar entrenador</Text>
          <FormField label="Nombre completo" value={addNombre} onChangeText={setAddNombre} placeholder="Nombre y apellido" />
          <RutInput value={addRut} onChangeText={setAddRut} />
          <PrimaryButton label="GUARDAR ENTRENADOR" variant="danger" onPress={handleAdd} loading={createCoach.isPending} />
          {createCoach.data ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>✓ ENTRENADOR CREADO · PIN GENERADO</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultName}>{createCoach.data.nombre}</Text>
                <Text style={styles.resultPin}>{createCoach.data.pin}</Text>
              </View>
              <Text style={styles.resultNote}>PIN temporal: compártelo y deberá cambiarlo en su primer ingreso.</Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      {coaches.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : list.length === 0 ? (
        <EmptyState message="No hay entrenadores registrados." />
      ) : (
        list.map((c) => (
          <Card key={c.id} style={{ gap: 12 }}>
            <View style={styles.row}>
              <Avatar name={c.nombre} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowName}>{c.nombre}</Text>
                <Text style={styles.rowRut}>{c.rut}</Text>
              </View>
            </View>
            <PrimaryButton
              label="RESTAURAR PIN"
              variant="outline"
              loading={restorePin.isPending && activeCoachId === c.id}
              onPress={() => handleRestore(c.id)}
            />
            {restoredPins[c.id] ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>✓ PIN TEMPORAL GENERADO</Text>
                <Text style={styles.resultPin}>{restoredPins[c.id]}</Text>
                <Text style={styles.resultNote}>
                  Deberá cambiarlo en su próximo ingreso. No volverá a mostrarse.
                </Text>
              </View>
            ) : null}
          </Card>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  help: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary },
  addLink: { fontFamily: fonts.oswaldSemiBold, fontSize: 13, color: colors.blueAccent },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  rowName: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy },
  rowRut: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary },
  resultBox: { backgroundColor: '#EAF6EF', borderWidth: 1, borderColor: '#BFE6CF', borderRadius: radii.cardSm, padding: 12 },
  resultTitle: { fontFamily: fonts.barlowBold, fontSize: 12, color: colors.green, letterSpacing: 0.5, marginBottom: 8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  resultName: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.navy },
  resultPin: { fontFamily: fonts.oswaldBold, fontSize: 15, color: colors.red, letterSpacing: 2 },
  resultNote: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary, marginTop: 8 },
});
