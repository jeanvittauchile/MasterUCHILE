import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

const PALETTE = [colors.red, colors.blueAccent, colors.navy];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function colorForName(name: string): string {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  const bg = colorForName(name);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize: size * 0.37 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initials: { fontFamily: fonts.oswaldBold, color: colors.white },
});
