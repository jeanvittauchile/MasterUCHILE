import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radii, shadows } from '../../theme/tokens';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 18,
    ...shadows.card,
  },
});
