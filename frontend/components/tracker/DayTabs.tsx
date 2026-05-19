import React, { useMemo } from 'react';
import { View, Pressable, Text } from 'react-native';

type Props = {
  selected: string;
  onChange: (dateKey: string) => void;
};

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const toKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

export default function DayTabs({ selected, onChange }: Props) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 2);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        key: toKey(d),
        label: DAY_LABELS[d.getDay()],
        date: d.getDate(),
        isToday:
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate(),
      };
    });
  }, []);

  return (
    <View className="flex-row items-center justify-between">
      {days.map((d) => {
        const active = d.key === selected;
        return (
          <Pressable
            key={d.key}
            onPress={() => onChange(d.key)}
            className={
              active
                ? 'bg-primary-600 items-center rounded-2xl px-3 py-2'
                : 'items-center px-3 py-2'
            }
          >
            <Text
              className={
                active
                  ? 'text-[10px] font-bold tracking-wider text-white'
                  : 'text-ink-subtle text-[10px] font-bold tracking-wider'
              }
            >
              {d.label}
            </Text>
            <Text
              className={
                active
                  ? 'text-base font-bold text-white'
                  : 'text-ink text-base font-bold dark:text-white'
              }
            >
              {d.date}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
