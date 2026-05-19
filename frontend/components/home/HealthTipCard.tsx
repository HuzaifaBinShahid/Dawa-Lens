import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useT } from '@/contexts/AppSettingsContext';

type Props = {
  text: string;
  variant?: 'cream' | 'blue';
  title?: string;
};

export default function HealthTipCard({ text, variant = 'cream', title }: Props) {
  const t = useT();
  const heading = title || t('home.dash.healthTip');

  if (variant === 'blue') {
    return (
      <View
        className="mt-2 overflow-hidden rounded-2xl p-4"
        style={{ backgroundColor: '#2D7FCC' }}
      >
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: -20, top: -20 }}
        >
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.08)" />
          </Svg>
        </View>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: -10, bottom: -30 }}
        >
          <Svg width={70} height={70} viewBox="0 0 70 70">
            <Circle cx="35" cy="35" r="32" fill="rgba(255,255,255,0.06)" />
          </Svg>
        </View>
        <View className="mb-2 flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-amber-200">
            <Ionicons name="bulb" size={14} color="#D97706" />
          </View>
          <Text className="text-sm font-bold text-white">{heading}</Text>
        </View>
        <Text className="text-sm leading-5 text-white/90">{text}</Text>
      </View>
    );
  }

  return (
    <View
      className="mt-2 flex-row items-start gap-3 rounded-2xl p-4"
      style={{ backgroundColor: '#FFDCC6' }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: '#FFDCC6' }}
      >
        <Ionicons name="bulb" size={18} color="#723600" />
      </View>
      <View className="flex-1">
        <Text
          className="mb-1 text-sm font-bold"
          style={{ color: '#723600' }}
        >
          {heading}
        </Text>
        <Text
          className="text-xs leading-5"
          style={{ color: '#723600' }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}
