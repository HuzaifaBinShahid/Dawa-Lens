import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
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
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fadeIn':
        return { opacity: progress.value };
      case 'slideUp':
        return {
          opacity: progress.value,
          transform: [{ translateY: 24 * (1 - progress.value) }],
        };
      case 'slideLeft':
        return {
          opacity: progress.value,
          transform: [{ translateX: 32 * (1 - progress.value) }],
        };
      case 'scale':
        // Legacy 'scale' mode: the bouncy scale pop has been retired.
        // Behaves as a gentle fade-slide so callers don't need to change.
        return {
          opacity: progress.value,
          transform: [{ translateY: 12 * (1 - progress.value) }],
        };
      case 'fadeSlideUp':
      default:
        return {
          opacity: progress.value,
          transform: [{ translateY: 16 * (1 - progress.value) }],
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
