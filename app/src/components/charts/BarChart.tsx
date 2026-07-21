import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, fonts } from '../../theme/tokens';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({
  data,
  height = 132,
  color = colors.blueAccent,
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barGap = 8;

  return (
    <View style={{ height, width: '100%' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${data.length * 40} 100`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barHeight = (d.value / max) * 78;
          const x = i * 40 + barGap / 2;
          return <Rect key={`${d.label}-${i}`} x={x} y={82 - barHeight} width={40 - barGap} height={barHeight} rx={4} fill={d.color ?? color} />;
        })}
      </Svg>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {data.map((d, i) => (
          <View key={`${d.label}-label-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.barlowRegular, fontSize: 10, color: colors.textTertiary }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
