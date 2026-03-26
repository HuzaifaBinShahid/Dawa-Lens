import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import CommonButton from '@/components/common/CommonButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type TrackIntakeProps = {
  onAddToHistory: () => void;
};

export default function TrackIntake({ onAddToHistory }: TrackIntakeProps) {
  const style = useAnimatedEntry(800, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.trackCard}>
        <Ionicons name="calendar" size={24} color={Colors.primary} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>Track your intake</Text>
          <Text style={styles.trackSubtitle}>
            Keep a log of when you take this medicine.
          </Text>
        </View>
      </View>
      <CommonButton
        title="Add to History"
        onPress={onAddToHistory}
        style={styles.button}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xxl,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  trackSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  button: {
    borderRadius: Theme.borderRadius.md,
  },
});
