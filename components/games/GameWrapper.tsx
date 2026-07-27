import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import { CelebrationModal, type Performance } from '@components/celebrations/CelebrationModal';
import {
  PRIMARY,
  TEXT,
  BG,
  SPACING,
  FONT,
} from '@lib/theme';

interface Props {
  title: string;
  instructions?: string;
  children: React.ReactNode;
  onClose: () => void;
  showResult?: { stars: number; passed: boolean; message?: string } | null;
  onContinue?: () => void;
  onRetry?: () => void;
}

export function GameWrapper({
  title,
  instructions,
  children,
  onClose,
  showResult,
  onContinue,
  onRetry,
}: Props) {
  if (showResult) {
    const stars = showResult.stars;
    const performance: Performance =
      stars === 3 ? 'perfect' : stars === 2 ? 'great' : 'good';
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Confetti + celebration on win */}
        <CelebrationModal
          visible={showResult.passed}
          title={title}
          performance={performance}
          stars={stars}
          maxStars={3}
          xpEarned={stars * 10}
          primaryLabel="Continue ✨"
          onPrimary={onContinue ?? onClose}
        />

        {/* Static result fallback for failed attempts (no celebration) */}
        {!showResult.passed && (
          <View style={styles.resultContainer}>
            <Mascot animation="wave" size={140} />
            <Text style={styles.bigEmoji}>🎯</Text>
            <Text style={styles.resultTitle}>Keep practicing!</Text>
            {showResult.message && (
              <Text style={styles.resultMessage}>{showResult.message}</Text>
            )}
            <BrandButton
              label="Try again"
              variant="primary"
              size="xl"
              fullWidth
              onPress={onRetry ?? onContinue ?? onClose}
              style={{ marginTop: SPACING.XL }}
            />
            <BrandButton
              label="Back to Map"
              variant="outline"
              size="xl"
              fullWidth
              onPress={onClose}
              style={{ marginTop: SPACING.SM }}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={16}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
      {instructions && (
        <View style={styles.instructionsBar}>
          <Text style={styles.instructions}>{instructions}</Text>
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.warm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.SM,
  },
  close: { fontSize: 28, color: TEXT.tertiary },
  title: { fontFamily: FONT.brand, fontSize: 22, color: TEXT.DEFAULT },
  instructionsBar: {
    backgroundColor: PRIMARY[100],
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: PRIMARY[200],
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY[200],
  },
  instructions: {
    fontFamily: FONT.bodyBold,
    fontSize: 15,
    color: '#92400E',
    textAlign: 'center',
  },
  body: { flex: 1 },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
    gap: SPACING.SM,
  },
  bigEmoji: { fontSize: 88 },
  resultTitle: {
    fontFamily: FONT.brand,
    fontSize: 32,
    color: TEXT.DEFAULT,
    textAlign: 'center',
  },
  resultMessage: {
    fontFamily: FONT.body,
    fontSize: 16,
    color: TEXT.tertiary,
    marginTop: SPACING.MD,
    textAlign: 'center',
  },
});
