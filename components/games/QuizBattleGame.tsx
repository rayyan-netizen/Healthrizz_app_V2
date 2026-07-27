import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GameWrapper } from './GameWrapper';
import { computeQuizResult } from '@core/learning/quiz-scoring';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOW } from '@lib/theme';
import { hapticSelection, hapticSuccess, hapticError } from '@lib/haptic';

const QUESTIONS = [
  {
    q: 'Which has the most water?',
    options: ['Watermelon', 'Bread', 'Cookie', 'Cracker'],
    correct: 0,
  },
  {
    q: 'Which is a great protein source?',
    options: ['Soda', 'Beans', 'Candy', 'Chips'],
    correct: 1,
  },
  {
    q: 'Phyto means…',
    options: ['Fish', 'Plant', 'Sugar', 'Water'],
    correct: 1,
  },
  {
    q: 'How much water should kids drink each day?',
    options: ['1 cup', '2-3 cups', '5-7 cups', 'Just juice'],
    correct: 2,
  },
  {
    q: 'Which fruit is loaded with vitamin C?',
    options: ['Banana', 'Orange', 'White rice', 'Cake'],
    correct: 1,
  },
];

interface Props {
  onComplete: (r: { stars: number; passed: boolean }) => void;
  onClose: () => void;
}

const TIMER_PER_QUESTION = 12;

export function QuizBattleGame({ onComplete, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_PER_QUESTION);
  const [result, setResult] = useState<{ stars: number; passed: boolean } | null>(null);

  const q = QUESTIONS[idx];

  // Timer
  useEffect(() => {
    if (revealed || result) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRevealed(true);
          hapticError();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, revealed, result]);

  // After reveal, auto-advance
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => {
      if (idx === QUESTIONS.length - 1) {
        const r = computeQuizResult(correctCount, QUESTIONS.length);
        setResult({ stars: r.stars, passed: r.passed });
      } else {
        setIdx(idx + 1);
        setSelected(null);
        setRevealed(false);
        setSecondsLeft(TIMER_PER_QUESTION);
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [revealed, idx, correctCount]);

  const choose = (i: number) => {
    if (revealed) return;
    hapticSelection();
    setSelected(i);
    setRevealed(true);
    if (i === q.correct) {
      hapticSuccess();
      setCorrectCount((c) => c + 1);
    } else {
      hapticError();
    }
  };

  const timerPct = (secondsLeft / TIMER_PER_QUESTION) * 100;

  const retry = () => {
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setSecondsLeft(TIMER_PER_QUESTION);
    setResult(null);
  };

  return (
    <GameWrapper
      title="Quiz Battle"
      instructions={`Answer fast! ${idx + 1}/${QUESTIONS.length} • ${correctCount} ✓`}
      onClose={onClose}
      showResult={result}
      onContinue={() => result && onComplete(result)}
      onRetry={retry}
    >
      <View style={styles.body}>
        <View style={styles.timerBar}>
          <View
            style={[
              styles.timerFill,
              {
                width: `${timerPct}%`,
                backgroundColor:
                  secondsLeft > 5 ? COLORS.BRAND_GREEN : COLORS.ERROR,
              },
            ]}
          />
        </View>
        <Text style={styles.timer}>{secondsLeft}s</Text>

        <Text style={styles.question}>{q.q}</Text>

        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correct;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isSelected && !isCorrect;
          return (
            <Pressable
              key={i}
              onPress={() => choose(i)}
              disabled={revealed}
              style={{ width: '100%' }}
            >
              <View
                style={[
                  styles.option,
                  isSelected && !revealed && styles.optionChosen,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
              >
                <Text style={styles.optionLabel}>{opt}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </GameWrapper>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: SPACING.LG },
  timerBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: BORDERS.RADIUS.FULL,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
  },
  timerFill: { height: '100%', borderRadius: BORDERS.RADIUS.FULL },
  timer: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginBottom: SPACING.MD,
  },
  question: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.LARGE,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: SPACING.MD,
    minHeight: 64,
    marginBottom: SPACING.SM,
    justifyContent: 'center',
    ...SHADOW.CARD,
  },
  optionChosen: {
    borderColor: COLORS.BRAND_BLUE,
    backgroundColor: '#EFF6FF',
  },
  optionCorrect: {
    borderColor: COLORS.BRAND_GREEN,
    backgroundColor: '#F0FDF4',
  },
  optionWrong: {
    borderColor: COLORS.ERROR,
    backgroundColor: '#FEF2F2',
  },
  optionLabel: {
    ...TYPOGRAPHY.BODY_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
});
