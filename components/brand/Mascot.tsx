import React from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ASSETS } from '@lib/assets';
import { useReducedMotion } from '@lib/useReducedMotion';

export type MascotAnimation = 'float' | 'wave' | 'pulse' | 'bounce' | 'none';

interface Props {
  source?: ImageSourcePropType;
  size?: number;
  animation?: MascotAnimation;
  style?: StyleProp<ImageStyle>;
}

/**
 * Faithful port of web `MainMascot1` with `framer-motion` animations.
 * Animations are subtle (kid-friendly, not distracting).
 */
export function Mascot({
  source = ASSETS.brand.mascots.main,
  size = 120,
  animation = 'float',
  style,
}: Props) {
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) {
      y.value = 0;
      rot.value = 0;
      scale.value = 1;
      return;
    }
    switch (animation) {
      case 'float':
      case 'bounce':
        y.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 1750, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 1750, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        break;
      case 'wave':
        rot.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
            withTiming(-1.5, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        break;
      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.015, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        break;
    }
  }, [animation, y, rot, scale, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animStyle]}>
      <Image
        source={source}
        style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}
