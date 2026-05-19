import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

type Props = {
  count: number;
  progress: SharedValue<number>;
};

function Dot({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const width = interpolate(
      distance,
      [0, 1],
      [28, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      distance,
      [0, 1],
      [1, 0.35],
      Extrapolation.CLAMP
    );
    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={style}
      className="h-2 rounded-full bg-primary-600"
    />
  );
}

export default function OnboardingDots({ count, progress }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} progress={progress} />
      ))}
    </View>
  );
}
