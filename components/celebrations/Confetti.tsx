/**
 * Confetti effect — falls from top center with gravity.
 * Reanimated worklet animations for 60fps particle movement.
 * Mirrors web's `ConfettiEffect` colors and feel.
 */
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const COLORS = ['#FFD700', '#22C55E', '#00D4FF', '#FFC107', '#16A34A'];
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ParticleProps {
  color: string;
  size: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  rotationVel: number;
  duration: number;
}

function Particle({
  color,
  size,
  startX,
  startY,
  vx,
  vy,
  rotationVel,
  duration,
}: ParticleProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    x.value = withTiming(vx, { duration, easing: Easing.out(Easing.quad) });
    // Gravity-style fall: easeIn so it falls faster over time
    y.value = withTiming(vy, { duration, easing: Easing.in(Easing.quad) });
    rot.value = withTiming(rotationVel, { duration, easing: Easing.linear });
    // Fade out in the last 30% of duration
    opacity.value = withTiming(0, {
      duration,
      easing: Easing.bezier(0, 0, 1, 1),
    });
  }, []); // eslint-disable-line

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: startX,
          top: startY,
        },
        animStyle,
      ]}
    />
  );
}

interface Props {
  particleCount?: number;
  duration?: number;
  visible?: boolean;
}

export function Confetti({
  particleCount = 60,
  duration = 3000,
  visible = true,
}: Props) {
  const particles = useMemo(() => {
    const startX = SCREEN_W / 2;
    const startY = SCREEN_H * 0.3;
    return Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 200 + Math.random() * 300;
      return {
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        startX,
        startY,
        vx: Math.cos(angle) * speed,
        // Bias downward + add gravity component over duration
        vy: Math.sin(angle) * speed + SCREEN_H * 0.6,
        rotationVel: (Math.random() - 0.5) * 720,
        duration,
      };
    });
  }, [particleCount, duration]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 8,
  },
});
