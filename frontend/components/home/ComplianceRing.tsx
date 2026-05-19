import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  percent: number;
  outer?: number;
  scanned?: number;
};

export default function ComplianceRing({
  percent,
  outer,
  scanned,
}: Props) {
  const size = 200;
  const stroke = 16;
  const gap = 8;
  const outerRadius = (size - stroke) / 2;
  const innerRadius = outerRadius - stroke - gap;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const outerProgress = useSharedValue(0);
  const innerProgress = useSharedValue(0);

  const outerTarget = typeof scanned === 'number' ? scanned / 100 : percent / 100;
  const innerTarget = percent / 100;

  useEffect(() => {
    outerProgress.value = withTiming(outerTarget, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    innerProgress.value = withTiming(innerTarget, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [outerTarget, innerTarget]);

  const outerAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: outerCircumference * (1 - outerProgress.value),
  }));
  const innerAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: innerCircumference * (1 - innerProgress.value),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F59E0B" />
            <Stop offset="1" stopColor="#C2410C" />
          </LinearGradient>
          <LinearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2D7FCC" />
            <Stop offset="1" stopColor="#005FB8" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          stroke="#FEF3C7"
          strokeWidth={stroke}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          stroke="url(#orangeGrad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${outerCircumference} ${outerCircumference}`}
          animatedProps={outerAnimatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          stroke="#E3EEFA"
          strokeWidth={stroke}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          stroke="url(#blueGrad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${innerCircumference} ${innerCircumference}`}
          animatedProps={innerAnimatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute' }} className="items-center justify-center">
        <Text className="text-primary-600 text-3xl font-bold">{percent}%</Text>
        <Text className="text-ink-subtle text-xs">Compliance</Text>
      </View>
    </View>
  );
}
