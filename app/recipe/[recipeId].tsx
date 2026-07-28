import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChildStore } from '@stores/childStore';
import { getRecipeById, fetchUnlockedRecipeIds, type RecipeRow } from '@core/recipes/api';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { PRIMARY, PRO, TEXT, BG, SPACING, FONT, BORDERS, SHADOW } from '@lib/theme';

export default function RecipeDetail() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);
  const [recipe, setRecipe] = useState<RecipeRow | null | undefined>(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!recipeId || !childId) return;
    const r = getRecipeById(recipeId) ?? null;
    const u = await fetchUnlockedRecipeIds(childId);
    setRecipe(r);
    setUnlocked(r ? u.has(r.id) : false);
    setLoading(false);
  }, [recipeId, childId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>Recipe not found</Text>
        <BrandButton label="Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Recipes</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.XXL }}>
        <View style={styles.hero}>
          <Text style={[styles.heroEmoji, !unlocked && styles.heroEmojiLocked]}>{recipe.emoji}</Text>

          {!unlocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockTitle}>Recipe locked</Text>
              <Text style={styles.lockBody}>
                {recipe.islandName
                  ? `Complete ${recipe.islandName} on the map to unlock this recipe!`
                  : 'Keep exploring the map to unlock this recipe!'}
              </Text>
              <BrandButton
                label="Go to map"
                variant="primary"
                size="lg"
                onPress={() => router.push('/map')}
                style={{ marginTop: SPACING.MD }}
              />
            </View>
          )}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.islandName && <Text style={styles.islandName}>From {recipe.islandName}</Text>}
          {recipe.isBonus && (
            <View style={styles.bonusPill}>
              <Text style={styles.bonusPillText}>⭐ Bonus recipe</Text>
            </View>
          )}
          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {unlocked && (
          <View style={styles.imageFirstBlock}>
            <View style={styles.imageFirstCard}>
              <Mascot animation="float" size={80} />
              <Text style={styles.imageFirstTitle}>Full recipe card coming soon!</Text>
              <Text style={styles.imageFirstBody}>
                Ask a grown-up to look up "{recipe.title}" together and give it a try.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG.warm,
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  header: { paddingHorizontal: SPACING.LG, paddingTop: SPACING.SM, paddingBottom: SPACING.SM },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { fontSize: 28, color: PRIMARY[600], marginRight: 4 },
  backText: { fontFamily: FONT.bodyBold, fontSize: 16, color: PRIMARY[600] },
  hero: {
    width: '100%',
    height: 260,
    backgroundColor: '#FFFEF8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroEmoji: { fontSize: 120 },
  heroEmojiLocked: { opacity: 0.35 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  lockIcon: { fontSize: 48, marginBottom: SPACING.SM },
  lockTitle: {
    fontFamily: FONT.brand,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  lockBody: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: '#FFFFFFE6',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  titleBlock: { paddingHorizontal: SPACING.LG, paddingTop: SPACING.LG, gap: 4 },
  title: { fontFamily: FONT.brand, fontSize: 26, color: TEXT.DEFAULT, lineHeight: 32 },
  islandName: { fontFamily: FONT.bodyBold, color: PRIMARY[700], fontSize: 14 },
  bonusPill: {
    alignSelf: 'flex-start',
    backgroundColor: PRO[100],
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderRadius: BORDERS.RADIUS.FULL,
    marginTop: 4,
  },
  bonusPillText: { fontFamily: FONT.bodyBold, fontSize: 11, color: PRO[800] },
  description: { fontFamily: FONT.body, color: TEXT.tertiary, fontSize: 15, marginTop: SPACING.SM, lineHeight: 22 },
  imageFirstBlock: { padding: SPACING.LG },
  imageFirstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.XL2,
    padding: SPACING.LG,
    alignItems: 'center',
    gap: SPACING.SM,
    borderWidth: 2,
    borderColor: PRIMARY[100],
    ...SHADOW.CARD,
  },
  imageFirstTitle: { fontFamily: FONT.brand, fontSize: 20, color: TEXT.DEFAULT, textAlign: 'center' },
  imageFirstBody: { fontFamily: FONT.body, fontSize: 14, color: TEXT.tertiary, textAlign: 'center', lineHeight: 20 },
  error: { fontFamily: FONT.bodyBold, color: '#EF4444' },
});
