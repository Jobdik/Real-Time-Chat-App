import React from 'react';
import {TextInput, TextInputProps, StyleSheet,StyleProp, ViewStyle, Platform, Animated} from 'react-native';

import { useFocusColor } from '@/hooks/useFocusColor';
import { Colors } from '@/constants/Colors';

// Wrap the native TextInput with animation support
const AnimatedInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedTextInputProps extends TextInputProps {
    colorFrom?: string;
    colorTo?: string;
    borderWidth?: number;

    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<ViewStyle>;
}

export default function AnimatedTextInput({
  colorFrom = Colors.dark.Border,   
  colorTo = Colors.dark.Accent,   
  borderWidth = 1,
  containerStyle,
  inputStyle,
  onFocus: propOnFocus,
  onBlur: propOnBlur,
  style,
  ...restProps
}: AnimatedTextInputProps) {

  const { borderColor, onFocusIn, onFocusOut } =
    useFocusColor(colorFrom, colorTo, 200);

  return (
    <AnimatedInput
      {...restProps}
      style={[
        styles.base,
        { borderColor, borderWidth },
        containerStyle,
        inputStyle,
        style,
      ]}
      placeholderTextColor="#888"
      onFocus={(e) => {
        onFocusIn();
        propOnFocus?.(e);
      }}
      onBlur={(e) => {
        onFocusOut();
        propOnBlur?.(e);
      }}
    />
  );
}

const styles = StyleSheet.create({
  base: {
  },
});