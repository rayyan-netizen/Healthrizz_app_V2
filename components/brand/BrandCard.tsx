import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { BORDERS, SPACING, BG, SHADOW } from '@lib/theme';

interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export function BrandCard({
  children,
  variant = 'default',
  style,
  padding = SPACING.LG,
}: Props) {
  return (
    <View
      style={[
        styles.base,
        { padding, borderRadius: BORDERS.RADIUS.XL2 },
        variant === 'elevated' && [styles.elevated, SHADOW.CARD_LG],
        variant === 'outlined' && styles.outlined,
        variant === 'default' && styles.default,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  default: {
    backgroundColor: BG.DEFAULT,
    borderWidth: 1,
    borderColor: BG.muted,
  },
  elevated: {
    backgroundColor: BG.DEFAULT,
    borderWidth: 1,
    borderColor: BG.muted,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFE599',
  },
});
