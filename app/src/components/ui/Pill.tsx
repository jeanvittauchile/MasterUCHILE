import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

export function Pill({
  label,
  tone = colors.blueAccent,
  textColor = colors.white,
  bg,
}: {
  label: string;
  tone?: string;
  textColor?: string;
  bg?: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg ?? tone }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: 11, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.barlowSemiBold, fontSize: 11.5 },
});
