import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, type ScheduleItem } from '@/types/tracker';
import { useT } from '@/contexts/AppSettingsContext';

const C = {
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#475569',
  textSubtle: '#64748B',
  textFaint: '#94A3B8',
  primaryFab: '#005BC4',
  primaryBg: '#E3EEFA',
  border: 'rgba(0, 88, 190, 0.10)',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.12)',
};

type UpcomingItem = ScheduleItem & {
  dateKey: string;
  dateLabel: string;
};

type Props = {
  items: UpcomingItem[];
  onMark: (item: UpcomingItem) => void;
  onViewAll: () => void;
};

function Row({ item, onMark }: { item: UpcomingItem; onMark: () => void }) {
  const t = useT();
  return (
    <View
      className="mb-2 rounded-2xl p-3"
      style={{
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: item.tagColor || C.primaryBg }}
          className="h-11 w-11 items-center justify-center rounded-2xl"
        >
          <Ionicons name="medkit" size={18} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-bold"
            style={{ color: C.text }}
            numberOfLines={1}
          >
            {item.medicineName}
          </Text>
          <Text className="text-[11px]" style={{ color: C.textSubtle }}>
            {item.dosage.amount}
            {item.dosage.unit ? ` ${item.dosage.unit}` : ''}
            {'  •  '}
            {item.dateLabel}
            {' · '}
            {formatTime(item.hour, item.minute)}
          </Text>
        </View>
        {item.status === 'taken' ? (
          <View
            className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
            style={{ backgroundColor: C.successBg }}
          >
            <Ionicons name="checkmark-circle" size={14} color={C.success} />
            <Text className="text-[11px] font-bold" style={{ color: C.success }}>
              {t('home.dash.taken')}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onMark}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: C.primaryFab }}
          >
            <Text className="text-[11px] font-semibold text-white">
              {t('home.dash.markTaken')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function UpcomingDosesList({ items, onMark, onViewAll }: Props) {
  const t = useT();
  if (items.length === 0) return null;

  return (
    <View className="mb-2">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold" style={{ color: C.text }}>
          Upcoming Doses
        </Text>
        <Text className="text-[10px] font-bold tracking-widest" style={{ color: C.textSubtle }}>
          NEXT {items.length}
        </Text>
      </View>
      {items.map((it) => (
        <Row
          key={`${it.trackerId}-${it.dateKey}-${it.timeLabel}`}
          item={it}
          onMark={() => onMark(it)}
        />
      ))}
      <Pressable
        onPress={onViewAll}
        className="mt-1 h-12 flex-row items-center justify-center gap-2 rounded-full"
        style={{
          backgroundColor: C.primaryBg,
        }}
      >
        <Ionicons name="list" size={16} color={C.primaryFab} />
        <Text className="text-sm font-semibold" style={{ color: C.primaryFab }}>
          View All Medicines
        </Text>
      </Pressable>
    </View>
  );
}
