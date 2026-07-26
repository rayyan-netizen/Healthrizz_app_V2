/**
 * Full-screen celebration modal for lesson/quiz/game completion.
 * Stars pop in sequentially, XP counter animates, confetti rains.
 * Mirrors web's `LessonCompleteCelebration`.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Confetti } from './Confetti';
import { BrandButton } from '@components/brand/BrandButton';
import { Mascot } from '@components/brand/Mascot';
import {
  PRIMARY,
  TEXT,
  SPACING,
  FONT,
  BORDERS,
  SHADOW,
} from '@lib/theme';
import { hapticSuccess } from '@lib/haptic';

export type Performance = 'perfect' | 'great' | 'good';

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  performance: Performance;
  stars: number;
  maxStars?: number;
  xpEarned?: number;
  primaryLabel?: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const PERFORMANCE_MESSAGES: Record<
  Performance,
  { emoji: string; text: string; color: string }
> = {
  perfect: { emoji: '🌟', text: 'Perfect!', color: '#FFB300' },
  great: { emoji: '🎉', text: 'Great Job!', color: '#22C55E' },
  good: { emoji: '👍', text: 'Well Done!', color: '#3B82F6' },
};

function StarPop({ delay }: { delay: number }) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-30);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.4, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      )
    );
    rotate.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 150 })
    );
  }, []); // eslint-disable-line

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.Text style={[styles.star, style]}>⭐</Animated.Text>
  );
}

export function CelebrationModal({
  visible,
  title,
  subtitle,
  performance,
  stars,
  maxStars = 3,
  xpEarned,
  primaryLabel = 'Continue',
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  const message = PERFORMANCE_MESSAGES[performance];
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowButton(false);
      return;
    }
    hapticSuccess();
    const t = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(t);
  }, [visible]);

  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
      cardOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    } else {
      cardScale.value = withTiming(0.8, { duration: 150 });
      cardOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, cardScale, cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={() => {}}>
        <Confetti particleCount={70} duration={3000} />

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={[styles.heroIcon, { backgroundColor: `${message.color}22` }]}>
            <Text style={styles.heroEmoji}>{message.emoji}</Text>
          </View>

          <Text style={[styles.heroTitle, { color: message.color }]}>
            {message.text}
          </Text>

          <Text style={styles.lessonTitle}>{title}</Text>
          {subtitle && <Text style={styles.lessonSubtitle}>{subtitle}</Text>}

          {/* Stars */}
          <View style={styles.starsRow}>
            {Array.from({ length: maxStars }).map((_, i) => {
              const filled = i < stars;
              if (filled) {
                return <StarPop key={i} delay={400 + i * 200} />;
              }
              return (
                <Text key={i} style={[styles.star, styles.starEmpty]}>
                  ☆
                </Text>
              );
            })}
          </View>

          {/* XP */}
          {typeof xpEarned === 'number' && xpEarned > 0 && (
            <View style={styles.xpRow}>
              <Text style={styles.xpEmoji}>✨</Text>
              <Text style={styles.xpText}>+{xpEarned} XP</Text>
            </View>
          )}

          {/* Mascot */}
          <View style={{ marginTop: SPACING.SM }}>
            <Mascot animation="bounce" size={100} />
          </View>

          {/* Buttons */}
          {showButton && (
            <Animated.View style={styles.buttons}>
              {secondaryLabel && onSecondary && (
                <BrandButton
                  label={secondaryLabel}
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={onSecondary}
                  style={{ marginBottom: SPACING.SM }}
                />
              )}
              <BrandButton
                label={primaryLabel}
                variant="primary"
                size="lg"
                fullWidth
                onPress={onPrimary}
              />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.XL2,
    padding: SPACING.XL,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...SHADOW.MODAL,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: {
    fontFamily: FONT.brand,
    fontSize: 32,
    marginTop: SPACING.MD,
  },
  lessonTitle: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: TEXT.tertiary,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
  lessonSubtitle: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: SPACING.MD,
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.XS,
    marginTop: SPACING.MD,
  },
  star: {
    fontSize: 44,
  },
  starEmpty: {
    color: TEXT.muted,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY[50],
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDERS.RADIUS.FULL,
    marginTop: SPACING.MD,
    borderWidth: 2,
    borderColor: PRIMARY[200],
  },
  xpEmoji: { fontSize: 18 },
  xpText: {
    fontFamily: FONT.brand,
    fontSize: 18,
    color: PRIMARY[700],
  },
  buttons: {
    width: '100%',
    marginTop: SPACING.LG,
  },
});
