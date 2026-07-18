import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormField } from '../../components/forms/FormField';
import { RutInput } from '../../components/forms/RutInput';
import { useCreateSwimmer, useImportSwimmers, useSwimmers } from '../../api/hooks/useSwimmers';
import { colors, fonts, radii } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function SwimmersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const swimmers = useSwimmers(search || undefined);

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const importSwimmers = useImportSwimmers();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addNombre, setAddNombre] = useState('');
  const [addRut, setAddRut] = useState('');
  const createSwimmer = useCreateSwimmer();

  const handleImport = () => {
    if (!importText.trim()) return;
    importSwimmers.mutate(importText);
  };

  const handleAdd = () => {
    if (!addNombre.trim() || !addRut.trim()) return;
    createSwimmer.mutate(
      { nombre: addNombre.trim(), rut: addRut.trim() },
      { onSuccess: () => setAddNombre('') },
    );
  };

  const list = swimmers.data?.swimmers ?? [];

  return (
    <ScreenLayout title="Nadadores">
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

      <PrimaryButton
        label={showImport ? '⇪ OCULTAR IMPORTACIÓN' : '⇪ IMPORTAR BASE DE DATOS'}
        onPress={() => setShowImport((v) => !v)}
      />

      {showImport ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Importar nadadores</Text>
          <Text style={styles.cardHelp}>
            Pega una línea por nadador con <Text style={{ fontFamily: fonts.barlowSemiBold }}>Nombre, RUT</Text>. Se
            genera un PIN de 4 dígitos automáticamente; el nadador completa su perfil y puede cambiar su PIN al
            ingresar.
          </Text>
          <TextInput
            value={importText}
            onChangeText={setImportText}
            multiline
            numberOfLines={5}
            placeholder={'Juan González, 12.345.678-9\nTomás Herrera, 15.111.222-3'}
            placeholderTextColor={colors.textTertiary}
            style={styles.textarea}
          />
          <PrimaryButton
            label="IMPORTAR Y GENERAR PINS"
            variant="danger"
            onPress={handleImport}
            loading={importSwimmers.isPending}
          />
          {importSwimmers.data ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>✓ {importSwimmers.data.count} NADADORES IMPORTADOS · PINS GENERADOS</Text>
              {importSwimmers.data.imported.map((p) => (
                <View key={p.rut} style={styles.resultRow}>
                  <Text style={styles.resultName}>{p.nombre}</Text>
                  <Text style={styles.resultPin}>{p.pin}</Text>
                </View>
              ))}
              {importSwimmers.data.rejected.length > 0 ? (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {importSwimmers.data.rejected.map((r, i) => (
                    <Text key={i} style={styles.rejectedText}>
                      ✕ {r.line} — {r.reason}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Text style={styles.resultNote}>
                Comparte cada PIN con su nadador. Es temporal: deberá cambiarlo en el primer ingreso. No volverá a
                mostrarse.
              </Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.countText}>{list.length} nadadores</Text>
        <Pressable onPress={() => setShowAddForm((v) => !v)}>
          <Text style={styles.addLink}>+ AGREGAR</Text>
        </Pressable>
      </View>

      {showAddForm ? (
        <Card style={{ gap: 12 }}>
          <Text style={styles.cardTitle}>Agregar nadador</Text>
          <FormField label="Nombre completo" value={addNombre} onChangeText={setAddNombre} placeholder="Nombre y apellido" />
          <RutInput value={addRut} onChangeText={setAddRut} />
          <PrimaryButton label="GUARDAR NADADOR" variant="danger" onPress={handleAdd} loading={createSwimmer.isPending} />
          {createSwimmer.data ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>✓ NADADOR CREADO · PIN GENERADO</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultName}>{createSwimmer.data.nombre}</Text>
                <Text style={styles.resultPin}>{createSwimmer.data.pin}</Text>
              </View>
              <Text style={styles.resultNote}>PIN temporal: compártelo y deberá cambiarlo en su primer ingreso.</Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      {swimmers.isLoading ? (
        <ActivityIndicator color={colors.navy} />
      ) : list.length === 0 ? (
        <EmptyState message="No hay nadadores que coincidan con la búsqueda." />
      ) : (
        list.map((s) => (
          <Pressable key={s.id} style={styles.row} onPress={() => navigation.navigate('SwimmerDetail', { swimmerId: s.id })}>
            <Avatar name={s.nombre} size={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowName}>{s.nombre}</Text>
              <Text style={styles.rowCat}>{s.categoria ?? '—'}</Text>
            </View>
            {s.pending ? <Pill label="Perfil pendiente" bg={colors.medicalBg} textColor={colors.red} /> : <Text style={styles.chevron}>›</Text>}
          </Pressable>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.cardSm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchIcon: { color: colors.textTertiary },
  searchInput: { flex: 1, fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.textPrimary },
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  resultBox: { backgroundColor: '#EAF6EF', borderWidth: 1, borderColor: '#BFE6CF', borderRadius: radii.cardSm, padding: 12 },
  resultTitle: { fontFamily: fonts.barlowBold, fontSize: 12, color: colors.green, letterSpacing: 0.5, marginBottom: 8 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D6ECDF',
  },
  resultName: { fontFamily: fonts.barlowSemiBold, fontSize: 13, color: colors.navy },
  resultPin: { fontFamily: fonts.oswaldBold, fontSize: 15, color: colors.red, letterSpacing: 2 },
  resultNote: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary, marginTop: 8 },
  rejectedText: { fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.red },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary },
  addLink: { fontFamily: fonts.oswaldSemiBold, fontSize: 13, color: colors.blueAccent },
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
  chevron: { color: colors.textTertiary, fontSize: 22 },
});
