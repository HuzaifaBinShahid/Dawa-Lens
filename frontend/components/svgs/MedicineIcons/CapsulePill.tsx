import * as React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  Circle,
  G,
} from 'react-native-svg';

type Props = { width?: number; height?: number };

export default function CapsulePill({ width = 36, height = 36 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Defs>
        <LinearGradient id="capLeft" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FDBA74" />
          <Stop offset="1" stopColor="#EA580C" />
        </LinearGradient>
        <LinearGradient id="capRight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FEF3C7" />
          <Stop offset="1" stopColor="#FCD34D" />
        </LinearGradient>
      </Defs>
      <G transform="rotate(-35, 18, 18)">
        <Path
          d="M 6 13 Q 6 10 9 10 L 18 10 L 18 26 L 9 26 Q 6 26 6 23 Z"
          fill="url(#capLeft)"
        />
        <Path
          d="M 18 10 L 27 10 Q 30 10 30 13 L 30 23 Q 30 26 27 26 L 18 26 Z"
          fill="url(#capRight)"
        />
        <Rect x="8" y="12" width="3" height="3" rx="1" fill="#FFFFFF" opacity="0.4" />
      </G>
    </Svg>
  );
}
