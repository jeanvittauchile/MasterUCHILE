import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinPad({ value, onChange, length = 4 }: { value: string; onChange: (next: string) => void; length?: number }) {
  const handlePress = (key: string) => {
    if (key === '') return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < length) onChange(value + key);
  };

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          return (
            <View key={i} style={[styles.dot, filled && styles.dotFilled]}>
              <Text style={styles.dotChar}>{filled ? '•' : ''}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.grid}>
        {KEYS.map((key, i) => (
          <Pressable
            key={i}
            disabled={key === ''}
            onPress={() => handlePress(key)}
            style={[styles.key, key === '' && styles.keyEmpty]}
          >
            <Text style={styles.keyLabel}>{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 10 },
  dot: {
    width: 52,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: { borderColor: colors.navy, backgroundColor: colors.chipInfoBg },
  dotChar: { fontFamily: fonts.oswaldBold, fontSize: 26, color: colors.navy },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 12 },
  key: {
    width: '30%',
    height: 58,
    borderRadius: radii.cardSm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: { backgroundColor: 'transparent' },
  keyLabel: { fontFamily: fonts.oswaldSemiBold, fontSize: 23, color: colors.navy },
});
