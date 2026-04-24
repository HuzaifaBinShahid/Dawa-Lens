import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import { Api, HistoryEvent, SavedEntry } from '@/services/api';
import { Medicine } from '@/types';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type FilterKey = 'all' | 'scan' | 'search' | 'saved';

type Row = {
  key: string;
  medicineId: string | null;
  title: string;
  subtitle: string | null;
  badge: { label: string; color: string; bg: string };
  date: Date;
};

const FILTER_IDS: FilterKey[] = ['all', 'scan', 'search', 'saved'];

const relativeTime = (d: Date, justNow: string): string => {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return justNow;
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
};

const pickMedicine = (ref: Medicine | string | null): Medicine | null =>
  ref && typeof ref === 'object' ? (ref as Medicine) : null;

const historyToRow = (h: HistoryEvent, t: (k: string) => string): Row => {
  const med = pickMedicine(h.medicineId);
  const titleFromMedicine = h.matchedBrand || med?.drug_name;
  const title =
    titleFromMedicine ||
    h.query ||
    (h.type === 'scan' ? t('history.badge.scan') : t('history.badge.search'));
  const subtitle = med
    ? `${t('home.salt')} ${med.drug_name}`
    : h.query
    ? `"${h.query}"`
    : null;
  return {
    key: `h-${h._id}`,
    medicineId: med?._id || null,
    title,
    subtitle,
    badge:
      h.type === 'scan'
        ? {
            label: t('history.badge.scan'),
            color: Colors.primary,
            bg: Colors.primaryLight,
          }
        : {
            label: t('history.badge.search'),
            color: Colors.warning,
            bg: Colors.warningBg,
          },
    date: new Date(h.timestamp),
  };
};

const savedToRow = (s: SavedEntry, t: (k: string) => string): Row => {
  const med = pickMedicine(s.medicineId);
  return {
    key: `s-${s._id}`,
    medicineId: med?._id || null,
    title: med?.drug_name || t('history.badge.saved'),
    subtitle: med?.category || null,
    badge: {
      label: t('history.badge.saved'),
      color: Colors.success,
      bg: 'rgba(22,163,74,0.18)',
    },
    date: new Date(s.savedAt),
  };
};

export default function HistoryScreen() {
  const router = useRouter();
  const { t, palette } = useAppSettings();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleStyle = useAnimatedEntry(80, 'fadeIn');

  const filterLabels: Record<FilterKey, string> = {
    all: t('history.filter.all'),
    scan: t('history.filter.scans'),
    search: t('history.filter.searches'),
    saved: t('history.filter.saved'),
  };

  const load = useCallback(async () => {
    setError(null);
    try {
      const [h, s] = await Promise.all([
        Api.getHistory({ limit: 100 }),
        Api.getSaved(),
      ]);
      setHistory(h);
      setSaved(s);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const rows = useMemo<Row[]>(() => {
    if (activeFilter === 'saved') {
      return saved
        .map((s) => savedToRow(s, t))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    const scope =
      activeFilter === 'all'
        ? history
        : history.filter((h) => h.type === activeFilter);
    return scope
      .map((h) => historyToRow(h, t))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [activeFilter, history, saved, t]);

  const emptyCopy: Record<FilterKey, { title: string; body: string }> = {
    all: {
      title: t('history.empty.all.title'),
      body: t('history.empty.all.body'),
    },
    scan: {
      title: t('history.empty.scan.title'),
      body: t('history.empty.scan.body'),
    },
    search: {
      title: t('history.empty.search.title'),
      body: t('history.empty.search.body'),
    },
    saved: {
      title: t('history.empty.saved.title'),
      body: t('history.empty.saved.body'),
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Header title={t('history.title')} showBack={false} />

      <View style={styles.filterRow}>
        {FILTER_IDS.map((id) => {
          const active = activeFilter === id;
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.chip,
                { borderColor: palette.grayBorder, backgroundColor: palette.white },
                active && { backgroundColor: palette.text, borderColor: palette.text },
              ]}
              onPress={() => setActiveFilter(id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: palette.text },
                  active && { color: palette.background },
                ]}
              >
                {filterLabels[id]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.Text
        style={[
          styles.sectionTitle,
          { color: palette.textMuted },
          titleStyle,
        ]}
      >
        {activeFilter === 'saved'
          ? t('history.section.saved')
          : t('history.section.activity')}
      </Animated.Text>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color={Colors.danger}
          />
          <Text style={[styles.stateText, { color: Colors.danger }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={load} style={styles.retryLink}>
            <Text style={styles.retryLinkText}>{t('history.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View
              style={[
                styles.empty,
                {
                  backgroundColor: palette.cardBg,
                  borderColor: palette.grayBorder,
                },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                {emptyCopy[activeFilter].title}
              </Text>
              <Text style={[styles.emptyBody, { color: palette.textSecondary }]}>
                {emptyCopy[activeFilter].body}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 25).duration(220)}>
              <TouchableOpacity
                style={[
                  styles.row,
                  {
                    backgroundColor: palette.white,
                    borderColor: palette.grayBorder,
                  },
                ]}
                onPress={() =>
                  item.medicineId && router.push(`/medicine/${item.medicineId}`)
                }
                activeOpacity={item.medicineId ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Ionicons name="medkit" size={24} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text
                    style={[styles.name, { color: palette.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text
                      style={[styles.subtitle, { color: palette.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.subtitle}
                    </Text>
                  )}
                  <View style={styles.meta}>
                    <View
                      style={[styles.badge, { backgroundColor: item.badge.bg }]}
                    >
                      <Text
                        style={[styles.badgeText, { color: item.badge.color }]}
                      >
                        {item.badge.label}
                      </Text>
                    </View>
                    <Text style={[styles.date, { color: palette.textMuted }]}>
                      {relativeTime(item.date, t('history.justNow'))}
                    </Text>
                  </View>
                </View>
                {item.medicineId && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={palette.textMuted}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
          contentContainerStyle={
            rows.length === 0 ? styles.listEmpty : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  chip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  chipText: {
    fontSize: 12,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 2,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  list: {
    paddingBottom: Theme.spacing.xxl,
  },
  listEmpty: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    gap: Theme.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.2,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  stateText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  retryLink: {
    marginTop: 4,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 8,
  },
  retryLinkText: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.bold,
  },
  empty: {
    marginHorizontal: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
