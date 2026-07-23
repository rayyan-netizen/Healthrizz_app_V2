import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandButton } from '@components/brand/BrandButton';
import { useOnboardingStore } from '@stores/onboardingStore';
import { useOnboardingCompleteStore } from '@stores/onboardingCompleteStore';
import {
  calculatePersonaScores,
  getRecommendedHabit,
  type RecommendedHabit,
} from '@core/personas/persona-matching';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
  ERROR,
} from '@lib/theme';
import { hapticSuccess, hapticSelection } from '@lib/haptic';
import type { GoalType } from '@core/types/persona';

const HABIT_MASCOT: Record<RecommendedHabit, ImageSourcePropType> = {
  hydro: require('@assets/brand/mascots/hydro.png'),
  phyto: require('@assets/brand/mascots/phyto.png'),
  pro: require('@assets/brand/mascots/pro.png'),
};

const ALL_GOALS: {
  id: GoalType;
  habitKey: RecommendedHabit;
  title: string;
  emoji: string;
  tagline: string;
}[] = [
  { id: 'hydro_rizzler', habitKey: 'hydro', title: 'Hydro Rizzler', emoji: '💧', tagline: 'Drink more water every day' },
  { id: 'phyto_rizzler', habitKey: 'phyto', title: 'Phyto Rizzler', emoji: '🌈', tagline: 'Eat colorful fruits & veggies' },
  { id: 'pro_rizzler', habitKey: 'pro', title: 'Pro Rizzler', emoji: '💪', tagline: 'Power up with protein' },
];

export default function Goals() {
  const router = useRouter();
  const markOnboardingComplete = useOnboardingCompleteStore((s) => s.markComplete);
  const onboarding = useOnboardingStore();
  const storedGoals = onboarding.selectedGoals.slice(0, 2);
  const [selected, setSelected] = useState<Set<GoalType>>(
    new Set(storedGoals)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (g: GoalType) => {
    hapticSelection();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else if (next.size < 2) next.add(g);
      return next;
    });
  };

  const matches = useMemo(
    () => calculatePersonaScores(onboarding.responses),
    [onboarding.responses]
  );

  const recommendedHabit = useMemo(
    () => getRecommendedHabit(onboarding.responses),
    [onboarding.responses]
  );

  // Pre-select the recommended goal on first mount when store is empty or over-full.
  React.useEffect(() => {
    if (onboarding.selectedGoals.length === 0 || onboarding.selectedGoals.length > 2) {
      const match = ALL_GOALS.find((g) => g.habitKey === recommendedHabit);
      if (match) setSelected(new Set([match.id]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = () => {
    if (selected.size === 0) {
      setError('Pick at least one goal to start');
      return;
    }
    setError(null);
    setSaving(true);

    // NOTE: this is local-only for now — no `children`/`onboarding_responses`
    // row gets created in Supabase. The persona/goal computation above still
    // runs against real answers; only the persistence step is deferred until
    // the backend is wired back in.
    hapticSuccess();
    markOnboardingComplete();
    onboarding.reset();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Pick 1 or 2 streaks 🎯</Text>
            <Text style={styles.subtitle}>
              Based on your answers we picked a great starting point for{' '}
              {onboarding.nickname || 'your kid'}. You can always change it later.
            </Text>

            {ALL_GOALS.map((g) => {
              const isSelected = selected.has(g.id);
              const isRecommended = g.habitKey === recommendedHabit;
              return (
                <Pressable
                  key={g.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => toggle(g.id)}
                  style={({ pressed }) => [
                    styles.option,
                    isRecommended && styles.optionRecommended,
                    isSelected && styles.optionSelected,
                    pressed && { opacity: 0.82 },
                  ]}
                >
                  <Image source={HABIT_MASCOT[g.habitKey]} style={styles.mascot} resizeMode="contain" />
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {g.title}
                      </Text>
                      {isRecommended && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>✨ Best match</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optionSubtitle}>{g.tagline}</Text>
                  </View>
                  <View style={[styles.corner, isSelected && styles.cornerSelected]}>
                    <Text style={[styles.cornerText, isSelected && styles.cornerTextSelected]}>
                      {isSelected ? '✓' : '+'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {error && <Text style={styles.error}>{error}</Text>}

            <BrandButton
              label={saving ? 'Setting up…' : "Let's go! 🎮"}
              variant="primary"
              size="xl"
              fullWidth
              onPress={onCreate}
              loading={saving}
              disabled={selected.size === 0}
              style={{ marginTop: SPACING.LG }}
            />
          </ScrollView>
        </SafeAreaView>
      </BrandBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.LG, paddingBottom: SPACING.XL },
  title: {
    fontFamily: FONT.brand,
    fontSize: 28,
    color: TEXT.DEFAULT,
  },
  subtitle: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.tertiary,
    marginTop: SPACING.SM,
    marginBottom: SPACING.LG,
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    borderRadius: BORDERS.RADIUS.XL,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    minHeight: 88,
    ...SHADOW.CARD,
  },
  optionRecommended: {
    borderColor: PRIMARY[300],
    backgroundColor: PRIMARY[50],
  },
  optionSelected: {
    borderColor: SECONDARY[500],
    backgroundColor: SECONDARY[50],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  badge: {
    backgroundColor: PRIMARY[100],
    borderRadius: BORDERS.RADIUS.FULL,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FONT.bodyBold,
    fontSize: 11,
    color: PRIMARY[700],
  },
  mascot: { width: 64, height: 64, marginRight: SPACING.MD },
  optionTitle: {
    fontFamily: FONT.brand,
    fontSize: 20,
    color: TEXT.DEFAULT,
  },
  optionTitleSelected: {
    color: SECONDARY[700],
  },
  optionSubtitle: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: TEXT.tertiary,
    marginTop: 2,
  },
  corner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.SM,
    backgroundColor: '#F9FAFB',
  },
  cornerSelected: {
    borderColor: SECONDARY[500],
    backgroundColor: SECONDARY[500],
  },
  cornerText: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  cornerTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  error: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: ERROR[500],
    marginTop: SPACING.MD,
  },
});
