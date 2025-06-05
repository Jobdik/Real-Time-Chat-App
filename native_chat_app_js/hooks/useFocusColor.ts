import {useRef, useCallback} from 'react';
import {Animated} from 'react-native';

/**
 * @param fromColor
 * @param toColor
 * @param duration
 */
export function useFocusColor(fromColor: string, toColor: string, duration = 200) {
    const anim = useRef(new Animated.Value(0)).current;

    const onFocusIn = useCallback(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: false,
        }).start();
    }, [anim, duration]);

    const onFocusOut = useCallback(() => {
        Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: false,
        }).start();
    }, [anim, duration]);

    const borderColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [fromColor, toColor],
    });

    return { borderColor, onFocusIn, onFocusOut };
}