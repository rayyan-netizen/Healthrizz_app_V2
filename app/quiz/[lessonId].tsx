import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchQuizQuestions } from '@core/learning/api';
import { completeNode } from '@core/map/progress';
import { useChildStore } from '@stores/childStore';
import { QuizPlayer } from '@components/learning/QuizPlayer';
import { BG, TEXT, SPACING, FONT, PRIMARY } from '@lib/theme';
import type { QuizQuestionRow } from '@core/learning/api';

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);
  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    void (async () => {
      try {
        const qs = await fetchQuizQuestions(lessonId);
        setQuestions(qs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const topicKey = lessonId?.replace(/-lesson$/, '');

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/map');
  }, [router]);

  const onComplete = useCallback(
    async (r: { stars: number; passed: boolean; correctCount: number; total: number }) => {
      if (childId && topicKey && r.passed) {
        await completeNode(childId, `${topicKey}-quiz`, r.stars);
      }
      goBack();
    },
    [childId, topicKey, goBack]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG.warm }}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BG.warm,
          padding: SPACING.LG,
        }}
      >
        <Text style={{ fontFamily: FONT.bodyBold, color: TEXT.DEFAULT, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <QuizPlayer
      questions={questions}
      title="Quiz"
      topicKey={topicKey}
      onComplete={onComplete}
      onClose={goBack}
    />
  );
}
