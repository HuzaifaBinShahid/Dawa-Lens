import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TAG_COLORS } from '@/types/tracker';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorTagPicker({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-3">
      {TAG_COLORS.map((c) => {
        const isActive = c === value;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={
              isActive
                ? {
                    backgroundColor: c,
                    borderWidth: 2,
                    borderColor: c,
                    shadowColor: c,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    elevation: 4,
                  }
                : { backgroundColor: c }
            }
          >
            {isActive && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
