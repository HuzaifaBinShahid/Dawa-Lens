import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useT } from '@/contexts/AppSettingsContext';
import { Api } from '@/services/api';
import EmptyHero from '@/components/home/EmptyHero';
import HealthTipCard from '@/components/home/HealthTipCard';
import QuickStartGuide from '@/components/home/QuickStartGuide';
import ComplianceRing from '@/components/home/ComplianceRing';
import ConditionRow from '@/components/home/ConditionRow';
import UpcomingDosesList from '@/components/home/UpcomingDosesList';
import { healthTips } from '@/data/medicines';
import type {
  AdherenceResponse,
  ScheduleItem,
  ScheduleResponse,
} from '@/types/tracker';

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

type UpcomingItem = ScheduleItem & {
  dateKey: string;
  dateLabel: string;
};

const labelForDate = (key: string, today: string, tomorrow: string): string => {
  if (key === today) return 'Today';
  if (key === tomorrow) return 'Tomorrow';
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const TIP_INDEX = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

export default function HomeDashboard() {
  const t = useT();
  const router = useRouter();
  const [trackersCount, setTrackersCount] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [adherence, setAdherence] = useState<AdherenceResponse | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const ringStyle = useAnimatedEntry(140, 'fadeSlideUp');
  const heroStyle = useAnimatedEntry(160, 'fadeSlideUp');
  const nextDoseStyle = useAnimatedEntry(220, 'fadeSlideUp');
  const conditionsStyle = useAnimatedEntry(300, 'fadeSlideUp');
  const guideStyle = useAnimatedEntry(260, 'fadeSlideUp');
  const tipStyle = useAnimatedEntry(380, 'fadeSlideUp');

  const refresh = useCallback(async () => {
    try {
      const todayDate = new Date();
      const today = toDateKey(todayDate);
      const tomorrowDate = new Date(todayDate);
      tomorrowDate.setDate(todayDate.getDate() + 1);
      const tomorrow = toDateKey(tomorrowDate);

      const upcomingDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() + i);
        return toDateKey(d);
      });

      const [list, sched, adh, scans, ...futureSchedules] = await Promise.all([
        Api.tracker.list().catch(() => []),
        Api.tracker.getSchedule(today).catch(
          () => ({ date: today, items: [] }) as ScheduleResponse
        ),
        Api.tracker.getAdherence(7).catch(
          () => ({ days: 7, scheduled: 0, taken: 0, percent: 0 }) as AdherenceResponse
        ),
        Api.getHistory({ type: 'scan', limit: 200 }).catch(() => []),
        ...upcomingDays
          .slice(1)
          .map((d) =>
            Api.tracker.getSchedule(d).catch(
              () => ({ date: d, items: [] }) as ScheduleResponse
            )
          ),
      ]);
      setTrackersCount(list.length);
      setSchedule(sched);
      setAdherence(adh);
      setScanCount(scans.length);

      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const allSchedules: ScheduleResponse[] = [sched, ...futureSchedules];
      const allUpcoming: UpcomingItem[] = [];
      for (const s of allSchedules) {
        for (const it of s.items) {
          if (it.status === 'taken') continue;
          if (s.date === today && it.hour * 60 + it.minute < minutesNow - 30) continue;
          allUpcoming.push({
            ...it,
            dateKey: s.date,
            dateLabel: labelForDate(s.date, today, tomorrow),
          });
        }
      }
      allUpcoming.sort((a, b) => {
        if (a.dateKey === b.dateKey) {
          return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
        }
        return a.dateKey < b.dateKey ? -1 : 1;
      });
      setUpcoming(allUpcoming.slice(0, 3));
    } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const tipText = useMemo(() => {
    if (!healthTips || healthTips.length === 0) return t('home.tip.fallback');
    return healthTips[TIP_INDEX % healthTips.length].text;
  }, [t]);

  const scannedPercent = useMemo(() => {
    if (scanCount === 0) return 0;
    return Math.min(100, scanCount * 10);
  }, [scanCount]);

  const markDose = async (item: UpcomingItem) => {
    setUpcoming((prev) =>
      prev.map((u) =>
        u.trackerId === item.trackerId &&
        u.timeLabel === item.timeLabel &&
        u.dateKey === item.dateKey
          ? { ...u, status: 'taken', takenAt: new Date().toISOString() }
          : u
      )
    );
    if (schedule && item.dateKey === schedule.date) {
      setSchedule({
        ...schedule,
        items: schedule.items.map((it) =>
          it.trackerId === item.trackerId && it.timeLabel === item.timeLabel
            ? { ...it, status: 'taken', takenAt: new Date().toISOString() }
            : it
        ),
      });
    }
    try {
      await Api.tracker.logIntake(item.trackerId, {
        scheduledDate: item.dateKey,
        timeLabel: item.timeLabel,
        status: 'taken',
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

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#F0F7FF', flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-5 pt-2"
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-primary-50 h-10 w-10 items-center justify-center rounded-full">
            <Ionicons name="person" size={18} color="#005FB8" />
          </View>
          <Text className="text-primary-600 text-lg font-bold">
            {t('home.dash.title')}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/10"
          style={{
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="notifications-outline" size={18} color="#475569" />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005FB8" />
        }
      >
        {trackersCount === 0 ? (
          <Animated.View style={heroStyle}>
            <EmptyHero
              onAdd={() => router.push('/tracker/add' as any)}
              onScan={() => router.push('/(tabs)/scanner' as any)}
            />
            <QuickStartGuide completed={0} />
            <HealthTipCard text={tipText} variant="cream" />
          </Animated.View>
        ) : (
          <>
            <Animated.View style={ringStyle} className="mb-2 items-center">
              <ComplianceRing
                percent={adherence?.percent ?? 0}
                scanned={scannedPercent}
              />
              <View className="mt-4 flex-row items-center gap-5">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary-600 h-2.5 w-2.5 rounded-full" />
                  <Text className="text-ink-muted text-xs font-semibold">
                    Tracked
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: '#D97706' }}
                  />
                  <Text className="text-ink-muted text-xs font-semibold">
                    Scanned
                  </Text>
                </View>
              </View>
            </Animated.View>

            {upcoming.length > 0 && (
              <Animated.View style={nextDoseStyle} className="mt-5">
                <UpcomingDosesList
                  items={upcoming}
                  onMark={markDose}
                  onViewAll={() => router.push('/(tabs)/tracker' as any)}
                />
              </Animated.View>
            )}

            <Animated.View style={conditionsStyle} className="mt-2">
              <Text className="text-ink mb-3 text-base font-bold dark:text-white">
                Personal Conditions
              </Text>
              <ConditionRow
                icon="heart"
                iconBg="#FEE2E2"
                iconColor="#DC2626"
                label="Hypertension"
                onPress={() => {}}
              />
              <ConditionRow
                icon="water"
                iconBg="#E3EEFA"
                iconColor="#005FB8"
                label="Type 2 Diabetes"
                onPress={() => {}}
              />
            </Animated.View>

            <Animated.View style={tipStyle}>
              <HealthTipCard
                text={tipText}
                variant="blue"
                title="Daily Health Tip"
              />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
