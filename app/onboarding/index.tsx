import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandCard } from '@components/brand/BrandCard';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { useOnboardingStore } from '@stores/onboardingStore';
import { TEXT, SPACING, FONT, BORDERS, PRIMARY } from '@lib/theme';

export default function PrivacyWelcome() {
  const router = useRouter();
  const acceptPrivacy = useOnboardingStore((s) => s.acceptPrivacy);

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Mascot animation="float" size={160} />
              <Text style={styles.title}>Welcome to Health Rizz!</Text>
              <Text style={styles.subtitle}>
                A fun, parent-led nutrition adventure for your kid 🍋
              </Text>
            </View>

            <BrandCard variant="elevated" style={styles.card}>
              <Text style={styles.privacyTitle}>How we keep your kid safe</Text>
              <View style={styles.divider} />
              <Text style={styles.privacyItem}>
                <Text style={styles.bullet}>👨‍👩‍👧</Text>{'  '}You set up the account; only you can change settings.
              </Text>
              <Text style={styles.privacyItem}>
                <Text style={styles.bullet}>😎</Text>{'  '}Kids use a nickname — no real names needed.
              </Text>
              <Text style={styles.privacyItem}>
                <Text style={styles.bullet}>🛡️</Text>{'  '}No third-party ads or tracking. Apple Kids Category compliant.
              </Text>
              <Text style={styles.privacyItem}>
                <Text style={styles.bullet}>📥</Text>{'  '}Data stays in your account; export or delete anytime.
              </Text>
            </BrandCard>

            <BrandButton
              label="Continue"
              variant="primary"
              size="xl"
              fullWidth
              style={{ marginTop: SPACING.LG }}
              onPress={() => {
                acceptPrivacy();
                router.push('/onboarding/consent');
              }}
            />
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
  hero: { alignItems: 'center', paddingTop: SPACING.MD, paddingBottom: SPACING.LG },
  title: {
    fontFamily: FONT.brand,
    fontSize: 32,
    color: TEXT.DEFAULT,
    textAlign: 'center',
    marginTop: SPACING.MD,
  },
  subtitle: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.tertiary,
    textAlign: 'center',
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
  },
  card: { marginTop: SPACING.MD },
  privacyTitle: {
    fontFamily: FONT.brand,
    fontSize: 20,
    color: TEXT.DEFAULT,
  },
  divider: {
    height: 2,
    backgroundColor: PRIMARY[100],
    borderRadius: 1,
    marginVertical: SPACING.SM,
  },
  privacyItem: {
    fontFamily: FONT.body,
    fontSize: 15,
    color: TEXT.secondary,
    marginVertical: SPACING.SM,
    lineHeight: 22,
  },
  bullet: { fontSize: 18 },
});
