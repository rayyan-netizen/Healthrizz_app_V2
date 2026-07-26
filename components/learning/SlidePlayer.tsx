import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getPrefs } from '@stores/prefsStore';
import { useReducedMotion } from '@lib/useReducedMotion';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BrandButton } from '@components/brand/BrandButton';
import { CelebrationModal } from '@components/celebrations/CelebrationModal';
import { resolveAsset } from '@core/learning/content/slide-imports';
import { mascotForPath, zoneIconFor } from '@lib/assets';
import {
  TEXT,
  BG,
  SPACING,
  FONT,
  BORDERS,
  PRIMARY,
  SECONDARY,
} from '@lib/theme';
import { hapticLight, hapticSuccess, hapticError } from '@lib/haptic';
import type { SlideRow } from '@core/learning/api';

interface Props {
  slides: SlideRow[];
  title: string;
  onComplete: () => void;
  onClose: () => void;
}

interface MicroCheckProps {
  prompt: string;
  options: string[];
  correctIndex: number;
  onAnswer: () => void;
}

function MicroCheck({ prompt, options, correctIndex, onAnswer }: MicroCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const showFeedback = selected !== null;
  const isCorrect = selected === correctIndex;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === correctIndex) hapticSuccess();
    else hapticError();
  };

  return (
    <View style={styles.microCheck}>
      <Text style={styles.microPrompt}>{prompt}</Text>
      <Text style={styles.microHint}>Tap your answer</Text>

      {options.map((opt, i) => {
        const chosen = selected === i;
        const correct = i === correctIndex;
        const showCorrect = showFeedback && correct;
        const showIncorrect = showFeedback && chosen && !correct;
        return (
          <Pressable
            key={i}
            disabled={showFeedback}
            onPress={() => choose(i)}
            style={{ width: '100%' }}
          >
            <View
              style={[
                styles.microOption,
                showCorrect && styles.microCorrect,
                showIncorrect && styles.microIncorrect,
              ]}
            >
              <View
                style={[
                  styles.microBadge,
                  showCorrect && { backgroundColor: '#22C55E' },
                  showIncorrect && { backgroundColor: '#F59E0B' },
                ]}
              >
                <Text style={styles.microBadgeText}>
                  {showCorrect ? '✓' : showIncorrect ? '✗' : String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text
                style={[
                  styles.microOptionText,
                  showCorrect && { color: '#166534' },
                  showIncorrect && { color: '#92400E' },
                ]}
              >
                {opt}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {showFeedback && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.microFeedback}>
          <Text
            style={[
              styles.microFeedbackText,
              { color: isCorrect ? '#15803D' : '#B45309' },
            ]}
          >
            {isCorrect ? 'Nice! You got it!' : 'Good try! The right answer is highlighted.'}
          </Text>
          <BrandButton
            label="Continue"
            variant="accent"
            size="lg"
            fullWidth
            onPress={onAnswer}
            style={{ marginTop: SPACING.MD }}
          />
        </Animated.View>
      )}
    </View>
  );
}

interface RecapBannerProps {
  accent: string;
}

function RecapBanner({ accent }: RecapBannerProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  React.useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [scale, reducedMotion]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={styles.recapWrap}>
      <View style={[styles.recapRibbon, { backgroundColor: accent }]}>
        <Text style={styles.recapRibbonText}>Section complete</Text>
      </View>
      <Animated.View style={[styles.recapStars, animStyle]}>
        <Text style={styles.recapStarText}>⭐ ⭐ ⭐</Text>
      </Animated.View>
    </View>
  );
}

export function SlidePlayer({ slides, title, onComplete, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [microAnswered, setMicroAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const isLast = idx === slides.length - 1;
  const slide = slides[idx];
  const insets = useSafeAreaInsets();

  // Stop any speech when slide changes or component unmounts
  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (isReading) {
      void Speech.stop();
      setIsReading(false);
    }
    // Auto-scroll to top on every slide change so kids see the slide art first.
    // For micro-check slides we then scroll the prompt into view after a short
    // beat so the answer cards aren't hidden below the fold.
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (slides[idx]?.micro_check) {
      const t = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const toggleReadAloud = () => {
    hapticLight();
    if (isReading) {
      void Speech.stop();
      setIsReading(false);
      return;
    }
    if (!getPrefs().soundEnabled) return;

    const text = slide?.content ?? slide?.alt_text;
    if (!text) return;
    setIsReading(true);
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.05,
      onDone: () => setIsReading(false),
      onStopped: () => setIsReading(false),
      onError: () => setIsReading(false),
    });
  };

  const accent = slide?.accent_color ?? PRIMARY[500];

  const onNext = () => {
    hapticLight();
    if (isLast) {
      hapticSuccess();
      setShowCelebration(true);
    } else {
      setIdx(idx + 1);
      setMicroAnswered(false);
    }
  };

  const onPrev = () => {
    hapticLight();
    if (idx > 0) {
      setIdx(idx - 1);
      setMicroAnswered(false);
    } else onClose();
  };

  if (!slide) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No slides yet</Text>
        <BrandButton label="Got it" onPress={onClose} fullWidth />
      </View>
    );
  }

  const progress = ((idx + 1) / slides.length) * 100;
  const asset = resolveAsset(slide.image_url);
  const zoneIcon = zoneIconFor(slide.zone_label);
  const mascotSrc = mascotForPath(slide.mascot_image);
  const hasMicroCheck = !!slide.micro_check;
  const isRecap = isLast;

  return (
    <View style={styles.container}>
      {/* Top bar — paddingTop accounts for the status bar / notch since
          the parent SafeAreaView's top edge inset can be inconsistent in
          some Expo/RN versions. */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.SM }]}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn} accessibilityLabel="Close lesson">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: accent },
            ]}
          />
        </View>
        <Text style={styles.counter}>
          {idx + 1}/{slides.length}
        </Text>
      </View>

      <View style={styles.body}>
        <Animated.View
          key={slide.id}
          entering={SlideInRight.duration(280).easing(Easing.out(Easing.quad))}
          exiting={FadeOut.duration(150)}
          style={[
            styles.card,
            { borderColor: accent, shadowColor: accent, flex: 1 },
          ]}
        >
          {/* Zone tab + zone icon (top sticker) */}
          <View style={styles.zoneRow}>
            {slide.zone_label && (
              <View style={[styles.zoneTab, { backgroundColor: accent }]}>
                <Text style={styles.zoneIcon}>{zoneIcon}</Text>
                <Text style={styles.zoneTabText}>{slide.zone_label}</Text>
              </View>
            )}
            {isRecap && <RecapBanner accent={accent} />}
          </View>

          {/* Hero artwork — flex-grows to fill available space inside the
              card. Removes wasted whitespace on the page. */}
          <View style={styles.heroImageWrap}>
            {asset?.kind === 'svg' ? (
              React.createElement(asset.component, {
                width: '100%',
                height: '100%',
                preserveAspectRatio: 'xMidYMid meet',
              })
            ) : asset?.kind === 'png' ? (
              <Image source={asset.source} style={styles.heroImage} resizeMode="contain" />
            ) : (
              <View style={[styles.heroImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderEmoji}>📖</Text>
              </View>
            )}
          </View>

          {/* Mascot bubble + body text — side-by-side, mascot inline */}
          {!hasMicroCheck && (
            <View style={styles.mascotTextRow}>
              {slide.mascot_image && (
                <View style={styles.mascotInline}>
                  <Image
                    source={mascotSrc}
                    style={styles.mascotInlineImage}
                    resizeMode="contain"
                  />
                  {slide.mascot_tip && (
                    <View
                      style={[
                        styles.mascotTipBubble,
                        { borderColor: accent },
                      ]}
                    >
                      <Text style={styles.mascotTipText}>{slide.mascot_tip}</Text>
                    </View>
                  )}
                </View>
              )}
              {(slide.content || slide.alt_text) && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.content}>
                    {slide.content || slide.alt_text}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Inline micro-check (replaces continue button when present) */}
          {hasMicroCheck && slide.micro_check && (
            <MicroCheck
              prompt={slide.micro_check.prompt}
              options={slide.micro_check.options}
              correctIndex={slide.micro_check.correct_index}
              onAnswer={() => {
                setMicroAnswered(true);
                onNext();
              }}
            />
          )}

          {/* Coach line bubble */}
          {slide.coach_line && !hasMicroCheck && (
            <View style={[styles.coachBubble, { borderColor: accent }]}>
              <Text style={styles.coachIcon}>💡</Text>
              <Text style={styles.coachText}>{slide.coach_line}</Text>
            </View>
          )}

          {/* Read-aloud row (single button — narration via TTS) */}
          {!hasMicroCheck && (slide.alt_text || slide.content) && (
            <View style={styles.toolsRow}>
              <Pressable onPress={toggleReadAloud} style={styles.toolBtn} hitSlop={8}>
                <Text style={styles.toolIcon}>{isReading ? '🔊' : '🔉'}</Text>
                <Text style={styles.toolLabel}>
                  {isReading ? 'Stop' : 'Read aloud'}
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Footer (hidden when micro-check active to avoid double Continue) */}
      {!hasMicroCheck && (
        <View style={styles.footer}>
          <Pressable onPress={onPrev} hitSlop={16} style={styles.navBtn}>
            <Text style={styles.navText}>‹ Back</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <BrandButton
            label={isLast ? 'Done! 🎉' : 'Next ›'}
            size="lg"
            onPress={onNext}
          />
        </View>
      )}

      {/* Celebration overlay — rendered last so it stacks on top */}
      <CelebrationModal
        visible={showCelebration}
        title={title}
        performance="great"
        stars={3}
        xpEarned={10}
        primaryLabel="Continue"
        onPrimary={() => {
          setShowCelebration(false);
          onComplete();
        }}
      />
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
  },
  emptyTitle: {
    fontFamily: FONT.brand,
    fontSize: 24,
    color: TEXT.DEFAULT,
    marginBottom: SPACING.LG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.MD,
    gap: SPACING.SM,
    flexShrink: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TEXT.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 20,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#D1D5DB',
    borderRadius: BORDERS.RADIUS.FULL,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDERS.RADIUS.FULL,
  },
  counter: {
    fontFamily: FONT.bodyBold,
    fontSize: 13,
    color: TEXT.DEFAULT,
    minWidth: 36,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDERS.RADIUS.XL2,
    borderWidth: 3,
    paddingTop: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'visible',
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  zoneTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: 6,
    borderRadius: BORDERS.RADIUS.FULL,
    gap: 6,
  },
  zoneIcon: { fontSize: 14 },
  zoneTabText: {
    fontFamily: FONT.brand,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recapWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  recapRibbon: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    borderRadius: BORDERS.RADIUS.SMALL,
  },
  recapRibbonText: {
    fontFamily: FONT.brand,
    color: '#FFFFFF',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recapStars: {
    paddingHorizontal: 6,
  },
  recapStarText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  heroImageWrap: {
    flex: 1,
    backgroundColor: '#FFFEF8',
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  mascotTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  mascotInline: {
    width: 80,
    alignItems: 'center',
  },
  mascotInlineImage: {
    width: 64,
    height: 64,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 64 },
  mascotTipBubble: {
    backgroundColor: '#FFFEF8',
    borderWidth: 2,
    borderRadius: BORDERS.RADIUS.MEDIUM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 4,
    marginTop: SPACING.XS,
    maxWidth: 90,
  },
  mascotTipText: {
    fontFamily: FONT.bodyBold,
    fontSize: 10,
    color: TEXT.DEFAULT,
    textAlign: 'center',
    lineHeight: 14,
  },
  content: {
    fontFamily: FONT.body,
    fontSize: 18,
    lineHeight: 28,
    color: TEXT.DEFAULT,
    marginVertical: SPACING.SM,
  },
  coachBubble: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderRadius: BORDERS.RADIUS.LARGE,
    padding: SPACING.MD,
    marginTop: SPACING.MD,
    alignItems: 'flex-start',
  },
  coachIcon: { fontSize: 24, marginRight: SPACING.SM },
  coachText: {
    fontFamily: FONT.body,
    fontSize: 15,
    color: TEXT.DEFAULT,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  navBtn: { padding: SPACING.MD },
  navText: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: TEXT.tertiary,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
    paddingTop: SPACING.SM,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDERS.RADIUS.MEDIUM,
    backgroundColor: '#FFFEF8',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  toolIcon: { fontSize: 16 },
  toolLabel: {
    fontFamily: FONT.bodyBold,
    fontSize: 13,
    color: '#92400E',
  },
  microCheck: {
    width: '100%',
    paddingVertical: SPACING.MD,
  },
  microPrompt: {
    fontFamily: FONT.brand,
    fontSize: 22,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.SM,
  },
  microHint: {
    fontFamily: FONT.bodyBold,
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.MD,
  },
  microOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#F59E0B',
    borderRadius: BORDERS.RADIUS.LARGE,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    minHeight: 64,
    marginBottom: SPACING.SM,
    gap: SPACING.SM,
  },
  microCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: SECONDARY[500],
  },
  microIncorrect: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  microBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONT.brand,
    fontSize: 12,
  },
  microOptionText: {
    fontFamily: FONT.brand,
    fontSize: 16,
    color: '#92400E',
    flex: 1,
    lineHeight: 22,
  },
  microFeedback: {
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  microFeedbackText: {
    fontFamily: FONT.brand,
    fontSize: 16,
    textAlign: 'center',
  },
});
