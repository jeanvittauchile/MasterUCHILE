import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

const VARIANTS = {
  primary: { bg: colors.navy, text: colors.white, border: undefined as string | undefined },
  danger: { bg: colors.red, text: colors.white, border: undefined },
  secondary: { bg: colors.chipInfoBg, text: colors.chipInfoText, border: undefined },
  outline: { bg: colors.surface, text: colors.textSecondary, border: colors.border },
};

export function PrimaryButton({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border ? 1 : 0 },
        variant === 'primary' && shadows.cta,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? <ActivityIndicator color={v.text} /> : <Text style={[styles.label, { color: v.text }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radii.button, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.oswaldSemiBold, fontSize: 14, letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});
