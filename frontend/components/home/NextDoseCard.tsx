import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '@/contexts/AppSettingsContext';
import { formatTime, type ScheduleItem } from '@/types/tracker';

type Props = {
  item: ScheduleItem;
  onMark: () => void;
};

export default function NextDoseCard({ item, onMark }: Props) {
  const t = useT();

  const minsAway = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const scheduledMin = item.hour * 60 + item.minute;
    return scheduledMin - nowMin;
  }, [item.hour, item.minute]);

  const badgeText = useMemo(() => {
    if (item.status === 'taken') return 'Taken';
    if (minsAway < 0) return 'Overdue';
    if (minsAway < 60) return `Next: ${minsAway} mins`;
    const hrs = Math.floor(minsAway / 60);
    return `Next: ${hrs}h ${minsAway % 60}m`;
  }, [minsAway, item.status]);

  return (
    <View
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-white/5"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 3,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          style={{ backgroundColor: item.tagColor || '#E3EEFA' }}
          className="h-12 w-12 items-center justify-center rounded-2xl"
        >
          <Ionicons name="medkit" size={22} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-ink mr-2 flex-1 text-base font-bold dark:text-white"
              numberOfLines={1}
            >
              {item.medicineName}
            </Text>
            {item.status !== 'taken' && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: '#005BC4' }}
              >
                <Text className="text-[10px] font-bold text-white">
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-ink-subtle text-xs">
            {item.dosage.amount}
            {item.dosage.unit ? ` ${item.dosage.unit}` : ''}
            {' • '}After Breakfast
          </Text>
        </View>
      </View>

      <View className="bg-surface-divider mt-3 h-px w-full dark:bg-white/5" />

      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-ink-subtle text-[10px] font-bold tracking-widest">
            SCHEDULED TIME
          </Text>
          <Text className="text-ink text-lg font-bold dark:text-white">
            {formatTime(item.hour, item.minute)}
          </Text>
        </View>
        {item.status === 'taken' ? (
          <View className="bg-accent-success/15 flex-row items-center gap-1 rounded-full px-4 py-2">
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text className="text-accent-success text-xs font-semibold">
              {t('home.dash.taken')}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onMark}
            className="rounded-full px-5 py-2.5"
            style={{ backgroundColor: '#005BC4' }}
          >
            <Text className="text-xs font-semibold text-white">
              {t('home.dash.markTaken')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
