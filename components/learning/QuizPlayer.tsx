import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandButton } from '@components/brand/BrandButton';
import { BrandCard } from '@components/brand/BrandCard';
import { CelebrationModal, type Performance } from '@components/celebrations/CelebrationModal';
import { computeQuizResult } from '@core/learning/quiz-scoring';
import {
  getRizzlerName,
  getQuizHintForQuestion,
} from '@core/map/data/submapEncouragement';
import { rizzlerForTopic } from '@lib/assets';
import {
  PRIMARY,
  SECONDARY,
  TEXT,
  BG,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
} from '@lib/theme';
import { hapticSelection, hapticSuccess, hapticError } from '@lib/haptic';
import type { QuizQuestionRow } from '@core/learning/api';

interface Props {
  questions: QuizQuestionRow[];
  title: string;
  topicKey?: string;
  onComplete: (result: {
    stars: number;
    passed: boolean;
    correctCount: number;
    total: number;
  }) => void;
  onClose: () => void;
}

type Phase = 'asking' | 'reveal' | 'result';

const AMBER = {
  bg: '#FEF3C7',
  border: '#F59E0B',
  text: '#92400E',
  badgeBg: '#F59E0B',
};

const CORRECT_TONE = {
  bg: '#DCFCE7',
  border: SECONDARY[500],
  text: '#166534',
};

const WRONG_TONE = {
  bg: '#FEF3C7',
  border: '#F59E0B',
  text: '#92400E',
};

export function QuizPlayer({
  questions,
  topicKey,
  onComplete,
  onClose,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const insets = useSafeAreaInsets();

  const total = questions.length;
  const q = questions[idx];

  const result = useMemo(
    () => computeQuizResult(correctCount, total),
    [correctCount, total]
  );

  const safeTopicKey = topicKey ?? 'balanced-nutrition';
  const rizzlerName = useMemo(() => getRizzlerName(safeTopicKey), [safeTopicKey]);
  const rizzlerImg = useMemo(() => rizzlerForTopic(safeTopicKey), [safeTopicKey]);
  const hint = useMemo(
    () => (q ? getQuizHintForQuestion(q.question, rizzlerName) : ''),
    [q, rizzlerName]
  );

  const choose = (i: number) => {
    if (phase !== 'asking') return;
    hapticSelection();
    setSelected(i);
    // immediate reveal pattern matching web (web has both single tap with reveal and confirm-then-reveal — we use single tap)
    const isCorrect = i === q.correct_answer;
    if (isCorrect) {
      hapticSuccess();
      setCorrectCount((c) => c + 1);
    } else {
      hapticError();
    }
    setPhase('reveal');
  };

  const nextQuestion = () => {
    if (idx === total - 1) {
      setPhase('result');
    } else {
      setIdx(idx + 1);
      setSelected(null);
      setPhase('asking');
    }
  };

  if (total === 0) {
    return (
      <View style={styles.empty}>
        <Image source={rizzlerImg} style={styles.emptyMascot} resizeMode="contain" />
        <Text style={styles.emptyTitle}>No quiz yet</Text>
        <BrandButton label="Got it" onPress={onClose} variant="outline" fullWidth />
      </View>
    );
  }

  if (phase === 'result') {
    const stars = result.stars;
    const passed = result.passed;
    const performance: Performance =
      stars === 3 ? 'perfect' : stars === 2 ? 'great' : 'good';
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.resultBody,
            { paddingTop: insets.top + SPACING.LG, paddingBottom: SPACING.XL + insets.bottom },
          ]}
        >
          {/* Big emoji circle */}
          <View
            style={[
              styles.bigEmojiCircle,
              {
                backgroundColor: passed ? '#DCFCE7' : '#FEF3C7',
              },
            ]}
          >
            <Text style={styles.bigEmoji}>{passed ? '🎉' : '📚'}</Text>
          </View>

          {/* Mascot avatar + name + reaction */}
          <View style={styles.resultMascotRow}>
            <Image source={rizzlerImg} style={styles.resultMascotAvatar} resizeMode="cover" />
            <Text style={styles.resultMascotText}>
              <Text style={styles.resultMascotName}>{rizzlerName}</Text>
              {passed ? ' is proud of you!' : ' believes in you!'}
            </Text>
          </View>

          <Text style={styles.resultTitle}>
            {passed ? 'Great Job!' : 'Keep Learning!'}
          </Text>

          <Text style={styles.resultScore}>
            You scored{' '}
            <Text
              style={{
                color: passed ? SECONDARY[600] : '#D97706',
                fontFamily: FONT.brand,
              }}
            >
              {Math.round(result.accuracy * 100)}%
            </Text>
          </Text>
          <Text style={styles.resultDetail}>
            {correctCount} out of {total} questions correct
          </Text>

          <Text style={styles.resultBigStars}>{'⭐'.repeat(Math.max(stars, 0))}</Text>

          {!passed && (
            <BrandCard style={styles.amberAlert}>
              <Text style={styles.amberAlertHeader}>
                You need at least 90% to pass and unlock the next activity.
              </Text>
              <Text style={styles.amberAlertBody}>
                Don't worry! Review the lesson and try again.
              </Text>
            </BrandCard>
          )}
          {passed && (
            <BrandCard style={styles.greenAlert}>
              <Text style={styles.greenAlertHeader}>
                Awesome! You've mastered this content!
              </Text>
              <Text style={styles.greenAlertBody}>
                The next activity is now unlocked.
              </Text>
            </BrandCard>
          )}

          {!passed && (
            <BrandButton
              label="Try Again"
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: SPACING.LG }}
              onPress={() => {
                setIdx(0);
                setSelected(null);
                setCorrectCount(0);
                setPhase('asking');
              }}
            />
          )}
          <BrandButton
            label={passed ? 'Continue to Map' : 'Back to Map'}
            variant={passed ? 'primary' : 'outline'}
            size="lg"
            fullWidth
            style={{ marginTop: SPACING.SM }}
            onPress={() =>
              onComplete({
                stars,
                passed,
                correctCount,
                total,
              })
            }
          />
        </ScrollView>

        {/* Celebration overlay (only when passed) — rendered last so it stacks on top */}
        <CelebrationModal
          visible={passed}
          title="Quiz complete!"
          performance={performance}
          stars={stars}
          maxStars={3}
          xpEarned={stars * 10}
          primaryLabel="Continue to Map"
          onPrimary={() =>
            onComplete({ stars, passed, correctCount, total })
          }
        />
      </View>
    );
  }

  const progress = ((idx + 1) / total) * 100;
  const isCorrect = selected !== null && q && selected === q.correct_answer;

  return (
    <View style={styles.container}>
      {/* Top bar — paddingTop accounts for the notch/Dynamic Island. */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.SM }]}>
        <Pressable onPress={onClose} hitSlop={16}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Session Quiz</Text>
        <Text style={styles.counter}>
          {idx + 1}/{total}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: SPACING.XL + insets.bottom },
        ]}
      >
        {/* Mascot hint card */}
        {q && (
          <View style={styles.mascotCard}>
            <Image
              source={rizzlerImg}
              style={styles.mascotCardAvatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.mascotCardName}>{rizzlerName}</Text>
              <Text style={styles.mascotCardHint}>{hint}</Text>
            </View>
          </View>
        )}

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Animated.View
          key={q?.id}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          style={{ width: '100%' }}
        >
          <Text style={styles.question}>{q?.question}</Text>
          <Text style={styles.tapHint}>Tap your answer</Text>

          {q?.options.map((opt, i) => {
            const chosen = selected === i;
            const reveal = phase === 'reveal';
            const showCorrect = reveal && i === q.correct_answer;
            const showWrong = reveal && chosen && i !== q.correct_answer;
            const tone = showCorrect
              ? CORRECT_TONE
              : showWrong
              ? WRONG_TONE
              : AMBER;

            return (
              <Pressable
                key={i}
                onPress={() => choose(i)}
                disabled={phase === 'reveal'}
                accessibilityRole="button"
                accessibilityState={{ selected: chosen }}
                style={{ width: '100%' }}
              >
                <View
                  style={[
                    styles.option,
                    {
                      backgroundColor: tone.bg,
                      borderColor: tone.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionBadge,
                      {
                        backgroundColor: showCorrect
                          ? SECONDARY[500]
                          : showWrong
                          ? '#F59E0B'
                          : AMBER.badgeBg,
                      },
                    ]}
                  >
                    <Text style={styles.optionBadgeText}>
                      {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: tone.text }]}>
                    {opt}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* Feedback + Continue */}
          {phase === 'reveal' && (
            <Animated.View
              entering={FadeIn.duration(220)}
              style={styles.feedback}
            >
              <Text
                style={[
                  styles.feedbackText,
                  { color: isCorrect ? SECONDARY[600] : '#D97706' },
                ]}
              >
                {isCorrect
                  ? 'Nice! You got it!'
                  : 'Good try! The right answer is highlighted.'}
              </Text>
              <BrandButton
                label={idx === total - 1 ? 'Finish Quiz' : 'Continue'}
                variant="accent"
                size="lg"
                onPress={nextQuestion}
                style={{ marginTop: SPACING.MD }}
              />
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  emptyMascot: { width: 120, height: 120 },
  emptyTitle: {
    fontFamily: FONT.brand,
    fontSize: 24,
    color: TEXT.DEFAULT,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.SM,
  },
  close: {
    fontSize: 28,
    color: TEXT.tertiary,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: TEXT.DEFAULT,
  },
  counter: {
    fontFamily: FONT.bodyBold,
    fontSize: 12,
    color: TEXT.tertiary,
  },
  body: { padding: SPACING.LG, paddingBottom: SPACING.XL },
  mascotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    backgroundColor: PRIMARY[50],
    borderRadius: BORDERS.RADIUS.LARGE,
    borderWidth: 1,
    borderColor: PRIMARY[100],
    padding: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  mascotCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: PRIMARY[200],
  },
  mascotCardName: {
    fontFamily: FONT.brand,
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 2,
  },
  mascotCardHint: {
    fontFamily: FONT.bodyBold,
    fontSize: 14,
    color: PRIMARY[800],
    lineHeight: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: PRIMARY[100],
    borderRadius: BORDERS.RADIUS.FULL,
    overflow: 'hidden',
    marginBottom: SPACING.LG,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY[500],
  },
  question: {
    fontFamily: FONT.brand,
    fontSize: 22,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.SM,
  },
  tapHint: {
    fontFamily: FONT.bodyBold,
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.MD,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 64,
    borderRadius: BORDERS.RADIUS.XL,
    borderWidth: 3,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
    gap: SPACING.SM,
    ...SHADOW.CARD,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONT.brand,
    fontSize: 12,
  },
  optionText: {
    fontFamily: FONT.brand,
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  feedback: {
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  feedbackText: {
    fontFamily: FONT.brand,
    fontSize: 16,
    textAlign: 'center',
  },
  // Result screen
  resultBody: {
    padding: SPACING.LG,
    alignItems: 'center',
  },
  bigEmojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.LG,
  },
  bigEmoji: { fontSize: 56 },
  resultMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  resultMascotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PRIMARY[200],
  },
  resultMascotText: {
    fontFamily: FONT.bodyBold,
    fontSize: 14,
    color: PRIMARY[700],
  },
  resultMascotName: {
    fontFamily: FONT.brand,
    color: '#1565C0',
  },
  resultTitle: {
    fontFamily: FONT.brand,
    fontSize: 28,
    color: TEXT.DEFAULT,
    marginTop: SPACING.MD,
  },
  resultScore: {
    fontFamily: FONT.bodyBold,
    fontSize: 18,
    color: TEXT.tertiary,
    marginTop: SPACING.SM,
  },
  resultDetail: {
    fontFamily: FONT.body,
    fontSize: 14,
    color: TEXT.muted,
    marginTop: 4,
  },
  resultBigStars: {
    fontSize: 40,
    letterSpacing: 4,
    marginTop: SPACING.MD,
  },
  amberAlert: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    marginTop: SPACING.LG,
    width: '100%',
  },
  amberAlertHeader: {
    fontFamily: FONT.bodyBold,
    fontSize: 14,
    color: '#B45309',
  },
  amberAlertBody: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: '#D97706',
    marginTop: 4,
  },
  greenAlert: {
    backgroundColor: '#DCFCE7',
    borderColor: SECONDARY[300],
    marginTop: SPACING.LG,
    width: '100%',
  },
  greenAlertHeader: {
    fontFamily: FONT.bodyBold,
    fontSize: 14,
    color: SECONDARY[700],
  },
  greenAlertBody: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: SECONDARY[600],
    marginTop: 4,
  },
});
