import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandCard } from '@components/brand/BrandCard';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { useOnboardingStore } from '@stores/onboardingStore';
import { TEXT, SPACING, FONT, PRIMARY, BORDERS, SHADOW } from '@lib/theme';
import { hapticSelection } from '@lib/haptic';

const AGES: { value: number; emoji: string }[] = [
  { value: 6,  emoji: '🫐' },
  { value: 7,  emoji: '🍎' },
  { value: 8,  emoji: '🥕' },
  { value: 9,  emoji: '🥦' },
  { value: 10, emoji: '🍊' },
  { value: 11, emoji: '🍇' },
  { value: 12, emoji: '🌈' },
];

export default function Age() {
  const router = useRouter();
  const stored = useOnboardingStore((s) => s.age);
  const setAge = useOnboardingStore((s) => s.setAge);
  const [selected, setSelected] = useState<number | null>(stored ?? null);

  const pick = (age: number) => {
    hapticSelection();
    setSelected(age);
  };

  const onContinue = () => {
    if (!selected) return;
    setAge(selected);
    router.push('/onboarding/questions');
  };

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Mascot animation="float" size={120} />
            </View>

            <BrandCard variant="elevated">
              <Text style={styles.title}>How old are you?</Text>
              <Text style={styles.subtitle}>
                Tap your age — we'll tune things just right.
              </Text>

              <View style={styles.stack}>
                {AGES.map(({ value, emoji }) => {
                  const isSelected = selected === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => pick(value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Age ${value}`}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View
                        style={[
                          styles.tile,
                          isSelected && styles.tileSelected,
                          isSelected && SHADOW.CARD,
                        ]}
                      >
                        <Text style={styles.tileEmoji}>{emoji}</Text>
                        <Text style={[styles.tileAge, isSelected && styles.tileAgeSelected]}>
                          {value}
                        </Text>
                        <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                          years old
                        </Text>
                        {isSelected && (
                          <View style={styles.check}>
                            <Text style={styles.checkText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <BrandButton
                label="Next ›"
                variant="primary"
                size="xl"
                fullWidth
                onPress={onContinue}
                disabled={!selected}
                style={{ marginTop: SPACING.LG }}
              />
            </BrandCard>
          </ScrollView>
        </SafeAreaView>
      </BrandBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.LG, paddingBottom: SPACING.XL },
  hero: { alignItems: 'center', paddingTop: SPACING.MD, paddingBottom: SPACING.MD },
  title: { fontFamily: FONT.brand, fontSize: 28, color: TEXT.DEFAULT },
  subtitle: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.tertiary,
    marginTop: SPACING.SM,
    marginBottom: SPACING.LG,
    lineHeight: 22,
  },
  stack: {
    gap: SPACING.SM,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDERS.RADIUS.LARGE,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    gap: SPACING.MD,
  },
  tileSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  tileEmoji: {
    fontSize: 32,
    width: 40,
    textAlign: 'center',
  },
  tileAge: {
    fontFamily: FONT.brand,
    fontSize: 22,
    color: TEXT.DEFAULT,
  },
  tileAgeSelected: {
    color: PRIMARY[700],
  },
  tileLabel: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: TEXT.tertiary,
    flex: 1,
  },
  tileLabelSelected: {
    color: PRIMARY[500],
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
