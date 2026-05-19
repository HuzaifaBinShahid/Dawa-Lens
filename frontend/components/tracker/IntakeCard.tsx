import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, type ScheduleItem } from '@/types/tracker';
import { useT } from '@/contexts/AppSettingsContext';

type Props = {
  item: ScheduleItem;
  onMark: (status: 'taken' | 'skipped') => void;
};

const C = {
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#475569',
  textSubtle: '#64748B',
  primary: '#005FB8',
  primaryFab: '#005BC4',
  primaryBg: '#E3EEFA',
  border: 'rgba(0, 88, 190, 0.10)',
  divider: '#F1F5F9',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.12)',
};

export default function IntakeCard({ item, onMark }: Props) {
  const t = useT();
  const isTaken = item.status === 'taken';
  const isSkipped = item.status === 'skipped';

  return (
    <View
      className="mb-3 rounded-2xl"
      style={{
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: item.tagColor || C.primaryFab }}
          className="h-11 w-11 items-center justify-center rounded-2xl"
        >
          <Ionicons name="medkit" size={20} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-bold"
            style={{ color: C.text }}
            numberOfLines={1}
          >
            {item.medicineName}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: C.primaryBg }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: C.primary }}
              >
                {item.dosage.amount}
                {item.dosage.unit}
              </Text>
            </View>
            {!!item.medicineForm && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: C.primaryBg }}
              >
                <Text
                  className="text-[10px] font-semibold"
                  style={{ color: C.primary }}
                >
                  {item.medicineForm}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text className="text-xs font-medium" style={{ color: C.textSubtle }}>
          {formatTime(item.hour, item.minute)}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        {isTaken ? (
          <View
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3.5"
            style={{ backgroundColor: C.successBg }}
          >
            <Ionicons name="checkmark-circle" size={16} color={C.success} />
            <Text className="text-sm font-bold" style={{ color: C.success }}>
              {t('tracker.taken')}
            </Text>
          </View>
        ) : isSkipped ? (
          <View
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border py-3.5"
            style={{ backgroundColor: C.card, borderColor: C.divider }}
          >
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
            <Text
              className="text-sm font-bold"
              style={{ color: C.textSubtle }}
            >
              {t('tracker.skipped')}
            </Text>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => onMark('skipped')}
              className="flex-1 items-center justify-center rounded-2xl py-3.5"
              style={{
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.divider,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: C.textMuted }}
              >
                {t('tracker.skip')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onMark('taken')}
              className="flex-1 items-center justify-center rounded-2xl py-3.5"
              style={{
                backgroundColor: C.primaryFab,
                shadowColor: C.primaryFab,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-sm font-semibold text-white">
                {t('tracker.markTaken')}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
