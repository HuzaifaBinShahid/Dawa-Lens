import * as React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Ellipse,
  G,
} from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
};

export default function HeaderImage({ width = 220, height = 220 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 220" fill="none">
      <Defs>
        <LinearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F8FAFC" />
          <Stop offset="1" stopColor="#E2E8F0" />
        </LinearGradient>
        <LinearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E3EEFA" />
          <Stop offset="1" stopColor="#C1DAF2" />
        </LinearGradient>
        <LinearGradient id="avatarBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5798D6" />
          <Stop offset="1" stopColor="#005FB8" />
        </LinearGradient>
        <LinearGradient id="cross" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FB7185" />
          <Stop offset="1" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>

      <Ellipse cx="110" cy="200" rx="64" ry="8" fill="#0F172A" opacity="0.12" />

      <Rect
        x="56"
        y="22"
        width="108"
        height="172"
        rx="20"
        fill="url(#phoneBody)"
        stroke="#CBD5E1"
        strokeWidth="1.2"
      />

      <Rect x="64" y="36" width="92" height="144" rx="12" fill="url(#screen)" />

      <Rect x="96" y="40" width="28" height="5" rx="2.5" fill="#94A3B8" opacity="0.5" />
      <Rect x="92" y="172" width="36" height="3" rx="1.5" fill="#94A3B8" opacity="0.5" />

      <Circle cx="110" cy="100" r="26" fill="#FFFFFF" />
      <Path
        d="M 84 142 Q 84 122 110 122 Q 136 122 136 142 L 136 162 L 84 162 Z"
        fill="url(#avatarBg)"
      />
      <Circle cx="110" cy="102" r="18" fill="#F4D5B3" />
      <Path
        d="M 92 100 Q 92 84 110 84 Q 128 84 128 100 L 128 96 Q 128 92 110 92 Q 92 92 92 96 Z"
        fill="#4A2C1A"
      />

      <Path
        d="M 100 130 Q 95 138 100 144 Q 105 150 110 144"
        stroke="#1E293B"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="100" cy="129" r="2.5" fill="#1E293B" />
      <Circle cx="110" cy="146" r="3" fill="#94A3B8" />

      <G>
        <Circle cx="170" cy="58" r="22" fill="url(#cross)" />
        <Rect x="166" y="48" width="8" height="20" rx="1.5" fill="#FFFFFF" />
        <Rect x="160" y="54" width="20" height="8" rx="1.5" fill="#FFFFFF" />
      </G>

      <Circle cx="42" cy="40" r="3" fill="#005FB8" opacity="0.25" />
      <Circle cx="38" cy="120" r="2" fill="#005FB8" opacity="0.18" />
      <Circle cx="180" cy="150" r="2.5" fill="#005FB8" opacity="0.22" />
      <Circle cx="190" cy="100" r="2" fill="#DC2626" opacity="0.3" />
    </Svg>
  );
}
