import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchLesson } from '@core/learning/api';
import { completeNode } from '@core/map/progress';
import { useChildStore } from '@stores/childStore';
import { SlidePlayer } from '@components/learning/SlidePlayer';
import { BG, TEXT, SPACING, FONT, PRIMARY } from '@lib/theme';
import type { LessonRow, SlideRow } from '@core/learning/api';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    void (async () => {
      try {
        const { lesson, slides } = await fetchLesson(lessonId);
        setLesson(lesson);
        setSlides(slides);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/map');
  }, [router]);

  const onComplete = useCallback(async () => {
    if (childId && lessonId) {
      await completeNode(childId, lessonId, 3, 10);
    }
    goBack();
  }, [childId, lessonId, goBack]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG.warm }}>
        <ActivityIndicator size="large" color={PRIMARY[500]} />
      </View>
    );
  }

  if (error || !lesson) {
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
        <Text style={{ fontFamily: FONT.bodyBold, color: TEXT.DEFAULT, textAlign: 'center' }}>
          {error ?? 'Lesson not found'}
        </Text>
      </View>
    );
  }

  return <SlidePlayer slides={slides} title={lesson.title} onComplete={onComplete} onClose={goBack} />;
}
