import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ScheduleItem, TimeLabel } from '@/types/tracker';
import IntakeCard from './IntakeCard';
import { useT } from '@/contexts/AppSettingsContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SECTION_META: Record<TimeLabel, { icon: IconName; tint: string }> = {
  morning: { icon: 'sunny', tint: '#F59E0B' },
  afternoon: { icon: 'partly-sunny', tint: '#F97316' },
  evening: { icon: 'moon', tint: '#6366F1' },
  night: { icon: 'moon', tint: '#7C3AED' },
};

type Props = {
  label: TimeLabel;
  items: ScheduleItem[];
  onMark: (item: ScheduleItem, status: 'taken' | 'skipped') => void;
};

export default function MealSection({ label, items, onMark }: Props) {
  const t = useT();
  const meta = SECTION_META[label];
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name={meta.icon} size={16} color={meta.tint} />
        <Text className="text-ink text-sm font-bold dark:text-white">
          {t(`tracker.section.${label}`)}
        </Text>
      </View>
      {items.length === 0 ? (
        <View className="bg-surface-card flex-row items-center gap-2 rounded-2xl p-4 dark:bg-white/5">
          <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
          <Text className="text-ink-subtle text-sm">
            {t('tracker.empty.section')}
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <IntakeCard
            key={`${item.trackerId}-${item.timeLabel}`}
            item={item}
            onMark={(status) => onMark(item, status)}
          />
        ))
      )}
    </View>
  );
}
