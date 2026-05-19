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

export default function SyrupBottle({ width = 36, height = 36 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Defs>
        <LinearGradient id="syrupBody" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FCA5A5" />
          <Stop offset="1" stopColor="#EF4444" />
        </LinearGradient>
        <LinearGradient id="syrupCap" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E2E8F0" />
        </LinearGradient>
      </Defs>
      <Rect x="11" y="4" width="14" height="5" rx="1.5" fill="url(#syrupCap)" stroke="#CBD5E1" strokeWidth="0.5" />
      <Rect x="13" y="9" width="10" height="2.5" fill="#E2E8F0" />
      <Path
        d="M 9 14 Q 9 11.5 12 11.5 L 24 11.5 Q 27 11.5 27 14 L 27 28 Q 27 31 24 31 L 12 31 Q 9 31 9 28 Z"
        fill="url(#syrupBody)"
      />
      <Rect x="12" y="16" width="12" height="8" rx="1" fill="#FFFFFF" opacity="0.92" />
      <Path d="M 14 18 L 22 18 M 14 20.5 L 20 20.5 M 14 22.5 L 21 22.5" stroke="#EF4444" strokeWidth="0.6" strokeLinecap="round" />
      <Circle cx="22" cy="27" r="1.2" fill="#FFFFFF" opacity="0.5" />
    </Svg>
  );
}
