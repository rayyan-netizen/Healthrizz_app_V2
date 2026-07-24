import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT } from '@lib/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override the default app gradient */
  colors?: readonly [string, string, ...string[]];
}

/**
 * Faithful port of web `bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100`.
 * Goes top-left → bottom-right.
 */
export function BrandBackground({ children, style, colors }: Props) {
  return (
    <LinearGradient
      colors={(colors ?? GRADIENT.appBackground) as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}
