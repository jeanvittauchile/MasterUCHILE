import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme/tokens';

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 74;
const RINGS = [0.25, 0.5, 0.75, 1];

function vertex(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function polygonPoints(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => vertex(i, count, radius))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
}

export interface RadarChartProps {
  criteria: string[];
  labels?: string[];
  scores: Record<string, number>;
  max?: number;
  height?: number;
  color?: string;
}

/** Radar de 6 ejes con anillos de referencia 25/50/75/100%, igual al prototipo (Libre/Espalda/Pecho/Mariposa/Virajes/Salidas). */
export function RadarChart({ criteria, labels, scores, max = 10, height = 210, color = colors.red }: RadarChartProps) {
  const count = criteria.length;
  const dataPoints = criteria
    .map((c, i) => vertex(i, count, (Math.min(scores[c] ?? 0, max) / max) * RADIUS))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <View style={{ height, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={height} height={height} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {RINGS.map((r) => (
          <Polygon key={r} points={polygonPoints(count, RADIUS * r)} fill="none" stroke={colors.separator} strokeWidth={1} />
        ))}
        {criteria.map((_, i) => {
          const p = vertex(i, count, RADIUS);
          return <Line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke={colors.separator} strokeWidth={1} />;
        })}
        <Polygon points={dataPoints} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
        {criteria.map((c, i) => {
          const p = vertex(i, count, RADIUS + 16);
          return (
            <SvgText
              key={c}
              x={p.x}
              y={p.y}
              fontSize={9}
              fill={colors.textSecondary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {(labels ?? criteria)[i]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
