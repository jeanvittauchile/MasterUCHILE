import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

export function KpiTile({ value, label, color = colors.textPrimary }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 14, ...shadows.card },
  value: { fontFamily: fonts.oswaldBold, fontSize: 26, lineHeight: 28 },
  label: { fontFamily: fonts.barlowRegular, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
