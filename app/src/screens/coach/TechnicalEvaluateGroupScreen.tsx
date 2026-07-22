import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  TECHNICAL_EVALUATION_CONFIG,
  isValidTimeInput,
  type TechnicalEvaluationStroke,
  type TurnCombination,
} from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StrokeOrComboPicker } from '../../components/forms/StrokeOrComboPicker';
import { TechnicalAttemptsEditor, newAttempt, type AttemptDraft } from '../../components/forms/TechnicalAttemptsEditor';
import { useSwimmers, type SwimmerListItem } from '../../api/hooks/useSwimmers';
import { useAddBulkTechnicalEvaluations } from '../../api/hooks/useTechnicalEvaluations';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function TechnicalEvaluateGroupScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TechnicalEvaluateGroup'>>();
  const { tipo } = route.params;
  const config = TECHNICAL_EVALUATION_CONFIG[tipo];

  const [estilo, setEstilo] = useState<TechnicalEvaluationStroke | undefined>(undefined);
  const [combinacion, setCombinacion] = useState<TurnCombination | undefined>(undefined);
  const hasStyleSelection = tipo === 'salida' ? !!estilo : !!combinacion;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  const swimmers = useSwimmers(search || undefined);
  const list = swimmers.data?.swimmers ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<Record<string, SwimmerListItem>>({});
  const [attemptsBySwimmer, setAttemptsBySwimmer] = useState<Record<string, AttemptDraft[]>>({});
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const toggleSwimmer = (swimmer: SwimmerListItem) => {
    setSavedCount(null);
    setSelectedIds((prev) => {
      if (prev.includes(swimmer.id)) return prev.filter((id) => id !== swimmer.id);
      return [...prev, swimmer.id];
    });
    setSelectedInfo((prev) => ({ ...prev, [swimmer.id]: swimmer }));
    setAttemptsBySwimmer((prev) => (prev[swimmer.id] ? prev : { ...prev, [swimmer.id]: [newAttempt(1)] }));
  };

  const addBulk = useAddBulkTechnicalEvaluations();

  const entries = selectedIds
    .map((swimmerId) => ({
      swimmerId,
      attempts: (attemptsBySwimmer[swimmerId] ?? []).filter((a) => isValidTimeInput(a.tiempo)),
    }))
    .filter((entry) => entry.attempts.length > 0);

  const canSave = hasStyleSelection && entries.length > 0;

  const handleSaveAll = () => {
    addBulk.mutate(
      {
        tipo,
        estilo: tipo === 'salida' ? estilo : undefined,
        combinacion: tipo === 'viraje' ? combinacion : undefined,
        entries: entries.map((entry) => ({
          swimmerId: entry.swimmerId,
          attempts: entry.attempts.map((a) => ({
            numeroIntento: a.numeroIntento,
            tiempo: a.tiempo,
            ...(config.metrics.includes('brazadas') ? { brazadas: a.brazadas } : {}),
            ...(config.metrics.includes('patadas') ? { patadas: a.patadas } : {}),
            ...(config.metrics.includes('subacuatico') ? { subacuatico: a.subacuatico } : {}),
          })),
        })),
      },
      {
        onSuccess: () => {
          setSavedCount(entries.length);
          setSelectedIds([]);
          setSelectedInfo({});
          setAttemptsBySwimmer({});
        },
      },
    );
  };

  return (
    <ScreenLayout title={`${config.label} · Simultánea`}>
      <Card style={{ gap: 14 }}>
        <Text style={styles.cardTitle}>1. ELEGIR {tipo === 'salida' ? 'ESTILO' : 'COMBINACIÓN'}</Text>
        <StrokeOrComboPicker
          tipo={tipo}
          estilo={estilo}
          combinacion={combinacion}
          onChangeEstilo={setEstilo}
          onChangeCombinacion={setCombinacion}
        />
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={styles.cardTitle}>2. SELECCIONAR NADADORES</Text>
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
          list.map((s) => {
            const checked = selectedIds.includes(s.id);
            return (
              <Pressable key={s.id} style={styles.row} onPress={() => toggleSwimmer(s)}>
                <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                  {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
                <Avatar name={s.nombre} size={38} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowName}>{s.nombre}</Text>
                  <Text style={styles.rowCat}>{s.categoria ?? '—'}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </Card>

      {selectedIds.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>3. REGISTRAR INTENTOS ({selectedIds.length} NADADORES)</Text>
          {selectedIds.map((swimmerId) => {
            const swimmer = selectedInfo[swimmerId];
            return (
              <Card key={swimmerId} style={{ gap: 12 }}>
                <View style={styles.swimmerHeader}>
                  <Avatar name={swimmer?.nombre ?? '—'} size={38} />
                  <Text style={styles.swimmerHeaderName}>{swimmer?.nombre ?? '—'}</Text>
                </View>
                <TechnicalAttemptsEditor
                  tipo={tipo}
                  attempts={attemptsBySwimmer[swimmerId] ?? [newAttempt(1)]}
                  onChange={(attempts) => setAttemptsBySwimmer((prev) => ({ ...prev, [swimmerId]: attempts }))}
                />
              </Card>
            );
          })}

          {savedCount != null ? (
            <Text style={styles.savedText}>✓ {savedCount} evaluaciones guardadas correctamente.</Text>
          ) : null}

          <PrimaryButton
            label="GUARDAR TODO"
            variant="danger"
            loading={addBulk.isPending}
            disabled={!canSave}
            onPress={handleSaveAll}
          />
        </>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  sectionTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
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
    backgroundColor: colors.background,
    borderRadius: radii.cardSm,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  checkboxMark: { color: colors.white, fontSize: 13, fontFamily: fonts.barlowBold },
  rowName: { fontFamily: fonts.barlowBold, fontSize: 14.5, color: colors.navy },
  rowCat: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary },
  swimmerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swimmerHeaderName: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy },
  savedText: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.green, textAlign: 'center' },
});
