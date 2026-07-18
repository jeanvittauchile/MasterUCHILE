import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../theme/tokens';
import { MAX_CONTENT_WIDTH, useIsDesktop } from '../../theme/responsive';

const logo = require('../../assets/logo-natacion.png');

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  scroll?: boolean;
  children: React.ReactNode;
}

/**
 * Header persistente (logo + título + atrás) + cuerpo scrolleable, igual al shell del prototipo.
 * En desktop (>= DESKTOP_BREAKPOINT) el contenido se centra en una columna de lectura cómoda en vez
 * de estirarse a todo el ancho de la ventana; en mobile no cambia nada.
 */
export function ScreenLayout({ title, subtitle = 'Equipo Máster · Temporada 2026', showBack, scroll = true, children }: Props) {
  const navigation = useNavigation();
  const canGoBack = showBack ?? navigation.canGoBack();
  const isDesktop = useIsDesktop();
  const Body = scroll ? ScrollView : View;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.navy, colors.navySecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isDesktop && styles.headerDesktop]}
      >
        <View style={[styles.headerRow, isDesktop && styles.contentColumn]}>
          {canGoBack ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backChevron}>‹</Text>
            </Pressable>
          ) : null}
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
      <Body
        style={styles.body}
        contentContainerStyle={
          scroll ? [styles.bodyContent, isDesktop && styles.bodyContentDesktop] : undefined
        }
      >
        {isDesktop && !scroll ? <View style={styles.contentColumn}>{children}</View> : children}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  headerDesktop: { paddingTop: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contentColumn: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  backChevron: { color: colors.white, fontSize: 18, lineHeight: 18 },
  logo: { width: 40, height: 40, borderRadius: 9, backgroundColor: colors.white, padding: 3 },
  title: { fontFamily: fonts.oswaldBold, fontSize: 21, color: colors.white, letterSpacing: 0.5 },
  subtitle: { fontFamily: fonts.barlowMedium, fontSize: 12, color: '#A9BBEE', marginTop: 3 },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 104, gap: 16 },
  bodyContentDesktop: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
