import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { HabitLog, HabitType } from '@core/habits/api';
import { logsByDay } from '@core/habits/api';
import {
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
  PRIMARY,
  SECONDARY,
  ACCENT,
} from '@lib/theme';

interface Props {
  logs: HabitLog[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const HABIT_DOT_COLOR: Record<HabitType, string> = {
  hydro: ACCENT[500],
  phyto: SECONDARY[500],
  pro: '#F97316',
};

function dateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function HabitCalendar({ logs, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateString(today);
  const month = today.getMonth();
  const year = today.getFullYear();

  // First day of month and how many days
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

  const dayMap = logsByDay(logs);

  const cells: ({ date: Date; ds: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, ds: dateString(date) });
  }

  const monthName = firstOfMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <Text style={styles.monthHeader}>{monthName}</Text>

      {/* Day-of-week header */}
      <View style={styles.row}>
        {dayLabels.map((d, i) => (
          <View key={i} style={styles.dowCell}>
            <Text style={styles.dow}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid in rows of 7 */}
      <View style={styles.grid}>
        {cells.map((c, i) => {
          if (!c) {
            return <View key={`empty-${i}`} style={styles.cell} />;
          }
          const completedHabits = dayMap.get(c.ds) ?? [];
          const isToday = c.ds === todayStr;
          const isSelected = selectedDate === c.ds;
          const isFuture = c.date > today;

          return (
            <Pressable
              key={c.ds}
              onPress={() => !isFuture && onSelectDate(c.ds)}
              disabled={isFuture}
              style={[
                styles.cell,
                isSelected && styles.cellSelected,
                isToday && styles.cellToday,
                isFuture && styles.cellFuture,
              ]}
            >
              <Text
                style={[
                  styles.dayNum,
                  isSelected && styles.dayNumSelected,
                  isToday && styles.dayNumToday,
                  isFuture && styles.dayNumFuture,
                ]}
              >
                {c.date.getDate()}
              </Text>
              <View style={styles.dotsRow}>
                {(['hydro', 'phyto', 'pro'] as HabitType[]).map((ht) => (
                  <View
                    key={ht}
                    style={[
                      styles.dot,
                      completedHabits.includes(ht)
                        ? { backgroundColor: HABIT_DOT_COLOR[ht] }
                        : { backgroundColor: '#E5E7EB' },
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: HABIT_DOT_COLOR.hydro }]} />
          <Text style={styles.legendText}>Hydro</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: HABIT_DOT_COLOR.phyto }]} />
          <Text style={styles.legendText}>Phyto</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: HABIT_DOT_COLOR.pro }]} />
          <Text style={styles.legendText}>Pro</Text>
        </View>
      </View>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOW.CARD,
  },
  monthHeader: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: TEXT.DEFAULT,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dowCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dow: {
    fontFamily: FONT.bodyBold,
    fontSize: 10,
    color: TEXT.tertiary,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cell: {
    width: CELL_SIZE,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDERS.RADIUS.SMALL,
    marginVertical: 2,
  },
  cellSelected: {
    backgroundColor: PRIMARY[100],
    borderWidth: 2,
    borderColor: PRIMARY[400],
  },
  cellToday: {
    backgroundColor: PRIMARY[50],
  },
  cellFuture: {
    opacity: 0.3,
  },
  dayNum: {
    fontFamily: FONT.bodyBold,
    fontSize: 14,
    color: TEXT.DEFAULT,
  },
  dayNumSelected: { color: PRIMARY[800] },
  dayNumToday: { fontFamily: FONT.brand, color: PRIMARY[700] },
  dayNumFuture: { color: TEXT.muted },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.MD,
    marginTop: SPACING.MD,
    paddingTop: SPACING.SM,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontFamily: FONT.bodyBold,
    fontSize: 11,
    color: TEXT.tertiary,
  },
});
