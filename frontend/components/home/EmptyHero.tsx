import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '@/contexts/AppSettingsContext';
import HeaderImage from '@/components/svgs/HomeScreen/HeaderImage';

type Props = {
  onAdd: () => void;
  onScan: () => void;
};

export default function EmptyHero({ onAdd, onScan }: Props) {
  const t = useT();
  return (
    <View
      className="mb-4 items-center rounded-2xl bg-white p-5 dark:bg-white/5"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 3,
      }}
    >
      <View className="mb-3 items-center justify-center">
        <HeaderImage width={220} height={220} />
      </View>
      <Text className="text-ink mb-2 text-center text-lg font-bold dark:text-white">
        {t('home.dash.empty.headline')}
      </Text>
      <Text className="text-ink-muted mb-5 max-w-[260px] text-center text-md leading-5">
        {t('home.dash.empty.body')}
      </Text>
      <Pressable
        onPress={onAdd}
        className="mb-4 h-16 w-full flex-row items-center justify-center gap-2 rounded-lg"
        style={{ backgroundColor: '#005BC4' }}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text className="text-md font-semibold text-white">
          {t('home.dash.empty.cta.add')}
        </Text>
      </Pressable>
      <Pressable
        onPress={onScan}
        className="bg-primary-50 h-16 w-full flex-row items-center justify-center gap-2 rounded-lg"
      >
        <Ionicons name="scan" size={18} color="#005FB8" />
        <Text className="text-primary-600 text-md font-semibold">
          {t('home.dash.empty.cta.scan')}
        </Text>
      </Pressable>
    </View>
  );
}
