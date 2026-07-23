import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  PRIMARY,
  SECONDARY,
  ACCENT,
  TEXT,
  BORDERS,
  SPACING,
  GRADIENT,
  FONT,
  SHADOW,
} from '@lib/theme';
import { hapticLight } from '@lib/haptic';

export type BrandButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type BrandButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  onPress?: () => void;
  label?: string;
  children?: React.ReactNode;
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  haptic?: boolean;
}

const SIZES: Record<BrandButtonSize, { height: number; paddingX: number; fontSize: number }> = {
  sm: { height: 48, paddingX: 16, fontSize: 14 },
  md: { height: 48, paddingX: 24, fontSize: 16 },
  lg: { height: 56, paddingX: 32, fontSize: 18 },
  xl: { height: 64, paddingX: 32, fontSize: 20 },
};

const GRADIENTS: Record<'primary' | 'secondary' | 'accent', readonly [string, string, string]> = {
  primary: GRADIENT.primaryButton,
  secondary: GRADIENT.secondaryButton,
  accent: GRADIENT.accentButton,
};

const SHADOWS: Record<
  'primary' | 'secondary' | 'accent',
  {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }
> = {
  primary: { ...SHADOW.BRAND_YELLOW },
  secondary: { ...SHADOW.BRAND_GREEN },
  accent: { ...SHADOW.BRAND_YELLOW, shadowColor: ACCENT[500] },
};

export function BrandButton({
  onPress,
  label,
  children,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  haptic = true,
}: Props) {
  const sz = SIZES[size];
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 12 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = () => {
    if (haptic) hapticLight();
    onPress?.();
  };

  const isGradient = variant === 'primary' || variant === 'secondary' || variant === 'accent';
  const content = (
    <View style={[styles.row, { paddingHorizontal: sz.paddingX }]}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? PRIMARY[600] : '#FFFFFF'} />
      ) : (
        <>
          {children}
          {label && (
            <Text
              style={[
                styles.label,
                {
                  fontSize: sz.fontSize,
                  color:
                    variant === 'outline'
                      ? PRIMARY[600]
                      : variant === 'ghost'
                      ? PRIMARY[600]
                      : '#FFFFFF',
                },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
        </>
      )}
    </View>
  );

  return (
    <Animated.View
      style={[
        animStyle,
        fullWidth ? { alignSelf: 'stretch' } : undefined,
        isGradient && !isDisabled ? SHADOWS[variant as 'primary' | 'secondary' | 'accent'] : undefined,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [
          styles.base,
          {
            height: sz.height,
            opacity: isDisabled ? 0.5 : 1,
            backgroundColor:
              variant === 'outline'
                ? 'transparent'
                : variant === 'ghost'
                ? 'transparent'
                : PRIMARY[500],
            borderColor:
              variant === 'outline'
                ? PRIMARY[400]
                : variant === 'ghost'
                ? 'transparent'
                : 'transparent',
            borderWidth: variant === 'outline' ? 2 : 0,
          },
          style,
          pressed && !isDisabled && { opacity: 0.94 },
        ]}
      >
        {isGradient ? (
          <LinearGradient
            colors={[...GRADIENTS[variant as 'primary' | 'secondary' | 'accent']] as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: BORDERS.RADIUS.XL },
            ]}
          />
        ) : null}
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDERS.RADIUS.XL,
    overflow: 'hidden',
    minWidth: SPACING.TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: FONT.brand,
    fontWeight: '900',
    textAlign: 'center',
  },
});
