import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandCard } from '@components/brand/BrandCard';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { useOnboardingStore } from '@stores/onboardingStore';
import { useOnboardingCompleteStore } from '@stores/onboardingCompleteStore';
import { calculatePersonaScores, suggestGoals } from '@core/personas/persona-matching';
import { PERSONA_DISPLAY } from '@core/types/persona';
import { ASSETS } from '@lib/assets';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  SPACING,
  FONT,
} from '@lib/theme';

export default function PersonaResult() {
  const router = useRouter();
  const responses = useOnboardingStore((s) => s.responses);
  const setGoals = useOnboardingStore((s) => s.setGoals);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const markOnboardingComplete = useOnboardingCompleteStore((s) => s.markComplete);

  const matches = useMemo(() => calculatePersonaScores(responses), [responses]);
  const primary = matches[0];
  const display = primary ? PERSONA_DISPLAY[primary.persona_id] : null;

  const goals = useMemo(
    () =>
      primary
        ? suggestGoals(
            primary.persona_id,
            matches[1]?.score && matches[1].score >= primary.score * 0.5
              ? matches[1].persona_id
              : undefined
          )
        : [],
    [primary, matches]
  );

  const onContinue = () => {
    // Goal-picking + backend profile creation (old goals.tsx) is deferred
    // until Supabase is wired back in — for now, onboarding ends here.
    setGoals(goals.map((g) => g.goal_type));
    markOnboardingComplete();
    resetOnboarding();
    router.dismissTo('/');
  };

  if (!primary || !display) {
    return (
      <View style={{ flex: 1 }}>
        <BrandBackground>
          <SafeAreaView style={styles.fallback}>
            <Text style={styles.title}>Hmm, we need more answers</Text>
            <BrandButton
              label="Go back"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.back()}
            />
          </SafeAreaView>
        </BrandBackground>
      </View>
    );
  }

  // Pick mascot for this persona
  const personaMascot =
    primary.persona_id === 'dry_dino' || primary.persona_id === 'gut_guardian'
      ? ASSETS.brand.mascots.hydro
      : primary.persona_id === 'sugar_sprinter' || primary.persona_id === 'lunchbox_influencer'
      ? ASSETS.brand.mascots.phyto
      : primary.persona_id === 'mini_muscle' || primary.persona_id === 'rushed_muncher'
      ? ASSETS.brand.mascots.pro
      : ASSETS.brand.mascots.main;

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Mascot source={personaMascot} animation="pulse" size={160} />
              <Text style={styles.intro}>You're a…</Text>
              <Text style={styles.bigEmoji}>{display.emoji}</Text>
              <Text style={styles.personaTitle}>{display.title}</Text>
              <Text style={styles.tagline}>{display.tagline}</Text>
            </View>

            <BrandCard variant="elevated" style={{ marginTop: SPACING.MD }}>
              <Text style={styles.sectionTitle}>Your match score</Text>
              <Text style={styles.score}>{Math.round(primary.score)}%</Text>
              <Text style={styles.scoreCaption}>
                Based on your answers — we'll tailor lessons, recipes, and games to fit you.
              </Text>
            </BrandCard>

            <BrandCard style={{ marginTop: SPACING.MD }}>
              <Text style={styles.sectionTitle}>Suggested goals</Text>
              {goals.map((g) => (
                <Text key={g.goal_type} style={styles.goalItem}>
                  • {goalLabel(g.goal_type)}
                </Text>
              ))}
            </BrandCard>

            <BrandButton
              label="Looks good! ✨"
              variant="primary"
              size="xl"
              fullWidth
              onPress={onContinue}
              style={{ marginTop: SPACING.LG }}
            />
          </ScrollView>
        </SafeAreaView>
      </BrandBackground>
    </View>
  );
}

function goalLabel(goal: string): string {
  switch (goal) {
    case 'hydro_rizzler':
      return 'Hydro Rizzler — drink more water';
    case 'phyto_rizzler':
      return 'Phyto Rizzler — eat more colorful plants';
    case 'pro_rizzler':
      return 'Pro Rizzler — power up with protein';
    default:
      return goal;
  }
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.LG, paddingBottom: SPACING.XL },
  fallback: { flex: 1, padding: SPACING.LG, justifyContent: 'center' },
  hero: { alignItems: 'center', paddingTop: SPACING.MD },
  intro: {
    fontFamily: FONT.body,
    color: TEXT.tertiary,
    fontSize: 16,
    marginTop: SPACING.MD,
  },
  bigEmoji: { fontSize: 80, marginVertical: SPACING.SM },
  personaTitle: {
    fontFamily: FONT.brand,
    fontSize: 32,
    color: TEXT.DEFAULT,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.tertiary,
    textAlign: 'center',
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
  },
  title: { fontFamily: FONT.brand, fontSize: 24, color: TEXT.DEFAULT, textAlign: 'center', marginBottom: SPACING.LG },
  sectionTitle: {
    fontFamily: FONT.brand,
    fontSize: 20,
    color: TEXT.DEFAULT,
    marginBottom: SPACING.SM,
  },
  score: {
    fontFamily: FONT.brand,
    fontSize: 48,
    color: SECONDARY[500],
  },
  scoreCaption: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: TEXT.tertiary,
    marginTop: SPACING.XS,
  },
  goalItem: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.DEFAULT,
    marginVertical: SPACING.XS,
  },
});
