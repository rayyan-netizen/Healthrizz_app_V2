import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { fetchChildSummary, fetchCompletedTopicKeys, type ChildSummary } from '@core/profile/api';
import {
  HABIT_DEFS,
  fetchHabitLogs,
  computeHabitStats,
  type HabitLog,
  type HabitStats,
  type HabitType,
} from '@core/habits/api';
import { CANONICAL_SESSIONS } from '@core/map/data/canonicalSessions';
import { PERSONA_DISPLAY } from '@core/types/persona';
import { BrandButton } from '@components/brand/BrandButton';
import { PRIMARY, SECONDARY, TEXT, BG, SPACING, FONT, BORDERS, SHADOW } from '@lib/theme';

const STICKER_CYCLE = 5;
const STICKER_ICON: Record<HabitType, string> = { hydro: '💧', phyto: '🌿', pro: '⚡' };
const STICKER_COLOR: Record<HabitType, string> = {
  hydro: '#3B82F6',
  phyto: '#22C55E',
  pro: '#F97316',
};

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const childId = useChildStore((s) => s.childId);

  const [child, setChild] = useState<ChildSummary | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!childId) return;
    const [c, logs, topics] = await Promise.all([
      fetchChildSummary(childId),
      fetchHabitLogs(childId, 60),
      fetchCompletedTopicKeys(childId),
    ]);
    setChild(c);
    setHabitLogs(logs);
    setCompletedTopics(topics);
    setLoading(false);
    setRefreshing(false);
  }, [childId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const habitStats: HabitStats = useMemo(() => computeHabitStats(habitLogs), [habitLogs]);
  const islandsDone = completedTopics.size;
  const islandsTotal = CANONICAL_SESSIONS.length;
  const persona = child?.primaryPersona ? PERSONA_DISPLAY[child.primaryPersona] : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.LG, paddingBottom: SPACING.XXL * 2, gap: SPACING.LG }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>
            {persona ? `${persona.emoji} ` : ''}{child?.nickname ?? 'Your'} Profile
          </Text>
          {persona && <Text style={styles.subtitle}>{persona.title} — {persona.tagline}</Text>}
        </View>

        {/* Streak stickers */}
        <View style={[styles.card, SHADOW.CARD]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>🎟️ Streak Stickers</Text>
            <View style={styles.bestPill}>
              <Text style={styles.bestPillText}>🏆 {habitStats.longestStreak}d best</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>
            {habitStats.totalDaysTracked} days tracked — keep filling your stickers!
          </Text>
          <View style={{ gap: SPACING.SM, marginTop: SPACING.SM }}>
            {HABIT_DEFS.map((def) => {
              const streak = habitStats.streaks[def.id];
              const filled = Math.min(streak, STICKER_CYCLE);
              return (
                <View key={def.id} style={styles.stickerRow}>
                  <Text style={styles.stickerLabel} numberOfLines={1}>{def.title}</Text>
                  <View style={styles.pipRow}>
                    {Array.from({ length: STICKER_CYCLE }).map((_, i) => {
                      const isFilled = i < filled;
                      const color = STICKER_COLOR[def.id];
                      return (
                        <View
                          key={i}
                          style={[
                            styles.pip,
                            isFilled
                              ? { backgroundColor: color, borderColor: color }
                              : { backgroundColor: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.12)' },
                          ]}
                        >
                          <Text style={[styles.pipIcon, !isFilled && { opacity: 0.35 }]}>
                            {STICKER_ICON[def.id]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.stickerStreak}>{streak === 0 ? 'Start!' : `${streak}d`}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Islands completed */}
        <View style={[styles.card, SHADOW.CARD]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>🗺️ Islands Completed</Text>
            <Text style={styles.progressText}>{islandsDone} / {islandsTotal}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${islandsTotal > 0 ? (islandsDone / islandsTotal) * 100 : 0}%` },
              ]}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: SPACING.SM, paddingTop: SPACING.SM }}
          >
            {CANONICAL_SESSIONS.map((s) => {
              const earned = completedTopics.has(s.topicKey);
              return (
                <View key={s.topicKey} style={styles.islandBadge}>
                  <View
                    style={[
                      styles.islandBadgeIcon,
                      { backgroundColor: earned ? s.color : '#E5E7EB' },
                    ]}
                  >
                    <Text style={styles.islandBadgeEmoji}>{earned ? s.icon : '🔒'}</Text>
                  </View>
                  <Text style={styles.islandBadgeLabel} numberOfLines={1}>{s.sessionTitle}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Account */}
        <View style={[styles.card, SHADOW.CARD]}>
          <Text style={styles.cardTitle}>Account</Text>
          {session?.user.email && <Text style={styles.cardBody}>{session.user.email}</Text>}
          <BrandButton label="Log out" variant="outline" onPress={signOut} style={{ marginTop: SPACING.SM }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG.warm },
  title: { fontFamily: FONT.brand, fontSize: 28, color: TEXT.DEFAULT },
  subtitle: { fontFamily: FONT.body, color: TEXT.tertiary, fontSize: 15, marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.MD,
    gap: SPACING.SM,
  },
  cardTitle: { fontFamily: FONT.brand, fontSize: 16, color: TEXT.DEFAULT },
  cardBody: { fontFamily: FONT.body, fontSize: 13, color: TEXT.tertiary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bestPill: {
    backgroundColor: PRIMARY[100],
    borderRadius: BORDERS.RADIUS.FULL,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: PRIMARY[300],
  },
  bestPillText: { fontFamily: FONT.bodyBold, fontSize: 12, color: PRIMARY[800] },
  progressText: { fontFamily: FONT.bodyBold, fontSize: 13, color: TEXT.tertiary },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: BORDERS.RADIUS.FULL, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: BORDERS.RADIUS.FULL, backgroundColor: SECONDARY[500] },
  islandBadge: { alignItems: 'center', width: 68 },
  islandBadgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOW.NODE,
  },
  islandBadgeEmoji: { fontSize: 22 },
  islandBadgeLabel: {
    fontFamily: FONT.bodyBold,
    fontSize: 10,
    color: TEXT.DEFAULT,
    textAlign: 'center',
    marginTop: 4,
  },
  stickerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  stickerLabel: { fontFamily: FONT.bodyBold, fontSize: 12, color: TEXT.DEFAULT, width: 72 },
  pipRow: { flexDirection: 'row', gap: 6, flex: 1 },
  pip: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pipIcon: { fontSize: 13 },
  stickerStreak: { fontFamily: FONT.bodyBold, fontSize: 12, color: TEXT.tertiary, width: 36, textAlign: 'right' },
});
