import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, Rect } from 'react-native-svg';
import ScanMedicineIcon from '@/components/svgs/ScanMedicineIcon';
import InsideIcon from '@/components/svgs/InsideIcon';

type Props = {
  variant: 'scan' | 'know' | 'alerts';
};

function AlertsPlaceholder() {
  return (
    <Svg width={280} height={280} viewBox="0 0 280 280">
      <Defs>
        <LinearGradient id="bg-alerts" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E3EEFA" stopOpacity="1" />
          <Stop offset="1" stopColor="#C1DAF2" stopOpacity="0.6" />
        </LinearGradient>
        <LinearGradient id="primary-alerts" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2D7FCC" stopOpacity="1" />
          <Stop offset="1" stopColor="#005FB8" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Circle cx="140" cy="140" r="128" fill="url(#bg-alerts)" />
      <Circle cx="140" cy="140" r="92" fill="#C1DAF2" opacity="0.5" />
      <Circle cx="140" cy="140" r="66" fill="url(#primary-alerts)" />
      <Path
        d="M 140 92 Q 112 92 112 124 L 112 148 L 104 164 L 176 164 L 168 148 L 168 124 Q 168 92 140 92 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <Circle cx="140" cy="176" r="8" fill="#FFFFFF" opacity="0.95" />
      <Circle cx="166" cy="104" r="10" fill="#DC2626" />
      <Rect x="162" y="99" width="8" height="2" rx="1" fill="#FFFFFF" />
      <Rect x="163" y="103" width="6" height="2" rx="1" fill="#FFFFFF" />
    </Svg>
  );
}

export default function OnboardingIllustration({ variant }: Props) {
  return (
    <View
      style={{ width: 280, height: 280 }}
      className="items-center justify-center"
    >
      {variant === 'scan' && <ScanMedicineIcon />}
      {variant === 'know' && <InsideIcon />}
      {variant === 'alerts' && <AlertsPlaceholder />}
    </View>
  );
}
