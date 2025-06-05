import React, { useMemo, useRef } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle, Animated, Platform} from 'react-native';
import { useHoverColor } from '@/hooks/useHoverColor';


// Define a generic icon component type
type AnyIconComponent = React.ComponentType<any>;

interface HoverableIconProps {
    IconComponent: AnyIconComponent;
    iconProps: Record<string, any>;
    fromColor: string;
    toColor: string;
    containerStyle?: StyleProp<ViewStyle>;
    iconStyle?: StyleProp<ViewStyle>;
    hoverContainerStyle?: StyleProp<ViewStyle>;
    hoverIconStyle?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export function HoverableIcon({
  IconComponent,
  iconProps,
  fromColor,
  toColor,
  containerStyle,
  iconStyle,
  hoverContainerStyle,
  hoverIconStyle,
  onPress,
}: HoverableIconProps) {
  
  // Hook to interpolate hover color using Animated.Value
  const { color, onHoverIn, onHoverOut } = useHoverColor(fromColor, toColor);

  // Wrap icon in an animated component
  const AnimatedIcon = useMemo(()=> Animated.createAnimatedComponent(IconComponent), [IconComponent]);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      style={({ hovered }) => [
        styles.baseContainer,
        containerStyle,
        hovered && hoverContainerStyle,
      ]}
    >
      <AnimatedIcon
        {...iconProps}
        color={color as unknown as string}
        style={[
          iconStyle,
          hoverIconStyle ? (Platform.OS === "web" && hoverIconStyle) : null,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  }
});