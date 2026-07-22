import React, { Fragment, useRef, useState } from 'react';
import { Pressable, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, fonts } from '../../theme/tokens';

export interface GroupedBarDatum {
  label: string;
  a: number;
  b: number;
  id?: string;
}

/** Par de barras por categoría (ej. confirmados vs no confirmados por sesión), con leyenda. */
export function GroupedBarChart({
  data,
  height = 132,
  colorA = colors.green,
  colorB = colors.red,
  legendA = 'Confirmados',
  legendB = 'No confirmados',
  onBarPress,
}: {
  data: GroupedBarDatum[];
  height?: number;
  colorA?: string;
  colorB?: string;
  legendA?: string;
  legendB?: string;
  onBarPress?: (datum: GroupedBarDatum, index: number) => void;
}) {
  const containerRef = useRef<View>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [containerPageX, setContainerPageX] = useState(0);

  if (!data.length) return null;
  const max = Math.max(...data.map((d) => Math.max(d.a, d.b)), 1);
  const groupWidth = 40;
  const barGap = 3;
  const barWidth = (groupWidth - 8 - barGap) / 2;

  const handleLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
    // En react-native-web el evento de tap no trae locationX (ver handlePress), así que
    // medimos el offset del contenedor en la página para poder derivarlo de pageX.
    (containerRef.current as unknown as { measure?: (cb: (x: number, y: number, w: number, h: number, pageX: number) => void) => void })
      ?.measure?.((_x, _y, _w, _h, pageX) => setContainerPageX(pageX));
  };

  const handlePress = (evt: GestureResponderEvent) => {
    if (!onBarPress || !chartWidth) return;
    const native = evt.nativeEvent as unknown as { locationX?: number; pageX?: number };
    const relativeX = native.locationX ?? (native.pageX ?? 0) - containerPageX;
    const index = Math.min(data.length - 1, Math.max(0, Math.floor((relativeX / chartWidth) * data.length)));
    onBarPress(data[index], index);
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colorA }} />
          <Text style={{ fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary }}>{legendA}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colorB }} />
          <Text style={{ fontFamily: fonts.barlowRegular, fontSize: 11, color: colors.textSecondary }}>{legendB}</Text>
        </View>
      </View>
      <Pressable
        ref={containerRef}
        style={{ height, width: '100%' }}
        onLayout={handleLayout}
        onPress={onBarPress ? handlePress : undefined}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${data.length * groupWidth} 100`} preserveAspectRatio="none">
          {data.map((d, i) => {
            const gx = i * groupWidth + 4;
            const aHeight = (d.a / max) * 78;
            const bHeight = (d.b / max) * 78;
            return (
              <Fragment key={`${d.label}-${i}`}>
                <Rect x={gx} y={82 - aHeight} width={barWidth} height={aHeight} rx={3} fill={colorA} />
                <Rect x={gx + barWidth + barGap} y={82 - bHeight} width={barWidth} height={bHeight} rx={3} fill={colorB} />
              </Fragment>
            );
          })}
        </Svg>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {data.map((d, i) => (
            <View key={`${d.label}-label-${i}`} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.barlowRegular, fontSize: 10, color: colors.textTertiary }}>{d.label}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}
