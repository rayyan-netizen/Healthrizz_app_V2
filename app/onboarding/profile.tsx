import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandCard } from '@components/brand/BrandCard';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { Input } from '@components/ui/Input';
import { useOnboardingStore, type Companion } from '@stores/onboardingStore';
import { useCompanionStore } from '@stores/companionStore';
import { ASSETS } from '@lib/assets';
import { TEXT, SPACING, FONT, ERROR, PRIMARY, BORDERS, SHADOW } from '@lib/theme';
import { hapticLight } from '@lib/haptic';

const CHARACTERS: { id: Companion; name: string; image: ImageSourcePropType }[] = [
  { id: 'apple', name: 'Apple', image: ASSETS.brand.companions.apple as ImageSourcePropType },
  { id: 'banana', name: 'Banana', image: ASSETS.brand.companions.banana as ImageSourcePropType },
];

export default function Profile() {
  const router = useRouter();
  const nickname = useOnboardingStore((s) => s.nickname);
  const setNickname = useOnboardingStore((s) => s.setNickname);
  const companion = useOnboardingStore((s) => s.companion);
  const setCompanionInOnboarding = useOnboardingStore((s) => s.setCompanion);
  const persistCompanion = useCompanionStore((s) => s.setCompanion);
  const setCompanion = (c: Companion) => {
    setCompanionInOnboarding(c);
    persistCompanion(c);
  };
  const [error, setError] = React.useState<string | null>(null);

  const onContinue = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError('Nickname needs at least 2 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Keep nicknames short — under 20 characters.');
      return;
    }
    setError(null);
    setNickname(trimmed);
    router.push('/onboarding/age');
  };

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Mascot animation="wave" size={120} />
            </View>

            <BrandCard variant="elevated">
              <Text style={styles.title}>Pick a nickname</Text>
              <Text style={styles.subtitle}>
                What should we call your kid in the app? (No real names — just a
                fun nickname.)
              </Text>

              <Input
                label="Nickname"
                value={nickname}
                onChangeText={setNickname}
                placeholder="e.g. Captain Snack"
                autoCapitalize="words"
                autoFocus
                maxLength={20}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              {/* Character picker */}
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose your buddy! 🎨</Text>
                <Text style={styles.pickerSubtitle}>
                  Pick the character that walks with you on adventures.
                </Text>
              </View>

              <View style={styles.pickerGrid}>
                {CHARACTERS.map((c) => {
                  const selected = companion === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        hapticLight();
                        setCompanion(c.id);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Choose ${c.name}`}
                      style={{ width: '48%' }}
                    >
                      <View
                        style={[
                          styles.pickerCard,
                          selected && styles.pickerCardSelected,
                          selected && SHADOW.CARD,
                        ]}
                      >
                        <Image source={c.image} style={styles.pickerImg} resizeMode="contain" />
                        <View style={styles.pickerNameWrap}>
                          <Text style={styles.pickerName}>{c.name}</Text>
                        </View>
                        {selected && (
                          <View style={styles.pickerCheck}>
                            <Text style={styles.pickerCheckText}>✓</Text>
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
  scroll: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  hero: { alignItems: 'center', paddingTop: SPACING.MD, paddingBottom: SPACING.MD },
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
  error: {
    fontFamily: FONT.body,
    color: ERROR[500],
    fontSize: 12,
  },
  pickerHeader: {
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
    alignItems: 'center',
  },
  pickerTitle: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: TEXT.DEFAULT,
  },
  pickerSubtitle: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  pickerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  pickerCard: {
    borderRadius: BORDERS.RADIUS.LARGE,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  pickerCardSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  pickerImg: {
    width: '100%',
    height: 140,
  },
  pickerNameWrap: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFFEE',
  },
  pickerName: {
    textAlign: 'center',
    fontFamily: FONT.bodyBold,
    color: TEXT.DEFAULT,
    fontSize: 14,
  },
  pickerCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCheckText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});
