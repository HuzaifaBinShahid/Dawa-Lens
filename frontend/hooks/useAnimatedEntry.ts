import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale' | 'fadeSlideUp';

export function useAnimatedEntry(
  delay: number = 0,
  type: AnimationType = 'fadeSlideUp',
  duration: number = 500
) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      type === 'scale'
        ? withSpring(1, { damping: 12, stiffness: 100 })
        : withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fadeIn':
        return { opacity: progress.value };
      case 'slideUp':
        return {
          opacity: progress.value,
          transform: [{ translateY: 30 * (1 - progress.value) }],
        };
      case 'slideLeft':
        return {
          opacity: progress.value,
          transform: [{ translateX: 40 * (1 - progress.value) }],
        };
      case 'scale':
        return {
          opacity: progress.value,
          transform: [{ scale: progress.value }],
        };
      case 'fadeSlideUp':
      default:
        return {
          opacity: progress.value,
          transform: [{ translateY: 20 * (1 - progress.value) }],
        };
    }
  });

  return animatedStyle;
}

export function useProgressAnimation(duration: number = 2500) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.inOut(Easing.cubic),
    });
  }, []);

  return progress;
}
