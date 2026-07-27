import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { completeNode } from '@core/map/progress';
import { useChildStore } from '@stores/childStore';
import { QuizBattleGame } from '@components/games/QuizBattleGame';
import { BrandButton } from '@components/brand/BrandButton';
import { BG, TEXT, SPACING, FONT } from '@lib/theme';

export default function GameScreen() {
  const { gameType, topicKey } = useLocalSearchParams<{ gameType: string; topicKey?: string }>();
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/map');
  }, [router]);

  const onComplete = useCallback(
    async (r: { stars: number; passed: boolean }) => {
      if (childId && topicKey && r.passed) {
        await completeNode(childId, `${topicKey}-game`, r.stars);
      }
      goBack();
    },
    [childId, topicKey, goBack]
  );

  if (gameType === 'quiz-battle') {
    return <QuizBattleGame onComplete={onComplete} onClose={goBack} />;
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Game coming soon!</Text>
      <BrandButton label="Back" onPress={goBack} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
    gap: SPACING.LG,
    backgroundColor: BG.warm,
  },
  title: { fontFamily: FONT.brand, fontSize: 22, color: TEXT.DEFAULT },
});
