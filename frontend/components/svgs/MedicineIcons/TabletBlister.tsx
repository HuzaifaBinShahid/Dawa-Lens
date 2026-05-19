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

export default function TabletBlister({ width = 36, height = 36 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Defs>
        <LinearGradient id="blisterFoil" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F8FAFC" />
          <Stop offset="1" stopColor="#CBD5E1" />
        </LinearGradient>
        <LinearGradient id="tabletPill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="1" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      <Rect
        x="4"
        y="9"
        width="28"
        height="18"
        rx="3"
        fill="url(#blisterFoil)"
        stroke="#94A3B8"
        strokeWidth="0.6"
      />
      <Circle cx="11" cy="18" r="4" fill="url(#tabletPill)" />
      <Path d="M 8 18 L 14 18" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" />
      <Circle cx="18" cy="18" r="4" fill="url(#tabletPill)" />
      <Path d="M 15 18 L 21 18" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" />
      <Circle cx="25" cy="18" r="4" fill="url(#tabletPill)" />
      <Path d="M 22 18 L 28 18" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" />
      <Circle cx="11" cy="17" r="1" fill="#FFFFFF" opacity="0.35" />
      <Circle cx="18" cy="17" r="1" fill="#FFFFFF" opacity="0.35" />
      <Circle cx="25" cy="17" r="1" fill="#FFFFFF" opacity="0.35" />
    </Svg>
  );
}
