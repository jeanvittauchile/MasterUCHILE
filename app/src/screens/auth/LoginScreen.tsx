import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PinPad } from '../../components/forms/PinPad';
import { useLogin } from '../../api/hooks/useAuth';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

const logo = require('../../assets/logo-natacion.png');

export function LoginScreen() {
  const [identidad, setIdentidad] = useState('');
  const [pin, setPin] = useState('');
  const login = useLogin();

  useEffect(() => {
    if (pin.length === 4 && identidad.trim().length > 0 && !login.isPending) {
      login.mutate({ identidad: identidad.trim(), pin }, { onError: () => setPin('') });
    }
  }, [pin]);

  const error = login.isError ? login.error.message : identidad.length === 0 && pin.length === 4 ? 'Ingresa tu RUT o nombre' : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.navy, '#0B1330']} style={styles.root}>
        <View style={styles.column}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>NATACIÓN MÁSTER</Text>
          <Text style={styles.subtitle}>Universidad de Chile</Text>

          <View style={styles.card}>
            <Text style={styles.label}>IDENTIFÍCATE</Text>
            <TextInput
              value={identidad}
              onChangeText={setIdentidad}
              placeholder="RUT o nombre"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              autoCapitalize="words"
            />
            <Text style={[styles.label, { marginTop: 16 }]}>PIN DE 4 DÍGITOS</Text>
            <PinPad value={pin} onChange={setPin} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Text style={styles.help}>¿Olvidaste tu PIN? Contacta a tu entrenador para restaurarlo.</Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  column: { width: '100%', maxWidth: 420, alignItems: 'center' },
  logo: { width: 96, height: 96, backgroundColor: colors.white, borderRadius: 22, padding: 8 },
  title: { fontFamily: fonts.oswaldBold, fontSize: 26, color: colors.white, marginTop: 22, letterSpacing: 0.5 },
  subtitle: { fontFamily: fonts.barlowRegular, fontSize: 13, color: '#A9BBEE', marginTop: 4 },
  card: { width: '100%', backgroundColor: colors.white, borderRadius: 22, padding: 22, marginTop: 32, ...shadows.modal },
  label: { fontFamily: fonts.barlowSemiBold, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5 },
  input: {
    width: '100%',
    marginTop: 8,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.barlowRegular,
  },
  error: { color: colors.red, fontSize: 12.5, textAlign: 'center', marginTop: 10, fontFamily: fonts.barlowSemiBold },
  help: { fontFamily: fonts.barlowRegular, fontSize: 12, color: '#8FA0D6', marginTop: 18, textAlign: 'center' },
});
