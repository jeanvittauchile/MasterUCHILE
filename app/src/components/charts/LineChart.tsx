import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../../theme/tokens';

export interface LineDatum {
  label: string;
  value: number;
}

/**
 * Línea de evolución (ej. tiempos en segundos por prueba). Se grafica en orden dado (cronológico),
 * sin invertir el eje: como el tiempo baja al mejorar, una línea descendente ya comunica "mejora".
 */
export function LineChart({ data, height = 132, color = colors.red }: { data: LineDatum[]; height?: number; color?: string }) {
  if (data.length < 2) {
    return (
      <View style={{ height, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Circle cx={0} cy={0} r={0} />
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = Math.max(data.length * 36, 120);
  const padY = 10;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 20) + 10;
    const y = padY + (1 - (d.value - min) / range) * (100 - padY * 2);
    return { x, y };
  });

  return (
    <View style={{ height, width: '100%' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} 100`} preserveAspectRatio="none">
        <Line x1={0} y1={100} x2={width} y2={100} stroke={colors.separator} strokeWidth={1} />
        <Polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
        ))}
      </Svg>
    </View>
  );
}
