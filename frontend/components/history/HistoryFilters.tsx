import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type FilterOption = {
  id: string;
  label: string;
  hasDropdown?: boolean;
};

type HistoryFiltersProps = {
  filters: FilterOption[];
  activeFilter: string;
  onFilterPress: (id: string) => void;
};

export default function HistoryFilters({
  filters,
  activeFilter,
  onFilterPress,
}: HistoryFiltersProps) {
  const style = useAnimatedEntry(200, 'slideLeft');

  return (
    <Animated.View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onFilterPress(filter.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter.label}
              </Text>
              {filter.hasDropdown && (
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={isActive ? Colors.white : Colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.primary,
  },
  chipTextActive: {
    color: Colors.white,
  },
});
