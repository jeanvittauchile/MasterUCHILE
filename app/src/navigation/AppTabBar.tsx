import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/icons';
import { colors, fonts, shadows } from '../theme/tokens';
import { MAX_CONTENT_WIDTH, useIsDesktop } from '../theme/responsive';

export function AppTabBar({ state, descriptors, navigation, icons }: BottomTabBarProps & { icons: Record<string, any> }) {
  const isDesktop = useIsDesktop();

  return (
    <View style={isDesktop ? styles.barDesktopWrap : undefined}>
      <View style={[styles.bar, isDesktop && styles.barDesktop]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel ?? options.title ?? route.name) as string;
          const focused = state.index === index;
          const color = focused ? colors.navy : colors.textTertiary;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={[styles.item, isDesktop && styles.itemDesktop]}>
              <Icon name={icons[route.name]} size={22} color={color} />
              <Text style={[styles.label, { color, fontFamily: focused ? fonts.oswaldSemiBold : fonts.barlowMedium }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 6,
  },
  // Desktop: dock flotante centrado, ancho igual a la columna de contenido, sin depender de un
  // safe-area inferior (no hay home indicator en un navegador de escritorio).
  barDesktopWrap: { alignItems: 'center', paddingBottom: 16, paddingHorizontal: 16 },
  barDesktop: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    borderRadius: 18,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    gap: 8,
    ...shadows.modal,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  itemDesktop: { flex: 0, minWidth: 84, cursor: 'pointer' as any },
  label: { fontSize: 10.5 },
});
