import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export default function LoadingAnimation() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(300 - delay), 
        ])
      );
    };


    const anim1 = createPulse(dot1, 0);
    const anim2 = createPulse(dot2, 150);
    const anim3 = createPulse(dot3, 300);

    Animated.stagger(0, [anim1, anim2, anim3]).start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { opacity: dot1, transform: [{ scale: dot1.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1.2]
          }) }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { opacity: dot2, transform: [{ scale: dot2.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1.2]
          }) }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { opacity: dot3, transform: [{ scale: dot3.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1.2]
          }) }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.Accent, 
    marginHorizontal: 4,
  },
});