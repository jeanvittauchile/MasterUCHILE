import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import {
  useCreateTournament,
  useDeleteTournament,
  useImportTournaments,
  useTournaments,
  useUpdateTournament,
  type Tournament,
} from '../../api/hooks/useTournaments';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "28 MAR" o, si hay fecha_fin distinta, "24–26 JUL". */
function dateLabel(t: Tournament): string {
  if (!t.fecha) return '—';
  const start = parseIsoDate(t.fecha);
  const startLabel = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
  if (!t.fecha_fin || t.fecha_fin === t.fecha) return startLabel;
  const end = parseIsoDate(t.fecha_fin);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]}`
    : `${startLabel} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

function statusTone(estado: string): string {
  return estado.toLowerCase().includes('final') ? colors.textTertiary : colors.red;
}

interface FormState {
  nombre: string;
  fecha: string;
  fechaFin: string;
  lugar: string;
  prioritario: boolean;
}

const EMPTY_FORM: FormState = { nombre: '', fecha: '', fechaFin: '', lugar: '', prioritario: false };

export function TournamentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tournaments = useTournaments();
  const createTournament = useCreateTournament();
  const deleteTournament = useDeleteTournament();

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const importTournaments = useImportTournaments();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const updateTournament = useUpdateTournament(editingId ?? '');

  const handleImport = () => {
    if (!importText.trim()) return;
    importTournaments.mutate(importText);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (t: Tournament) => {
    setEditingId(t.id);
    setForm({
      nombre: t.nombre,
      fecha: t.fecha ?? '',
      fechaFin: t.fecha_fin ?? '',
      lugar: t.lugar ?? '',
      prioritario: t.prioritario,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim() || !form.fecha.trim()) return;
    const payload = {
      nombre: form.nombre.trim(),
      fecha: form.fecha.trim(),
      fechaFin: form.fechaFin.trim() || undefined,
      lugar: form.lugar.trim() || undefined,
      prioritario: form.prioritario,
    };
    const onSuccess = () => {
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    };
    if (editingId) {
      updateTournament.mutate({ ...payload, fechaFin: payload.fechaFin ?? null, lugar: payload.lugar ?? null }, { onSuccess });
    } else {
      createTournament.mutate(payload, { onSuccess });
    }
  };

  const list = tournaments.data?.tournaments ?? [];
  const saving = editingId ? updateTournament.isPending : createTournament.isPending;

  return (
    <ScreenLayout title="Torneos">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton label={showForm ? 'CERRAR' : '+ AGREGAR TORNEO'} onPress={() => (showForm ? setShowForm(false) : openCreateForm())} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={showImport ? 'OCULTAR' : '⇪ IMPORTAR CALENDARIO'}
            variant="secondary"
            onPress={() => setShowImport((v) => !v)}
          />
        </View>
      </View>

      {showImport ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Importar calendario de torneos</Text>
          <Text style={styles.cardHelp}>
            Pega una línea por torneo: <Text style={{ fontFamily: fonts.barlowSemiBold }}>DD [de] Mes[-DD] [AAAA]: Nombre</Text>{' '}
            — agrega <Text style={{ fontFamily: fonts.barlowSemiBold }}>(Prioritario)</Text> al final del nombre para
            marcarlo. Ej: "24-26 Julio: Nacional Máster Invierno FECHIDA (Prioritario)".
          </Text>
          <TextInput
            value={importText}
            onChangeText={setImportText}
            multiline
            numberOfLines={6}
            placeholder={'28 de Marzo : XXII COPPA ITALIA MASTER\n16 mayo : XIII PEÑALOLEN MASTER (Prioritario)'}
            placeholderTextColor={colors.textTertiary}
            style={styles.textarea}
          />
          <PrimaryButton label="IMPORTAR TORNEOS" variant="danger" onPress={handleImport} loading={importTournaments.isPending} />
          {importTournaments.data ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>✓ {importTournaments.data.count} TORNEOS IMPORTADOS</Text>
              {importTournaments.data.imported.map((t, i) => (
                <Text key={i} style={styles.resultRowText}>
                  {t.nombre} {t.prioritario ? '★' : ''}
                </Text>
              ))}
              {importTournaments.data.rejected.length > 0 ? (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {importTournaments.data.rejected.map((r, i) => (
                    <Text key={i} style={styles.rejectedText}>
                      ✕ {r.line} — {r.reason}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </Card>
      ) : null}

      {showForm ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>{editingId ? 'Editar torneo' : 'Nuevo torneo'}</Text>
          <FormField label="Nombre del torneo" value={form.nombre} onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))} placeholder="Copa Máster UChile" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormField
              label="Fecha inicio (AAAA-MM-DD)"
              value={form.fecha}
              onChangeText={(v) => setForm((f) => ({ ...f, fecha: v }))}
              placeholder="2026-08-28"
            />
            <FormField
              label="Fecha término (opcional)"
              value={form.fechaFin}
              onChangeText={(v) => setForm((f) => ({ ...f, fechaFin: v }))}
              placeholder="2026-08-30"
            />
          </View>
          <FormField label="Lugar (opcional)" value={form.lugar} onChangeText={(v) => setForm((f) => ({ ...f, lugar: v }))} placeholder="Piscina UChile" />
          <Pressable style={styles.priorityRow} onPress={() => setForm((f) => ({ ...f, prioritario: !f.prioritario }))}>
            <View style={[styles.checkbox, form.prioritario && styles.checkboxActive]}>{form.prioritario ? <Text style={styles.checkboxMark}>✓</Text> : null}</View>
            <Text style={styles.priorityLabel}>Marcar como prioritario</Text>
          </Pressable>
          <PrimaryButton label={editingId ? 'GUARDAR CAMBIOS' : 'GUARDAR TORNEO'} variant="danger" loading={saving} onPress={handleSave} />
        </Card>
      ) : null}

      {tournaments.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : list.length === 0 ? (
        <EmptyState message="Aún no hay torneos agregados." />
      ) : (
        list.map((t) => (
          <View key={t.id} style={styles.card}>
            <Pressable style={styles.cardMain} onPress={() => navigation.navigate('TournamentDetail', { tournamentId: t.id })}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{dateLabel(t)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {t.prioritario ? <Text style={styles.star}>★</Text> : null}
                  <Text style={styles.name} numberOfLines={2}>
                    {t.nombre}
                  </Text>
                </View>
                <Text style={styles.place}>{t.lugar ?? '—'}</Text>
                <View style={{ marginTop: 9 }}>
                  <Pill label={t.estado.toUpperCase()} tone={statusTone(t.estado)} />
                </View>
              </View>
            </Pressable>
            <View style={styles.rowActions}>
              <Pressable style={styles.miniBtn} onPress={() => openEditForm(t)}>
                <Text style={styles.miniBtnText}>✎</Text>
              </Pressable>
              <Pressable style={styles.miniBtnDanger} onPress={() => deleteTournament.mutate(t.id)}>
                <Text style={styles.miniBtnDangerText}>×</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy },
  cardHelp: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 },
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
  resultBox: { backgroundColor: '#EAF6EF', borderWidth: 1, borderColor: '#BFE6CF', borderRadius: radii.cardSm, padding: 12 },
  resultTitle: { fontFamily: fonts.barlowBold, fontSize: 12, color: colors.green, letterSpacing: 0.5, marginBottom: 8 },
  resultRowText: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.navy, paddingVertical: 3 },
  rejectedText: { fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.red },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  checkboxMark: { color: colors.white, fontSize: 13, fontFamily: fonts.barlowBold },
  priorityLabel: { fontFamily: fonts.barlowSemiBold, fontSize: 14, color: colors.navy },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardMain: { flex: 1, padding: 16, flexDirection: 'row', gap: 14 },
  dateBox: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: radii.input,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dateText: { fontFamily: fonts.oswaldBold, fontSize: 12, color: colors.white, textAlign: 'center' },
  star: { color: colors.red, fontSize: 13 },
  name: { flex: 1, fontFamily: fonts.barlowBold, fontSize: 15.5, color: colors.navy, lineHeight: 19 },
  place: { fontFamily: fonts.barlowRegular, fontSize: 12.5, color: colors.textSecondary, marginTop: 3 },
  rowActions: { justifyContent: 'center', gap: 6, paddingRight: 12 },
  miniBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.chipInfoBg, alignItems: 'center', justifyContent: 'center' },
  miniBtnText: { color: colors.chipInfoText, fontSize: 14 },
  miniBtnDanger: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#f7eaea', alignItems: 'center', justifyContent: 'center' },
  miniBtnDangerText: { color: colors.red, fontSize: 16, fontFamily: fonts.barlowBold },
});
