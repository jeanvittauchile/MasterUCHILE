import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.navy : colors.surface, borderColor: active ? colors.navy : colors.border },
      ]}
    >
      <Text style={[styles.label, { color: active ? colors.white : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: radii.pill, paddingVertical: 6, paddingHorizontal: 13, marginRight: 7 },
  label: { fontFamily: fonts.barlowSemiBold, fontSize: 12 },
});
