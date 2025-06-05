import {useRef, useCallback} from 'react';
import {Animated} from 'react-native';

/**
 * @param fromColor
 * @param toColor
 * @param duration
 * @returns  {
 *  color: Animated.AnimatedInterpolation<sring>;
 *  onHoverIn: () => void;
 *  onHoverOut: () => void;
 * }
 */

export function useHoverColor(fromColor: string, toColor: string, duration = 200) {
    const anim = useRef(new Animated.Value(0)).current;

    const onHoverIn = useCallback(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: false,
        }).start();
    }, [anim, duration]);

    const onHoverOut = useCallback(() => {
        Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: false,
        }).start();
    }, [anim, duration]);

    const color = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [fromColor, toColor],
    });

    return { color, onHoverIn, onHoverOut };
}