import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TrainingGroup } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import { MonthCalendar, type DaySessionMarks } from '../../components/forms/MonthCalendar';
import { useCreateTraining, useTrainings } from '../../api/hooks/useTrainings';
import { todayIso } from '../../lib/date';
import { colors, fonts, groupTone, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const MONTH_NAMES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

const GROUP_OPTIONS: TrainingGroup[] = ['AM', 'PM', 'Ambos'];

const pad2 = (n: number) => String(n).padStart(2, '0');

export function SessionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [cal, setCal] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso());

  const from = `${cal.year}-${pad2(cal.month + 1)}-01`;
  const lastDay = new Date(cal.year, cal.month + 1, 0).getDate();
  const to = `${cal.year}-${pad2(cal.month + 1)}-${pad2(lastDay)}`;
  const trainings = useTrainings({ from, to });

  const marksByDate = useMemo(() => {
    const marks: Record<string, DaySessionMarks> = {};
    for (const t of trainings.data?.trainings ?? []) {
      const m = marks[t.fecha] ?? {};
      if (t.grupo === 'AM' || t.grupo === 'Ambos') m.am = true;
      if (t.grupo === 'PM' || t.grupo === 'Ambos') m.pm = true;
      marks[t.fecha] = m;
    }
    return marks;
  }, [trainings.data]);

  const sessionsOfSelectedDay = (trainings.data?.trainings ?? [])
    .filter((t) => t.fecha === selectedDate)
    .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));

  const [showForm, setShowForm] = useState(false);
  const [fecha, setFecha] = useState(todayIso());
  const [distancia, setDistancia] = useState('');
  const [foco, setFoco] = useState('');
  const [grupo, setGrupo] = useState<TrainingGroup>('AM');
  const [body, setBody] = useState('');
  const createTraining = useCreateTraining();

  const handleCreate = () => {
    const sets = body
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!fecha.trim() || !foco.trim() || sets.length === 0) return;
    createTraining.mutate(
      { fecha: fecha.trim(), foco: foco.trim(), distancia_total: Number(distancia) || 0, grupo, sets },
      {
        onSuccess: () => {
          setShowForm(false);
          setDistancia('');
          setFoco('');
          setBody('');
          setSelectedDate(fecha.trim());
        },
      },
    );
  };

  return (
    <ScreenLayout title="Sesiones">
      <PrimaryButton label={showForm ? 'CERRAR FORMULARIO' : '+ NUEVA SESIÓN'} onPress={() => setShowForm((v) => !v)} />

      {showForm ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Escribir entrenamiento completo</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormField label="Día (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} placeholder="2026-07-17" />
            <FormField label="Distancia (m)" value={distancia} onChangeText={setDistancia} placeholder="3200" inputMode="numeric" />
          </View>
          <FormField label="Enfoque" value={foco} onChangeText={setFoco} placeholder="Velocidad · Sprint" />
          <View>
            <Text style={styles.fieldLabel}>Grupo</Text>
            <View style={styles.groupRow}>
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
              placeholder={'600 m calentamiento progresivo\n12 × 25 m máx r/45"\n6 × 50 m fuerte r/1:00\n300 m vuelta a la calma'}
              placeholderTextColor={colors.textTertiary}
              style={styles.textarea}
            />
          </View>
          <PrimaryButton
            label="GUARDAR ENTRENAMIENTO"
            variant="danger"
            loading={createTraining.isPending}
            onPress={handleCreate}
          />
        </Card>
      ) : null}

      <Card>
        <View style={styles.calHeader}>
          <View style={styles.calNav}>
            <Pressable onPress={() => setCal((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}>
              <Text style={styles.calArrow}>‹</Text>
            </Pressable>
            <Text style={styles.calMonth}>
              {MONTH_NAMES[cal.month]} {cal.year}
            </Text>
            <Pressable onPress={() => setCal((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}>
              <Text style={styles.calArrow}>›</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
              <Text style={styles.legendText}>AM</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.navy }]} />
              <Text style={styles.legendText}>PM</Text>
            </View>
          </View>
        </View>
        {trainings.isLoading ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <MonthCalendar
            year={cal.year}
            month={cal.month}
            marksByDate={marksByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
      </Card>

      <Text style={styles.sectionTitle}>{selectedDate ? `Sesiones del ${selectedDate}` : 'Sesiones'}</Text>
      {sessionsOfSelectedDay.length === 0 ? (
        <EmptyState message="No hay sesiones este día. Toca «+ Nueva sesión» para programar una." />
      ) : (
        sessionsOfSelectedDay.map((s) => (
          <Pressable key={s.id} style={styles.sessionRow} onPress={() => navigation.navigate('SessionDetail', { trainingId: s.id })}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.sessionTitle}>{s.foco ?? 'Sesión'}</Text>
              <Text style={styles.sessionMeta}>
                {s.fecha} {s.hora ?? ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Pill label={`${s.distancia_total ?? 0} m`} bg={colors.chipInfoBg} textColor={colors.chipInfoText} />
                <Pill label={s.grupo} tone={groupTone[s.grupo]} />
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy },
  fieldLabel: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  groupRow: { flexDirection: 'row', gap: 8 },
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
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  calArrow: { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.navy, paddingHorizontal: 4 },
  calMonth: { fontFamily: fonts.oswaldBold, fontSize: 17, color: colors.navy, letterSpacing: 0.5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  sessionRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sessionTitle: { fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy },
  sessionMeta: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.textTertiary, fontSize: 22 },
});
