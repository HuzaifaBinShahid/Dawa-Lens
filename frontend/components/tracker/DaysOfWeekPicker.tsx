import React from 'react';
import { View, Pressable, Text } from 'react-native';

type Props = {
  values: number[];
  onToggle: (day: number) => void;
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const C = {
  primaryFab: '#005BC4',
  inactive: '#EFF2F7',
  text: '#1E293B',
  textSubtle: '#64748B',
};

export default function DaysOfWeekPicker({ values, onToggle }: Props) {
  return (
    <View className="flex-row justify-between">
      {DAYS.map((label, idx) => {
        const active = values.includes(idx);
        return (
          <Pressable
            key={idx}
            onPress={() => onToggle(idx)}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: active ? C.primaryFab : C.inactive,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: active ? '#FFFFFF' : C.textSubtle }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
