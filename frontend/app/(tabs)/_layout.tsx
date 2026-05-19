import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import BottomNav from '@/components/common/BottomNav';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function TabsLayout() {
  const { palette } = useAppSettings();
  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <View className="flex-1">
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}
