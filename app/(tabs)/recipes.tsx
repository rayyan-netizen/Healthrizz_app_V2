import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useChildStore } from '@stores/childStore';
import { getAllRecipes, fetchUnlockedRecipeIds, type RecipeRow } from '@core/recipes/api';
import { PRIMARY, TEXT, BG, SPACING, FONT, BORDERS, SHADOW, PRO } from '@lib/theme';
import { hapticLight } from '@lib/haptic';

type RecipeFilter = 'all' | 'island' | 'bonus' | 'unlocked';

const FILTERS: { id: RecipeFilter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'island', label: 'Island', emoji: '🏝️' },
  { id: 'bonus', label: 'Bonus', emoji: '⭐' },
  { id: 'unlocked', label: 'Unlocked', emoji: '✅' },
];

export default function RecipesScreen() {
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);
  const [recipes] = useState<RecipeRow[]>(() => getAllRecipes());
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecipeFilter>('all');

  const load = useCallback(async () => {
    if (!childId) return;
    const u = await fetchUnlockedRecipeIds(childId);
    setUnlocked(u);
    setLoading(false);
  }, [childId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const filtered = recipes.filter((r) => {
    if (filter === 'island') return !r.isBonus;
    if (filter === 'bonus') return r.isBonus;
    if (filter === 'unlocked') return unlocked.has(r.id);
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Collection 🍽️</Text>
        <Text style={styles.subtitle}>
          {unlocked.size} of {recipes.length} unlocked
        </Text>
      </View>

      <View style={styles.filterRowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count =
              f.id === 'all' ? recipes.length
              : f.id === 'island' ? recipes.filter((r) => !r.isBonus).length
              : f.id === 'bonus' ? recipes.filter((r) => r.isBonus).length
              : unlocked.size;
            return (
              <Pressable
                key={f.id}
                onPress={() => {
                  hapticLight();
                  setFilter(f.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>
                  {f.emoji} {f.label}
                </Text>
                <View style={[styles.filterCountPill, active && styles.filterCountPillActive]}>
                  <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <LinearGradient
          pointerEvents="none"
          colors={[BG.warm, 'rgba(255,251,240,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterRowFadeLeft}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,251,240,0)', BG.warm]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterRowFadeRight}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.LG, paddingTop: SPACING.SM, paddingBottom: SPACING.XXL }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥲</Text>
            <Text style={styles.emptyTitle}>No recipes here yet</Text>
            <Text style={styles.emptyBody}>Try a different filter.</Text>
          </View>
        )}
        {filtered.map((r) => {
          const isUnlocked = unlocked.has(r.id);
          return (
            <Pressable
              key={r.id}
              onPress={() => {
                hapticLight();
                router.push(`/recipe/${r.id}`);
              }}
              style={({ pressed }) => [
                styles.card,
                SHADOW.CARD,
                pressed && { opacity: 0.92 },
                !isUnlocked && { opacity: 0.7 },
              ]}
            >
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>{r.emoji}</Text>
                {!isUnlocked && <Text style={styles.imageLockBadge}>🔒</Text>}
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{r.title}</Text>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text>
                <View style={styles.tagRow}>
                  {r.islandName && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{r.islandName}</Text>
                    </View>
                  )}
                  {r.isBonus && (
                    <View style={[styles.tag, { backgroundColor: PRO[100] }]}>
                      <Text style={[styles.tagText, { color: PRO[800] }]}>⭐ Bonus</Text>
                    </View>
                  )}
                  {!isUnlocked && (
                    <View style={[styles.tag, styles.lockTag]}>
                      <Text style={[styles.tagText, { color: '#FFFFFF' }]}>🔒 Locked</Text>
                    </View>
                  )}
                  {isUnlocked && (
                    <View style={[styles.tag, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.tagText, { color: '#15803D' }]}>✅ Unlocked</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG.warm },
  header: { paddingHorizontal: SPACING.LG, paddingTop: SPACING.MD },
  title: { fontFamily: FONT.brand, fontSize: 28, color: TEXT.DEFAULT },
  subtitle: { fontFamily: FONT.body, color: TEXT.tertiary, fontSize: 14, marginTop: 2 },
  filterRowWrapper: { position: 'relative' },
  filterRow: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.SM,
    gap: SPACING.XS,
  },
  filterRowFadeLeft: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SPACING.LG },
  filterRowFadeRight: { position: 'absolute', top: 0, right: 0, bottom: 0, width: SPACING.LG },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 8,
    borderRadius: BORDERS.RADIUS.FULL,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: PRIMARY[500], borderColor: PRIMARY[600] },
  filterText: { fontFamily: FONT.bodyBold, fontSize: 14, color: TEXT.tertiary },
  filterTextActive: { color: '#FFFFFF' },
  filterCountPill: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDERS.RADIUS.FULL,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountPillActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterCountText: { fontFamily: FONT.bodyBold, fontSize: 12, color: TEXT.tertiary },
  filterCountTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.XL2,
    overflow: 'hidden',
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: BG.muted,
  },
  imageWrap: {
    backgroundColor: '#FFFEF8',
    height: 140,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: { fontSize: 72 },
  imageLockBadge: { position: 'absolute', top: SPACING.SM, right: SPACING.SM, fontSize: 22 },
  body: { padding: SPACING.LG },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontFamily: FONT.brand, fontSize: 20, color: TEXT.DEFAULT, flex: 1 },
  cardDesc: { fontFamily: FONT.body, color: TEXT.tertiary, fontSize: 14, marginTop: SPACING.XS, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.XS, marginTop: SPACING.SM },
  tag: { backgroundColor: '#FEF3C7', paddingHorizontal: SPACING.SM, paddingVertical: 4, borderRadius: BORDERS.RADIUS.FULL },
  tagText: { fontFamily: FONT.bodyBold, fontSize: 12, color: '#92400E' },
  lockTag: { backgroundColor: '#9CA3AF' },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XL,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.LARGE,
    borderWidth: 1,
    borderColor: BG.muted,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: FONT.brand, fontSize: 18, color: TEXT.DEFAULT, marginTop: SPACING.SM },
  emptyBody: { fontFamily: FONT.body, fontSize: 14, color: TEXT.tertiary, marginTop: 4, textAlign: 'center' },
});
