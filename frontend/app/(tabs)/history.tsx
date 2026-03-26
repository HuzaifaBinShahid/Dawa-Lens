import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import HistoryFilters from '@/components/history/HistoryFilters';
import HistoryItemCard from '@/components/history/HistoryItem';
import { historyItems } from '@/data/medicines';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'scanned', label: 'Scanned', hasDropdown: true },
  { id: 'searched', label: 'Searched', hasDropdown: true },
  { id: 'saved', label: 'Saved', hasDropdown: true },
];

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');

  const titleStyle = useAnimatedEntry(100, 'fadeIn');

  const filteredItems =
    activeFilter === 'all'
      ? historyItems
      : historyItems.filter((item) => item.type === activeFilter);

  return (
    <View style={styles.container}>
      <Header title="History" showBack={false} rightIcon="search-outline" />
      <HistoryFilters
        filters={filters}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />
      <Animated.Text style={[styles.sectionTitle, titleStyle]}>
        RECENT HISTORY
      </Animated.Text>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HistoryItemCard
            item={item}
            index={index}
            onPress={() => router.push(`/medicine/1`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  list: {
    paddingBottom: Theme.spacing.xxl,
  },
});
