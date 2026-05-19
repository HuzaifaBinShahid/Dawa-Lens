import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useT } from '@/contexts/AppSettingsContext';
import { Api } from '@/services/api';
import { RecentSearches } from '@/services/recentSearches';
import type { Medicine } from '@/types';
import SyrupBottle from '@/components/svgs/MedicineIcons/SyrupBottle';
import TabletBlister from '@/components/svgs/MedicineIcons/TabletBlister';
import Syringe from '@/components/svgs/MedicineIcons/Syringe';
import CapsulePill from '@/components/svgs/MedicineIcons/CapsulePill';

type FilterKey = 'medicines' | 'symptoms' | 'conditions';

const SEED_POPULAR = ['Ibuprofen', 'Cetirizine'];

const resolveFormLabel = (raw: string | undefined): string => {
  if (!raw) return '';
  const lc = raw.toLowerCase();
  if (lc.includes('syrup') || lc.includes('suspension') || lc.includes('drop') || lc.includes('oral'))
    return 'Syrup';
  if (lc.includes('inject') || lc.includes('vial') || lc.includes('amp')) return 'Injection';
  if (lc.includes('capsule')) return 'Capsule';
  if (lc.includes('tab') || lc.includes('pill')) return 'Tablet';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

function FormIcon({ form }: { form: string }) {
  const lower = form.toLowerCase();
  if (lower === 'syrup') return <SyrupBottle width={36} height={36} />;
  if (lower === 'injection') return <Syringe width={36} height={36} />;
  if (lower === 'capsule') return <CapsulePill width={36} height={36} />;
  if (lower === 'tablet') return <TabletBlister width={36} height={36} />;
  return <CapsulePill width={36} height={36} />;
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={
        active
          ? { backgroundColor: '#005BC4' }
          : {
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }
      }
      className="rounded-full px-5 py-2.5"
    >
      <Text
        className="text-sm font-semibold"
        style={{ color: active ? '#FFFFFF' : '#475569' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PopularChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: '#E3EEFA' }}
      className="mb-2 mr-2 flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
    >
      <Ionicons name="trending-up" size={12} color="#005FB8" />
      <Text className="text-primary-700 text-xs font-semibold">{label}</Text>
    </Pressable>
  );
}

function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center justify-center py-16">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: '#E3EEFA' }}
      >
        <Ionicons name="construct-outline" size={28} color="#005FB8" />
      </View>
      <Text className="mb-1 text-base font-bold" style={{ color: '#1E293B' }}>
        {title}
      </Text>
      <Text className="max-w-[280px] text-center text-sm leading-5" style={{ color: '#64748B' }}>
        {body}
      </Text>
    </View>
  );
}

function MedicineCard({
  medicine,
  onPress,
}: {
  medicine: Medicine;
  onPress: () => void;
}) {
  const brand = medicine.products?.[0]?.brand || medicine.drug_name;
  const mfr = medicine.products?.[0]?.manufacturer || medicine.category || '';
  const formRaw = medicine.forms?.[0] || '';
  const form = resolveFormLabel(formRaw);
  const indication = medicine.indications?.[0] || medicine.category || '';

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl"
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0, 88, 190, 0.10)',
        padding: 14,
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#E3EEFA' }}
        >
          <FormIcon form={form} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className="mr-2 flex-1 text-base font-bold"
              style={{ color: '#1E293B' }}
              numberOfLines={1}
            >
              {brand}
            </Text>
            {!!form && (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: '#E3EEFA' }}
              >
                <Text className="text-[10px] font-bold" style={{ color: '#005FB8' }}>
                  {form}
                </Text>
              </View>
            )}
          </View>
          {!!mfr && (
            <Text
              className="mt-0.5 text-xs"
              style={{ color: '#64748B' }}
              numberOfLines={1}
            >
              {mfr}
            </Text>
          )}
          {!!indication && (
            <Text
              className="mt-1 text-xs"
              style={{ color: '#475569' }}
              numberOfLines={2}
            >
              Primary use: {indication}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('medicines');
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const inputStyle = useAnimatedEntry(140, 'fadeSlideUp');
  const filtersStyle = useAnimatedEntry(200, 'fadeSlideUp');
  const popularStyle = useAnimatedEntry(260, 'fadeSlideUp');

  useEffect(() => {
    const items = RecentSearches.load();
    setRecent(items.map((r) => r.query));
  }, []);

  const popular = useMemo(() => {
    if (recent.length > 0) return recent.slice(0, 6);
    return SEED_POPULAR;
  }, [recent]);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await Api.searchMedicines(trimmed, 10);
      const list: Medicine[] = [];
      if (data.best) list.push(data.best);
      if (data.alternates) {
        for (const m of data.alternates) {
          if (!list.find((x) => x._id === m._id)) list.push(m);
        }
      }
      setResults(list);
      RecentSearches.add(trimmed);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filter !== 'medicines') return;
    const id = setTimeout(() => runSearch(query), 280);
    return () => clearTimeout(id);
  }, [query, filter, runSearch]);

  const onChipPress = (label: string) => {
    setQuery(label);
    setFilter('medicines');
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#F0F7FF', flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-5 pt-2"
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E3EEFA' }}
        >
          <Ionicons name="person" size={18} color="#005FB8" />
        </View>
        <Text className="text-lg font-bold" style={{ color: '#005FB8' }}>
          {t('search.title.medicine')}
        </Text>
        <Pressable
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: '#FFFFFF',
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
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={inputStyle} className="px-5">
          <View
            className="flex-row items-center gap-3 rounded-full px-4"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              paddingVertical: 12,
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder.v2')}
              placeholderTextColor="#94A3B8"
              className="flex-1 text-sm"
              style={{ color: '#1E293B', padding: 0 }}
              returnKeyType="search"
              onSubmitEditing={() => runSearch(query)}
            />
            <Pressable hitSlop={6}>
              <Ionicons name="options-outline" size={20} color="#005FB8" />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={filtersStyle} className="px-5 pt-4">
          <View className="flex-row gap-2">
            <FilterPill
              label={t('search.filter.medicines')}
              active={filter === 'medicines'}
              onPress={() => setFilter('medicines')}
            />
            <FilterPill
              label={t('search.filter.symptoms')}
              active={filter === 'symptoms'}
              onPress={() => setFilter('symptoms')}
            />
            <FilterPill
              label={t('search.filter.conditions')}
              active={filter === 'conditions'}
              onPress={() => setFilter('conditions')}
            />
          </View>
        </Animated.View>

        {filter === 'medicines' && popular.length > 0 && (
          <Animated.View style={popularStyle} className="px-5 pt-5">
            <Text
              className="mb-2 text-xs font-bold tracking-widest"
              style={{ color: '#64748B' }}
            >
              {t('search.popular')}
            </Text>
            <View className="flex-row flex-wrap">
              {popular.map((p) => (
                <PopularChip key={p} label={p} onPress={() => onChipPress(p)} />
              ))}
            </View>
          </Animated.View>
        )}

        {filter !== 'medicines' ? (
          <ComingSoon
            title={t('search.comingSoon.title')}
            body={t('search.comingSoon.body')}
          />
        ) : loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#005FB8" />
          </View>
        ) : (
          <View className="px-5 pt-5">
            <Text className="mb-3 text-lg font-bold" style={{ color: '#1E293B' }}>
              {t('search.results')}
            </Text>
            {results.length === 0 && query.trim().length === 0 ? (
              <Text className="text-sm" style={{ color: '#64748B' }}>
                {t('search.empty.body')}
              </Text>
            ) : results.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                <Text className="mt-3 text-base font-semibold" style={{ color: '#1E293B' }}>
                  {t('search.noResults.title')}
                </Text>
              </View>
            ) : (
              results.map((m) => (
                <MedicineCard
                  key={m._id}
                  medicine={m}
                  onPress={() => router.push(`/medicine/${m._id}` as any)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
