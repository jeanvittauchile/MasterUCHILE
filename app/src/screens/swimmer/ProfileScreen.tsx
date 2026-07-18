import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { isValidPin } from '@masteruchile/shared';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { FormField } from '../../components/forms/FormField';
import { RutInput } from '../../components/forms/RutInput';
import { PinPad } from '../../components/forms/PinPad';
import { useSwimmerFicha, useUpdateSwimmerProfile } from '../../api/hooks/useSwimmers';
import { useChangePin } from '../../api/hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/tokens';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

function ageFromBirth(birth: string): number | null {
  const [y, m, d] = birth.split('-').map(Number);
  if (!y) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  const hadBirthday = now.getMonth() + 1 > (m ?? 1) || (now.getMonth() + 1 === (m ?? 1) && now.getDate() >= (d ?? 1));
  if (!hadBirthday) age -= 1;
  return age;
}

/** Ficha propia del nadador: datos personales, perfil deportivo, salud/emergencia y cambio de PIN. */
export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ficha = useSwimmerFicha(user?.id);
  const updateProfile = useUpdateSwimmerProfile(user?.id ?? '');
  const changePin = useChangePin();

  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [birth, setBirth] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [grupo, setGrupo] = useState<'AM' | 'PM'>('AM');
  const [style1, setStyle1] = useState('');
  const [style2, setStyle2] = useState('');
  const [ev1, setEv1] = useState('');
  const [ev2, setEv2] = useState('');
  const [medical, setMedical] = useState('');
  const [emergency, setEmergency] = useState('');

  useEffect(() => {
    if (!ficha.data) return;
    setNombre(ficha.data.nombre ?? '');
    setRut(ficha.data.rut ?? '');
    const p = ficha.data.perfil ?? {};
    setBirth(str(p.fecha_nacimiento));
    setEmail(str(p.email));
    setPhone(str(p.telefono));
    setGrupo(str(p.grupo) === 'PM' ? 'PM' : 'AM');
    setStyle1(str(p.estilo_1));
    setStyle2(str(p.estilo_2));
    setEv1(str(p.prueba_fav_1));
    setEv2(str(p.prueba_fav_2));
    setMedical(str(p.prescripcion_medica));
    setEmergency(str(p.contacto_emergencia));
  }, [ficha.data]);

  const [showPinForm, setShowPinForm] = useState(false);
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinRepetido, setPinRepetido] = useState('');
  const pinMismatch = pinRepetido.length === 4 && pinRepetido !== pinNuevo;
  const canSubmitPin = isValidPin(pinNuevo) && isValidPin(pinRepetido) && pinNuevo === pinRepetido;

  const savePin = () => {
    changePin.mutate(
      { pinNuevo, pinRepetido },
      {
        onSuccess: () => {
          setShowPinForm(false);
          setPinNuevo('');
          setPinRepetido('');
        },
      },
    );
  };

  const saveProfile = () => {
    updateProfile.mutate({
      nombre,
      rut,
      fecha_nacimiento: birth,
      email,
      telefono: phone,
      grupo,
      estilo_1: style1,
      estilo_2: style2,
      prueba_fav_1: ev1,
      prueba_fav_2: ev2,
      prescripcion_medica: medical,
      contacto_emergencia: emergency,
    });
  };

  if (ficha.isLoading) {
    return (
      <ScreenLayout title="Perfil">
        <ActivityIndicator color={colors.navy} />
      </ScreenLayout>
    );
  }

  const age = birth ? ageFromBirth(birth) : null;
  const categoria = ficha.data?.categoria?.label ?? '—';

  return (
    <ScreenLayout title="Perfil">
      <View style={styles.header}>
        <Avatar name={nombre || 'Nadador'} size={88} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.headerMeta}>
            {categoria} · {age ?? '—'} años · Nadador/a
          </Text>
        </View>
      </View>

      <View style={styles.autoBox}>
        <View style={styles.autoCol}>
          <Text style={styles.autoLabel}>EDAD (auto)</Text>
          <Text style={styles.autoValue}>{age ?? '—'}</Text>
        </View>
        <View style={styles.autoDivider} />
        <View style={styles.autoCol}>
          <Text style={styles.autoLabel}>CATEGORÍA (auto)</Text>
          <Text style={styles.autoValue}>{categoria}</Text>
        </View>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>DATOS PERSONALES</Text>
        <FormField label="Nombre completo" value={nombre} onChangeText={setNombre} />
        <View style={styles.fieldRow}>
          <RutInput value={rut} onChangeText={setRut} />
          <FormField label="Fecha nacimiento" value={birth} onChangeText={setBirth} placeholder="1993-05-14" />
        </View>
        <View style={styles.fieldRow}>
          <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <FormField label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>PERFIL DEPORTIVO</Text>
        <View>
          <Text style={styles.label}>Grupo de entrenamiento</Text>
          <View style={styles.groupRow}>
            {(['AM', 'PM'] as const).map((g) => (
              <Pressable key={g} style={[styles.groupBtn, grupo === g && styles.groupBtnActive]} onPress={() => setGrupo(g)}>
                <Text style={[styles.groupBtnLabel, grupo === g && styles.groupBtnLabelActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.fieldRow}>
          <FormField label="Primer estilo" value={style1} onChangeText={setStyle1} />
          <FormField label="Segundo estilo" value={style2} onChangeText={setStyle2} />
        </View>
        <View style={styles.fieldRow}>
          <FormField label="Prueba favorita 1" value={ev1} onChangeText={setEv1} />
          <FormField label="Prueba favorita 2" value={ev2} onChangeText={setEv2} />
        </View>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>SALUD Y EMERGENCIA</Text>
        <View style={styles.medicalBanner}>
          <Text style={styles.medicalBannerText}>⚕ Datos sensibles · visibles solo para ti y tu entrenador</Text>
        </View>
        <FormField label="Prescripción médica" value={medical} onChangeText={setMedical} />
        <FormField label="Contacto de emergencia" value={emergency} onChangeText={setEmergency} />
      </Card>

      <Card style={styles.formCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.cardTitle}>PIN DE INGRESO</Text>
          <Pressable
            style={[styles.editBtn, { backgroundColor: showPinForm ? colors.navy : colors.chipInfoBg }]}
            onPress={() => setShowPinForm((v) => !v)}
          >
            <Text style={[styles.editBtnLabel, { color: showPinForm ? colors.white : colors.chipInfoText }]}>{showPinForm ? 'Cerrar' : 'Cambiar'}</Text>
          </Pressable>
        </View>
        {showPinForm ? (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.label}>Nuevo PIN (4 dígitos)</Text>
              <PinPad value={pinNuevo} onChange={setPinNuevo} />
            </View>
            <View>
              <Text style={styles.label}>Repetir PIN</Text>
              <PinPad value={pinRepetido} onChange={setPinRepetido} />
            </View>
            {pinMismatch ? <Text style={styles.errorText}>Los PIN no coinciden</Text> : null}
            {changePin.isError ? <Text style={styles.errorText}>{changePin.error.message}</Text> : null}
            <PrimaryButton label="GUARDAR PIN" variant="danger" onPress={savePin} loading={changePin.isPending} disabled={!canSubmitPin} />
          </View>
        ) : null}
      </Card>

      <PrimaryButton label="GUARDAR" onPress={saveProfile} loading={updateProfile.isPending} />
      <PrimaryButton label="CERRAR SESIÓN" variant="outline" onPress={logout} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  headerText: { alignItems: 'center' },
  name: { fontFamily: fonts.oswaldBold, fontSize: 22, color: colors.navy, textAlign: 'center' },
  headerMeta: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  autoBox: { flexDirection: 'row', backgroundColor: colors.chipInfoBg, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 },
  autoCol: { flex: 1 },
  autoDivider: { width: 1, backgroundColor: colors.border },
  autoLabel: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
  autoValue: { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.navy, marginTop: 4 },
  formCard: { gap: 13 },
  cardTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  groupRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  groupBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  groupBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  groupBtnLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 14, color: colors.navy },
  groupBtnLabelActive: { color: colors.white },
  medicalBanner: { backgroundColor: colors.medicalBg, borderWidth: 1, borderColor: colors.medicalBorder, borderRadius: 10, padding: 10 },
  medicalBannerText: { fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.medicalText },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { borderRadius: 9, paddingVertical: 7, paddingHorizontal: 13 },
  editBtnLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 12, letterSpacing: 0.5 },
  errorText: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.red },
});
