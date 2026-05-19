import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useT } from '@/contexts/AppSettingsContext';
import { Api } from '@/services/api';
import AdherenceRing from '@/components/tracker/AdherenceRing';
import DayTabs from '@/components/tracker/DayTabs';
import MealSection from '@/components/tracker/MealSection';
import type {
  AdherenceResponse,
  ScheduleItem,
  ScheduleResponse,
  TimeLabel,
} from '@/types/tracker';

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const TIME_LABELS: TimeLabel[] = ['morning', 'afternoon', 'evening', 'night'];

function TrackerEmpty({ onAdd }: { onAdd: () => void }) {
  const t = useT();
  const heroStyle = useAnimatedEntry(80, 'fadeSlideUp');
  return (
    <Animated.View style={heroStyle} className="flex-1 items-center justify-center px-8">
      <View className="bg-primary-50 mb-6 h-40 w-40 items-center justify-center rounded-full">
        <Ionicons name="clipboard" size={72} color="#005FB8" />
        <View className="absolute right-7 top-7 h-10 w-10 items-center justify-center rounded-full bg-white shadow">
          <Ionicons name="heart" size={20} color="#DC2626" />
        </View>
      </View>
      <Text className="text-ink mb-2 text-xl font-bold dark:text-white">
        {t('tracker.empty.title')}
      </Text>
      <Text className="text-ink-muted mb-8 text-center text-sm leading-5">
        {t('tracker.empty.body')}
      </Text>
      <Pressable
        onPress={onAdd}
        className="bg-primary-600 h-12 flex-row items-center justify-center gap-2 self-stretch rounded-full px-6"
      >
        <Ionicons name="add-circle" size={18} color="#FFFFFF" />
        <Text className="text-sm font-semibold text-white">
          {t('tracker.empty.cta')}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function TrackerScreen() {
  const t = useT();
  const router = useRouter();
  const today = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [adherence, setAdherence] = useState<AdherenceResponse | null>(null);
  const [trackersCount, setTrackersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerStyle = useAnimatedEntry(80, 'fadeSlideUp');
  const ringStyle = useAnimatedEntry(160, 'fadeSlideUp');
  const daysStyle = useAnimatedEntry(220, 'fadeSlideUp');

  const refresh = useCallback(
    async (date: string) => {
      try {
        const [list, sched, adh] = await Promise.all([
          Api.tracker.list(),
          Api.tracker.getSchedule(date),
          Api.tracker.getAdherence(7),
        ]);
        setTrackersCount(list.length);
        setSchedule(sched);
        setAdherence(adh);
      } catch {}
      setLoading(false);
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      refresh(selectedDate);
    }, [refresh, selectedDate])
  );

  const onDateChange = (date: string) => {
    setSelectedDate(date);
    refresh(date);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh(selectedDate);
    setRefreshing(false);
  };

  const onMark = async (item: ScheduleItem, status: 'taken' | 'skipped') => {
    if (!schedule) return;
    const next = {
      ...schedule,
      items: schedule.items.map((it) =>
        it.trackerId === item.trackerId && it.timeLabel === item.timeLabel
          ? { ...it, status, takenAt: status === 'taken' ? new Date().toISOString() : null }
          : it
      ),
    };
    setSchedule(next);
    try {
      await Api.tracker.logIntake(item.trackerId, {
        scheduledDate: schedule.date,
        timeLabel: item.timeLabel,
        status,
        scheduledHour: item.hour,
        scheduledMinute: item.minute,
      });
      Api.tracker.getAdherence(7).then(setAdherence).catch(() => {});
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#F0F7FF', flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#005FB8" />
        </View>
      </SafeAreaView>
    );
  }

  if (trackersCount === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#F0F7FF', flex: 1 }}>
        <Animated.View
          style={headerStyle}
          className="flex-row items-center justify-between px-5 pt-2"
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-primary-50 h-9 w-9 items-center justify-center rounded-full">
              <Ionicons name="person" size={18} color="#005FB8" />
            </View>
            <Text className="text-ink text-lg font-bold dark:text-white">
              {t('tracker.title')}
            </Text>
          </View>
          <Pressable
            hitSlop={10}
            className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/10"
          >
            <Ionicons name="notifications-outline" size={18} color="#475569" />
          </Pressable>
        </Animated.View>
        <TrackerEmpty onAdd={() => router.push('/tracker/add' as any)} />
      </SafeAreaView>
    );
  }

  const itemsByLabel: Record<TimeLabel, ScheduleItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };
  schedule?.items.forEach((it) => {
    itemsByLabel[it.timeLabel].push(it);
  });

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#F0F7FF', flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-5 pt-2"
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-primary-50 h-9 w-9 items-center justify-center rounded-full">
            <Ionicons name="person" size={18} color="#005FB8" />
          </View>
          <Text className="text-ink text-lg font-bold dark:text-white">
            {t('tracker.title')}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/10"
        >
          <Ionicons name="notifications-outline" size={18} color="#475569" />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 24, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005FB8" />
        }
      >
        <Pressable
          onPress={() => router.push('/tracker/add' as any)}
          className="bg-primary-600 mb-4 h-12 flex-row items-center justify-center gap-2 rounded-full"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="text-sm font-semibold text-white">
            {t('tracker.addNew')}
          </Text>
        </Pressable>

        <Animated.View
          style={ringStyle}
          className="border-primary-100 mb-4 flex-row items-center justify-between rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-white/5"
        >
          <View className="flex-1 pr-3">
            <Text className="text-ink text-base font-bold dark:text-white">
              {t('tracker.weeklyAdherence')}
            </Text>
            <Text className="text-ink-muted mt-1 text-xs leading-4">
              {t('tracker.weeklyAdherence.body')}
            </Text>
          </View>
          <AdherenceRing percent={adherence?.percent ?? 0} />
        </Animated.View>

        <Animated.View style={daysStyle} className="mb-4">
          <DayTabs selected={selectedDate} onChange={onDateChange} />
        </Animated.View>

        {TIME_LABELS.map((label) => (
          <MealSection
            key={label}
            label={label}
            items={itemsByLabel[label]}
            onMark={onMark}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
