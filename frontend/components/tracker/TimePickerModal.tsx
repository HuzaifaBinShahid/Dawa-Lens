import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  title: string;
  initialHour: number;
  initialMinute: number;
  onCancel: () => void;
  onConfirm: (hour: number, minute: number) => void;
};

const C = {
  card: '#FFFFFF',
  text: '#1E293B',
  textSubtle: '#64748B',
  textFaint: '#94A3B8',
  primaryFab: '#005BC4',
  primaryBg: '#E3EEFA',
  border: 'rgba(0, 88, 190, 0.10)',
  divider: '#F1F5F9',
  inactive: '#EFF2F7',
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function toH12(hour24: number) {
  const h = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  return { h, ampm };
}

function toH24(h12: number, ampm: 'AM' | 'PM') {
  if (ampm === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

export default function TimePickerModal({
  visible,
  title,
  initialHour,
  initialMinute,
  onCancel,
  onConfirm,
}: Props) {
  const init = toH12(initialHour);
  const [h12, setH12] = useState(init.h);
  const [minute, setMinute] = useState(initialMinute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(init.ampm);

  useEffect(() => {
    if (visible) {
      const i = toH12(initialHour);
      setH12(i.h);
      setMinute(initialMinute);
      setAmpm(i.ampm);
    }
  }, [visible, initialHour, initialMinute]);

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
        <Animated.View
          entering={SlideInDown.duration(280)}
          exiting={SlideOutDown.duration(200)}
          style={{
            backgroundColor: C.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E2E8F0',
              marginBottom: 16,
            }}
          />
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: C.text }}>
              {title}
            </Text>
            <Pressable
              onPress={onCancel}
              hitSlop={12}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: C.inactive }}
            >
              <Ionicons name="close" size={18} color={C.textSubtle} />
            </Pressable>
          </View>

          <View className="mb-2 flex-row items-center justify-center gap-3">
            <Text className="text-4xl font-bold" style={{ color: C.primaryFab }}>
              {String(h12).padStart(2, '0')}
            </Text>
            <Text className="text-4xl font-bold" style={{ color: C.textFaint }}>
              :
            </Text>
            <Text className="text-4xl font-bold" style={{ color: C.primaryFab }}>
              {String(minute).padStart(2, '0')}
            </Text>
            <View className="ml-2 flex-col gap-1">
              {(['AM', 'PM'] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setAmpm(p)}
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: ampm === p ? C.primaryFab : C.inactive,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: ampm === p ? '#FFFFFF' : C.textSubtle }}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text className="mb-1 mt-3 text-xs font-semibold" style={{ color: C.textSubtle }}>
            HOUR
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {HOURS_12.map((h) => {
              const active = h === h12;
              return (
                <Pressable
                  key={h}
                  onPress={() => setH12(h)}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: active ? C.primaryFab : C.inactive,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: active ? '#FFFFFF' : C.text }}
                  >
                    {h}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text className="mb-1 text-xs font-semibold" style={{ color: C.textSubtle }}>
            MINUTE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {MINUTES.map((m) => {
              const active = m === minute;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMinute(m)}
                  className="h-11 min-w-[44px] items-center justify-center rounded-full px-3"
                  style={{
                    backgroundColor: active ? C.primaryFab : C.inactive,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: active ? '#FFFFFF' : C.text }}
                  >
                    {String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => onConfirm(toH24(h12, ampm), minute)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full"
            style={{
              backgroundColor: C.primaryFab,
              shadowColor: C.primaryFab,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold text-white">Confirm</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
