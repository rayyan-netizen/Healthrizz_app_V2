import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BORDERS, COLORS, SPACING, TYPOGRAPHY } from '@lib/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...rest}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          rest.style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
  },
  label: {
    ...TYPOGRAPHY.BODY_BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  input: {
    height: 56,
    borderWidth: BORDERS.WIDTH.DEFAULT,
    borderColor: '#E5E7EB',
    borderRadius: BORDERS.RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: COLORS.BRAND_BLUE,
    borderWidth: BORDERS.WIDTH.THICK,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.ERROR,
    marginTop: SPACING.XS,
  },
  helperText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
});
