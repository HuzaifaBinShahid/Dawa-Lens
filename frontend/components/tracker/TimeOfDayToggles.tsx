import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TimeLabel } from '@/types/tracker';
import { useT } from '@/contexts/AppSettingsContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  values: TimeLabel[];
  onToggle: (label: TimeLabel) => void;
};

const OPTIONS: { label: TimeLabel; icon: IconName; color: string }[] = [
  { label: 'morning', icon: 'sunny', color: '#F59E0B' },
  { label: 'afternoon', icon: 'partly-sunny', color: '#F97316' },
  { label: 'evening', icon: 'moon', color: '#6366F1' },
  { label: 'night', icon: 'moon', color: '#7C3AED' },
];

const PRIMARY = '#005BC4';
const INACTIVE_BG = '#EFF2F7';
const INACTIVE_TEXT = '#475569';

export default function TimeOfDayToggles({ values, onToggle }: Props) {
  const t = useT();
  return (
    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
      {OPTIONS.map((opt) => {
        const active = values.includes(opt.label);
        return (
          <View
            key={opt.label}
            style={{ width: '50%', padding: 4 }}
          >
            <Pressable
              onPress={() => onToggle(opt.label)}
              className="flex-row items-center justify-center gap-2 rounded-full"
              style={{
                backgroundColor: active ? PRIMARY : INACTIVE_BG,
                paddingVertical: 14,
                paddingHorizontal: 10,
              }}
            >
              <Ionicons name={opt.icon} size={16} color={opt.color} />
              <Text
                className="text-sm font-semibold"
                style={{ color: active ? '#FFFFFF' : INACTIVE_TEXT }}
              >
                {t(`tracker.section.${opt.label}`)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
