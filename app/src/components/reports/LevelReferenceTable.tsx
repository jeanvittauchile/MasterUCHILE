import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  EVALUATION_LEVELS,
  PECHO_TECNICA_FIJA,
  STROKE_LEVELS,
  TECHNICAL_EVALUATION_STROKES,
  TECHNICAL_EVALUATION_STROKE_LABELS,
  TURN_COMBINATION_LABELS,
  TURN_TRANSITION_TIME_LEVELS,
  type LevelRange,
} from '@masteruchile/shared';
import { colors, fonts } from '../../theme/tokens';

const DISPLAY_LEVELS = [...EVALUATION_LEVELS].reverse(); // P → I → A → AR, igual que la lámina

const formatRange = (r: LevelRange) => `${r.min}–${r.max}`;

/** Tabla de referencia técnica de salidas y virajes (lámina del club), solo lectura. */
export function LevelReferenceTable() {
  return (
    <View style={{ gap: 16 }}>
      {TECHNICAL_EVALUATION_STROKES.map((estilo) => (
        <View key={estilo} style={{ gap: 6 }}>
          <Text style={styles.strokeTitle}>{TECHNICAL_EVALUATION_STROKE_LABELS[estilo]}</Text>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.headerCell, styles.nivelCol]}>Nivel</Text>
            <Text style={[styles.cell, styles.headerCell]}>Salida (s)</Text>
            <Text style={[styles.cell, styles.headerCell]}>Viraje (s)</Text>
            <Text style={[styles.cell, styles.headerCell]}>Pat.Sub</Text>
            <Text style={[styles.cell, styles.headerCell]}>Braz.</Text>
          </View>
          {DISPLAY_LEVELS.map((level) => {
            const entry = STROKE_LEVELS[estilo][level];
            return (
              <View key={level} style={styles.row}>
                <Text style={[styles.cell, styles.nivelCol, styles.nivelText]}>{level}</Text>
                <Text style={styles.cell}>{formatRange(entry.salidaTiempo)}</Text>
                <Text style={styles.cell}>{formatRange(entry.virajeTiempo)}</Text>
                <Text style={styles.cell}>{entry.patSub ? formatRange(entry.patSub) : PECHO_TECNICA_FIJA.patSub}</Text>
                <Text style={styles.cell}>{entry.brazadas ? formatRange(entry.brazadas) : PECHO_TECNICA_FIJA.brazadas}</Text>
              </View>
            );
          })}
        </View>
      ))}

      <View style={{ gap: 6 }}>
        <Text style={styles.strokeTitle}>Virajes de combinación (tiempo total, s)</Text>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell, styles.comboCol]}>Transición</Text>
          {DISPLAY_LEVELS.map((level) => (
            <Text key={level} style={[styles.cell, styles.headerCell]}>{level}</Text>
          ))}
        </View>
        {(Object.keys(TURN_TRANSITION_TIME_LEVELS) as (keyof typeof TURN_TRANSITION_TIME_LEVELS)[]).map((combo) => (
          <View key={combo} style={styles.row}>
            <Text style={[styles.cell, styles.comboCol]}>{TURN_COMBINATION_LABELS[combo]}</Text>
            {DISPLAY_LEVELS.map((level) => (
              <Text key={level} style={styles.cell}>{formatRange(TURN_TRANSITION_TIME_LEVELS[combo][level])}</Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strokeTitle: { fontFamily: fonts.oswaldSemiBold, fontSize: 13.5, color: colors.navy, letterSpacing: 0.3 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.separator, paddingVertical: 6 },
  cell: { flex: 1, fontFamily: fonts.barlowRegular, fontSize: 11.5, color: colors.textSecondary, textAlign: 'center' },
  headerCell: { fontFamily: fonts.barlowBold, color: colors.textTertiary, fontSize: 10.5, letterSpacing: 0.3 },
  nivelCol: { flex: 0.6 },
  nivelText: { fontFamily: fonts.oswaldSemiBold, color: colors.navy },
  comboCol: { flex: 1.6, textAlign: 'left' },
});
