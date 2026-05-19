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
import type { Medicine } from '@/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const C = {
  bg: '#F0F7FF',
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#475569',
  textSubtle: '#64748B',
  textFaint: '#94A3B8',
  primary: '#005FB8',
  primaryFab: '#005BC4',
  primaryBg: '#E3EEFA',
  border: 'rgba(0, 88, 190, 0.10)',
  divider: '#F1F5F9',
};

function MedicineItem({
  medicine,
  onPress,
}: {
  medicine: Medicine;
  onPress: () => void;
}) {
  const brand = medicine.products?.[0]?.brand || medicine.drug_name;
  const mfr = medicine.products?.[0]?.manufacturer || medicine.category || '';
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-2xl p-3"
      style={{
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: C.primaryBg }}
      >
        <Ionicons name="medkit" size={22} color={C.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold"
          style={{ color: C.text }}
          numberOfLines={1}
        >
          {brand}
        </Text>
        {!!mfr && (
          <Text className="text-xs" style={{ color: C.textSubtle }} numberOfLines={1}>
            {mfr}
          </Text>
        )}
      </View>
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: C.primaryFab }}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

function Section({
  icon,
  label,
  items,
  onItemPress,
}: {
  icon: IconName;
  label: string;
  items: Medicine[];
  onItemPress: (m: Medicine) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={12} color={C.textSubtle} />
        <Text
          className="text-xs font-bold tracking-widest"
          style={{ color: C.textSubtle }}
        >
          {label.toUpperCase()}
        </Text>
      </View>
      {items.map((m) => (
        <MedicineItem key={m._id} medicine={m} onPress={() => onItemPress(m)} />
      ))}
    </View>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center justify-center px-6 py-16">
      <View
        className="mb-3 h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
      >
        <Ionicons name="scan-outline" size={28} color={C.textFaint} />
      </View>
      <Text
        className="mt-2 text-base font-semibold"
        style={{ color: C.text }}
      >
        {title}
      </Text>
      <Text
        className="mt-1 max-w-[280px] text-center text-sm leading-5"
        style={{ color: C.textSubtle }}
      >
        {body}
      </Text>
    </View>
  );
}

const dedupeByMedicine = (list: Medicine[]): Medicine[] => {
  const seen = new Set<string>();
  const out: Medicine[] = [];
  for (const m of list) {
    if (!seen.has(m._id)) {
      seen.add(m._id);
      out.push(m);
    }
  }
  return out;
};

const filterMedicines = (q: string, list: Medicine[]): Medicine[] => {
  const t = q.trim().toLowerCase();
  if (!t) return list;
  return list.filter((m) => {
    const name = (m.drug_name || '').toLowerCase();
    const brand = (m.products?.[0]?.brand || '').toLowerCase();
    return name.includes(t) || brand.includes(t);
  });
};

export default function AddMedicineScreen() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scanned, setScanned] = useState<Medicine[]>([]);
  const [searched, setSearched] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const searchStyle = useAnimatedEntry(120, 'fadeSlideUp');
  const listStyle = useAnimatedEntry(200, 'fadeSlideUp');

  const load = useCallback(async () => {
    try {
      const [scanHistory, searchHistory, saved] = await Promise.all([
        Api.getHistory({ limit: 50, type: 'scan' }).catch(() => []),
        Api.getHistory({ limit: 50, type: 'search' }).catch(() => []),
        Api.getSaved().catch(() => []),
      ]);

      const scanList: Medicine[] = [];
      for (const h of scanHistory) {
        const m = h.medicineId;
        if (typeof m === 'object' && m && (m as Medicine)._id) {
          scanList.push(m as Medicine);
        }
      }
      for (const s of saved) {
        const m = s.medicineId;
        if (typeof m === 'object' && m && (m as Medicine)._id) {
          scanList.push(m as Medicine);
        }
      }

      const searchList: Medicine[] = [];
      for (const h of searchHistory) {
        const m = h.medicineId;
        if (typeof m === 'object' && m && (m as Medicine)._id) {
          searchList.push(m as Medicine);
        }
      }

      const scannedDeduped = dedupeByMedicine(scanList);
      const scannedIds = new Set(scannedDeduped.map((m) => m._id));
      const searchedDeduped = dedupeByMedicine(searchList).filter(
        (m) => !scannedIds.has(m._id)
      );

      setScanned(scannedDeduped);
      setSearched(searchedDeduped);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleScanned = useMemo(
    () => filterMedicines(query, scanned),
    [query, scanned]
  );
  const visibleSearched = useMemo(
    () => filterMedicines(query, searched),
    [query, searched]
  );

  const onItemPress = (m: Medicine) => {
    const brand = m.products?.[0]?.brand || m.drug_name;
    router.push({
      pathname: '/tracker/setup',
      params: { medicineId: m._id, primary: brand },
    } as any);
  };

  const totalVisible = visibleScanned.length + visibleSearched.length;
  const totalLoaded = scanned.length + searched.length;

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-4 pb-2 pt-1"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: C.card }}
        >
          <Ionicons name="chevron-back" size={22} color={C.primary} />
        </Pressable>
        <Text className="text-lg font-bold" style={{ color: C.primary }}>
          {t('addMedicine.title')}
        </Text>
        <View className="w-10" />
      </Animated.View>

      <Animated.View style={searchStyle} className="px-4 pt-2">
        <View
          className="flex-row items-center gap-2 rounded-full px-4 py-3"
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Ionicons name="search" size={18} color={C.textFaint} />
          <TextInput
            placeholder={t('addMedicine.search.placeholder')}
            placeholderTextColor={C.textFaint}
            value={query}
            onChangeText={setQuery}
            className="flex-1 text-sm"
            style={{ color: C.text, padding: 0 }}
          />
        </View>
      </Animated.View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={C.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {totalLoaded === 0 ? (
            <EmptyState
              title={t('addMedicine.empty.title')}
              body={t('addMedicine.empty.body')}
            />
          ) : totalVisible === 0 ? (
            <EmptyState
              title={t('search.noResults.title')}
              body={t('addMedicine.empty.body')}
            />
          ) : (
            <Animated.View style={listStyle}>
              <Section
                icon="scan-outline"
                label={t('addMedicine.previouslyScanned')}
                items={visibleScanned}
                onItemPress={onItemPress}
              />
              <Section
                icon="search-outline"
                label={t('addMedicine.previouslySearched')}
                items={visibleSearched}
                onItemPress={onItemPress}
              />
            </Animated.View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
