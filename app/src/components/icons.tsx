import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Set de iconos mínimo (estilo Feather, stroke-based) para el bottom nav — placeholder a reemplazar
 * por el set de iconos del codebase objetivo, tal como indica el handoff.
 */
const PATHS: Record<string, string> = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  users: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1M16 4.13a4 4 0 0 1 0 7.75M22 21v-1a6 6 0 0 0-4.5-5.8',
  calendar: 'M7 3v3M17 3v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4zM4 5h4v3a3 3 0 0 1-4 2.8V5zM16 5h4v5.8A3 3 0 0 1 16 8V5zM10 15h4v3h-4zM8 21h8',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a8 8 0 0 1 16 0v1',
  clipboard: 'M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6z',
};

export function Icon({ name, size = 24, color = '#0A1F5C' }: { name: keyof typeof PATHS; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={PATHS[name]} />
    </Svg>
  );
}
