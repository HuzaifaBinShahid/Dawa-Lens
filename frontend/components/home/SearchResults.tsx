import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '@/types';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type SearchResultsProps = {
  results: Medicine[];
  loading: boolean;
  error?: string | null;
  query: string;
  onSelect: (medicine: Medicine) => void;
};

export default function SearchResults({
  results,
  loading,
  error,
  query,
  onSelect,
}: SearchResultsProps) {
  if (query.trim().length < 2) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      {loading && (
        <View style={styles.state}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.stateText}>Searching...</Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={[styles.stateText, { color: Colors.danger }]}>{error}</Text>
        </View>
      )}
      {!loading && !error && results.length === 0 && (
        <View style={styles.state}>
          <Text style={styles.stateText}>No medicine found</Text>
        </View>
      )}
      {!loading && !error && results.length > 0 && (
        <View>
          {results.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.row}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="medkit" size={18} color={Colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.drug_name}
                </Text>
                {!!item.category && (
                  <Text style={styles.rowCategory} numberOfLines={1}>
                    {item.category}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    overflow: 'hidden',
  },
  state: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  stateText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  rowCategory: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
