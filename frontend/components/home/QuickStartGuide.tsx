import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '@/contexts/AppSettingsContext';

type Status = 'done' | 'active' | 'idle';

type Step = {
  num: number;
  titleKey: string;
  bodyKey: string;
  status: Status;
};

type Props = {
  completed?: number;
};

export default function QuickStartGuide({ completed = 0 }: Props) {
  const t = useT();
  const steps: Step[] = [
    {
      num: 1,
      titleKey: 'home.dash.step1.title',
      bodyKey: 'home.dash.step1.body',
      status: completed >= 1 ? 'done' : completed === 0 ? 'active' : 'idle',
    },
    {
      num: 2,
      titleKey: 'home.dash.step2.title',
      bodyKey: 'home.dash.step2.body',
      status: completed >= 2 ? 'done' : completed === 1 ? 'active' : 'idle',
    },
    {
      num: 3,
      titleKey: 'home.dash.step3.title',
      bodyKey: 'home.dash.step3.body',
      status: completed >= 3 ? 'done' : completed === 2 ? 'active' : 'idle',
    },
  ];

  return (
    <View>
      <Text className="text-ink-subtle mb-3 text-xs font-bold tracking-widest">
        {t('home.dash.quickStart')}
      </Text>
      {steps.map((s) => {
        const isActive = s.status === 'active';
        return (
          <View
            key={s.num}
            className="mb-3 overflow-hidden"
            style={{
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: 'rgba(0, 88, 190, 0.10)',
              backgroundColor: '#FFFFFF',
              shadowColor: 'rgba(31, 41, 55, 1)',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 30,
              elevation: 2,
            }}
          >
            <Pressable className="flex-row items-center gap-3 px-3 py-3">
              {isActive && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 4,
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                    backgroundColor: '#005BC4',
                  }}
                />
              )}
              <View
                className={
                  s.status === 'done'
                    ? 'h-10 w-10 items-center justify-center rounded-full'
                    : s.status === 'active'
                    ? 'bg-primary-50 h-10 w-10 items-center justify-center rounded-full'
                    : 'bg-surface-card h-10 w-10 items-center justify-center rounded-full'
                }
                style={
                  s.status === 'done' ? { backgroundColor: '#005BC4' } : undefined
                }
              >
                {s.status === 'done' ? (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                ) : (
                  <Text
                    className={
                      isActive
                        ? 'text-primary-700 text-sm font-bold'
                        : 'text-ink-subtle text-sm font-bold'
                    }
                  >
                    {s.num}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-ink text-sm font-bold dark:text-white">
                  {s.num}. {t(s.titleKey)}
                </Text>
                <Text className="text-ink-subtle text-xs">
                  {t(s.bodyKey)}
                </Text>
              </View>
              {s.status !== 'idle' && (
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
