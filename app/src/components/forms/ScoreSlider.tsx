import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, fonts } from '../../theme/tokens';

export function ScoreSlider({ label, value, onValueChange }: { label: string; value: number; onValueChange: (v: number) => void }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      </View>
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={0.5}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.red}
        maximumTrackTintColor={colors.trackBgAlt}
        thumbTintColor={colors.red}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontFamily: fonts.barlowSemiBold, fontSize: 13.5, color: colors.textPrimary },
  value: { fontFamily: fonts.oswaldSemiBold, fontSize: 15, color: colors.textPrimary },
});
