import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type SafetyAlertProps = {
  warnings: string[];
  onViewAll?: () => void;
};

export default function SafetyAlert({ warnings, onViewAll }: SafetyAlertProps) {
  const style = useAnimatedEntry(400, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name="warning" size={22} color={Colors.warning} />
        <Text style={styles.title}>Safety Alert</Text>
      </View>
      <Text style={styles.warningText}>{warnings[0]}</Text>
      {onViewAll && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View Full Warnings</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warningBg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.warning,
  },
  warningText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  viewAllButton: {
    backgroundColor: Colors.warning,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    alignSelf: 'flex-start',
  },
  viewAllText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.white,
  },
});
