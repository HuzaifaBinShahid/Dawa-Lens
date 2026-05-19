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

export default function Syringe({ width = 36, height = 36 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Defs>
        <LinearGradient id="syringeBarrel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A5F3FC" />
          <Stop offset="1" stopColor="#0E7490" />
        </LinearGradient>
        <LinearGradient id="syringeLiquid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#22D3EE" />
          <Stop offset="1" stopColor="#0891B2" />
        </LinearGradient>
      </Defs>
      <G transform="rotate(-35, 18, 18)">
        <Rect x="5" y="14" width="3" height="8" rx="0.5" fill="#475569" />
        <Rect x="8" y="15.5" width="2" height="5" rx="0.5" fill="#94A3B8" />
        <Path d="M 10 16 L 10 20 L 23 20 L 23 16 Z" fill="url(#syringeBarrel)" stroke="#0E7490" strokeWidth="0.4" />
        <Path d="M 11 16.5 L 11 19.5 L 16 19.5 L 16 16.5 Z" fill="url(#syringeLiquid)" />
        <Rect x="22.5" y="16.8" width="4" height="2.4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.3" />
        <Path d="M 26.5 17 L 30 17.6 L 30 18.4 L 26.5 19 Z" fill="#475569" />
        <Path d="M 30 17.7 L 33 18 L 33 18 L 30 18.3 Z" fill="#94A3B8" />
        <Path d="M 11 16.5 L 23.5 16.5 M 11 19.5 L 23.5 19.5" stroke="#FFFFFF" strokeWidth="0.3" opacity="0.6" />
        <Circle cx="13" cy="17.5" r="0.6" fill="#FFFFFF" opacity="0.6" />
      </G>
    </Svg>
  );
}
