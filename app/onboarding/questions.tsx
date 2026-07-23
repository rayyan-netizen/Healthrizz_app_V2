import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from '@components/brand/BrandBackground';
import { BrandButton } from '@components/brand/BrandButton';
import { useOnboardingStore } from '@stores/onboardingStore';
import { QUESTIONS } from '@core/personas/questions';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
} from '@lib/theme';
import { hapticSelection } from '@lib/haptic';

export default function Questions() {
  const router = useRouter();
  const responses = useOnboardingStore((s) => s.responses);
  const setResponse = useOnboardingStore((s) => s.setResponse);
  const [stepIdx, setStepIdx] = useState(0);

  const q = QUESTIONS[stepIdx];
  const total = QUESTIONS.length;

  const current = useMemo(() => {
    const r = responses.find((x) => x.question_id === q.id);
    if (!r) return q.type === 'multi' ? [] : '';
    return r.response;
  }, [q, responses]);

  const setSingle = (v: string) => {
    hapticSelection();
    setResponse(q.id, v);
  };
  const toggleMulti = (v: string) => {
    hapticSelection();
    const list = Array.isArray(current) ? (current as string[]) : [];
    const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
    setResponse(q.id, next);
  };

  const canProceed =
    q.type === 'multi'
      ? Array.isArray(current) && (current as string[]).length > 0
      : typeof current === 'string' && current.length > 0;

  const next = () => {
    if (stepIdx < total - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      router.push('/onboarding/persona');
    }
  };

  const back = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
    else router.back();
  };

  const progress = ((stepIdx + 1) / total) * 100;

  return (
    <View style={{ flex: 1 }}>
      <BrandBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Pressable onPress={back} hitSlop={16}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
            <Text style={styles.progress}>
              {stepIdx + 1} / {total}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: SPACING.LG }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.question}>{q.question}</Text>
            {q.helper && <Text style={styles.helper}>{q.helper}</Text>}

            <View style={{ height: SPACING.LG }} />

            {q.options.map((opt) => {
              const selected =
                q.type === 'multi'
                  ? Array.isArray(current) && (current as string[]).includes(opt.value)
                  : current === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() =>
                    q.type === 'multi' ? toggleMulti(opt.value) : setSingle(opt.value)
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View style={[styles.option, selected && styles.optionSelected]}>
                    <Text style={[styles.label, selected && styles.labelSelected]}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <BrandButton
              label={stepIdx === total - 1 ? 'See my Rizzler! 🌟' : 'Next ›'}
              variant="primary"
              size="xl"
              fullWidth
              onPress={next}
              disabled={!canProceed}
            />
          </View>
        </SafeAreaView>
      </BrandBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
  },
  back: {
    fontFamily: FONT.bodyBold,
    color: PRIMARY[600],
    fontSize: 16,
  },
  progress: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: TEXT.tertiary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.SM,
    borderRadius: BORDERS.RADIUS.FULL,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY[500],
  },
  question: {
    fontFamily: FONT.brand,
    fontSize: 24,
    color: TEXT.DEFAULT,
  },
  helper: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: TEXT.tertiary,
    marginTop: SPACING.SM,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#9CA3AF',
    borderRadius: BORDERS.RADIUS.XL,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    minHeight: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  optionSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  emoji: { fontSize: 28, marginRight: SPACING.MD },
  label: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: TEXT.DEFAULT,
    flex: 1,
  },
  labelSelected: {
    color: PRIMARY[700],
  },
  footer: {
    padding: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
});
