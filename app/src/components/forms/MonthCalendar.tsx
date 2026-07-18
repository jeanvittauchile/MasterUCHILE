import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export interface DaySessionMarks {
  am?: boolean;
  pm?: boolean;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface Props {
  year: number;
  month: number; // 0-indexed
  marksByDate: Record<string, DaySessionMarks>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}

export function MonthCalendar({ year, month, marksByDate, selectedDate, onSelectDate }: Props) {
  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // lunes=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: { day: number | null; key: string | null }[] = [];
    for (let i = 0; i < startOffset; i++) list.push({ day: null, key: null });
    for (let d = 1; d <= daysInMonth; d++) list.push({ day: d, key: toDateKey(year, month, d) });
    return list;
  }, [year, month]);

  return (
    <View>
      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={styles.dow}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((c, i) => {
          if (!c.day) return <View key={i} style={styles.cell} />;
          const marks = marksByDate[c.key!];
          const isSelected = selectedDate === c.key;
          return (
            <Pressable key={i} style={[styles.cell, isSelected && styles.cellSelected]} onPress={() => onSelectDate(c.key!)}>
              <Text style={[styles.cellText, isSelected && styles.cellTextSelected]}>{c.day}</Text>
              {marks?.am || marks?.pm ? (
                <View style={styles.dotsRow}>
                  {marks.am ? <View style={[styles.dot, { backgroundColor: colors.red }]} /> : null}
                  {marks.pm ? <View style={[styles.dot, { backgroundColor: colors.navy }]} /> : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: { width: CELL_SIZE, textAlign: 'center', fontFamily: fonts.oswaldSemiBold, fontSize: 10.5, color: colors.textTertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  cellSelected: { backgroundColor: colors.background, borderRadius: 10 },
  cellText: { fontFamily: fonts.barlowMedium, fontSize: 12.5, color: colors.textPrimary },
  cellTextSelected: { fontFamily: fonts.oswaldSemiBold, color: colors.navy },
  dotsRow: { flexDirection: 'row', gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
