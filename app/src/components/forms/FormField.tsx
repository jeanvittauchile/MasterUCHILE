import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

/** Input de texto base con label + mensaje de error opcional, mismo estilo en toda la app. */
export function FormField({ label, error, style, ...props }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.barlowRegular,
  },
  inputError: { borderColor: colors.red },
  error: { fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.red, marginTop: 3 },
});
