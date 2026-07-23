import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandCard } from '@components/brand/BrandCard';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { useOnboardingStore } from '@stores/onboardingStore';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  ERROR,
} from '@lib/theme';
import { hapticLight, hapticSuccess } from '@lib/haptic';

const PRIVACY_POLICY_VERSION = '1.0';
const TERMS_VERSION = '1.0';

const s = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.LG, paddingBottom: SPACING.XL },
  hero: { alignItems: 'center', paddingTop: SPACING.MD },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.SM,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  dotActive: { backgroundColor: PRIMARY[500] },
  title: {
    fontFamily: FONT.brand,
    fontSize: 24,
    color: TEXT.DEFAULT,
    marginBottom: SPACING.MD,
  },
  body: {
    fontFamily: FONT.body,
    fontSize: 15,
    color: TEXT.DEFAULT,
    lineHeight: 22,
    marginBottom: SPACING.SM,
  },
  bullet: {
    fontFamily: FONT.body,
    fontSize: 15,
    color: TEXT.DEFAULT,
    lineHeight: 24,
    marginLeft: SPACING.SM,
  },
  callout: {
    borderRadius: BORDERS.RADIUS.MEDIUM,
    borderWidth: 2,
    padding: SPACING.MD,
    marginVertical: SPACING.SM,
  },
  calloutHeader: { fontFamily: FONT.brand, fontSize: 15, marginBottom: 4 },
  calloutBody: { fontFamily: FONT.body, fontSize: 13, lineHeight: 18 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkOn: { backgroundColor: PRIMARY[500], borderColor: PRIMARY[600] },
  checkMark: { color: '#FFFFFF', fontWeight: '900' as const, fontSize: 14 },
  checkText: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: TEXT.DEFAULT,
    lineHeight: 18,
    flex: 1,
  },
  error: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: ERROR[500],
    marginTop: SPACING.SM,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  backBtn: { paddingHorizontal: SPACING.SM, paddingVertical: SPACING.SM },
  backBtnText: {
    fontFamily: FONT.bodyBold,
    color: TEXT.tertiary,
    fontSize: 16,
  },
});

interface Step {
  id: string;
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Parental Consent Required',
    body: (
      <>
        <Text style={s.body}>
          Before your child can use Health Rizz, we need your verified consent.
          This is required by COPPA (the Children's Online Privacy Protection
          Act).
        </Text>
        <View style={[s.callout, { backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }]}>
          <Text style={[s.calloutHeader, { color: PRIMARY[800] }]}>What is COPPA?</Text>
          <Text style={[s.calloutBody, { color: PRIMARY[700] }]}>
            COPPA protects children under 13 by requiring parental consent
            before any personal information is collected.
          </Text>
        </View>
      </>
    ),
  },
  {
    id: 'what',
    title: 'What we collect',
    body: (
      <>
        <Text style={s.body}>
          To run the app, we collect:
        </Text>
        <Text style={s.bullet}>• Your child's nickname (not their real name)</Text>
        <Text style={s.bullet}>• Their age (to tune content)</Text>
        <Text style={s.bullet}>• Lesson progress, quiz scores, habit completion</Text>
        <Text style={s.bullet}>• Streaks and badges</Text>
        <View style={[s.callout, { backgroundColor: SECONDARY[50], borderColor: SECONDARY[200] }]}>
          <Text style={[s.calloutHeader, { color: SECONDARY[800] }]}>We do NOT collect</Text>
          <Text style={[s.calloutBody, { color: SECONDARY[700] }]}>
            Real names, addresses, phone numbers, photos, location, or anything
            that could identify your child outside the app.
          </Text>
        </View>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use this',
    body: (
      <>
        <Text style={s.body}>
          We use the information only to:
        </Text>
        <Text style={s.bullet}>• Show personalized lessons and recipes</Text>
        <Text style={s.bullet}>• Track learning progress and streaks</Text>
        <Text style={s.bullet}>• Save game achievements on your device</Text>
        <Text style={s.body}>
          We do not sell or share your child's data with third parties for
          advertising. There are no ads in this app.
        </Text>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: (
      <>
        <Text style={s.body}>You can at any time:</Text>
        <Text style={s.bullet}>• Review what we have stored on your child</Text>
        <Text style={s.bullet}>• Delete your child's profile and all data</Text>
        <Text style={s.bullet}>• Revoke this consent (which removes the profile)</Text>
        <Text style={s.body}>
          Visit Parent Settings (the gear icon, behind a math gate) to manage
          everything.
        </Text>
      </>
    ),
  },
];

export default function Consent() {
  const router = useRouter();
  const setConsent = useOnboardingStore((st) => st.setConsent);
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = () => {
    hapticLight();
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    if (!agreed) {
      setError('Please confirm that you have read and consent.');
      return;
    }
    hapticSuccess();
    setConsent({
      agreed: true,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      termsVersion: TERMS_VERSION,
      consentedAt: new Date().toISOString(),
    });
    router.push('/onboarding/profile');
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={s.scroll}>
            <View style={s.hero}>
              <Mascot animation="pulse" size={100} />
            </View>

            {/* Step dots */}
            <View style={s.dotsRow}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i === step && s.dotActive]}
                />
              ))}
            </View>

            <BrandCard variant="elevated">
              <Text style={s.title}>{current.title}</Text>
              {current.body}

              {isLast && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setError(null);
                    setAgreed((v) => !v);
                  }}
                  style={s.checkRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agreed }}
                >
                  <View style={[s.check, agreed && s.checkOn]}>
                    {agreed && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.checkText}>
                    I am the parent/guardian and I consent on behalf of my
                    child. I have read the privacy policy (v{PRIVACY_POLICY_VERSION})
                    and terms (v{TERMS_VERSION}).
                  </Text>
                </Pressable>
              )}

              {error && <Text style={s.error}>{error}</Text>}

              <View style={s.actions}>
                <Pressable onPress={back} style={s.backBtn} hitSlop={12}>
                  <Text style={s.backBtnText}>‹ Back</Text>
                </Pressable>
                <BrandButton
                  label={isLast ? 'I consent ›' : 'Next ›'}
                  variant="primary"
                  size="lg"
                  fullWidth={false}
                  onPress={next}
                  disabled={isLast && !agreed}
                  style={{ flex: 1, marginLeft: SPACING.MD }}
                />
              </View>
            </BrandCard>
          </ScrollView>
        </SafeAreaView>
      </BrandBackground>
    </View>
  );
}

