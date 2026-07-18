import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: radii.cardSm, padding: 18, alignItems: 'center', ...shadows.card },
  text: { fontFamily: fonts.barlowRegular, fontSize: 13, color: colors.textTertiary, textAlign: 'center' },
});
