import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type DosageBlockProps = {
  dosage: Record<string, string>;
  delay?: number;
};

export default function DosageBlock({ dosage, delay = 500 }: DosageBlockProps) {
  const entries = Object.entries(dosage || {});
  const style = useAnimatedEntry(delay, 'fadeSlideUp');

  if (entries.length === 0) return null;

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color={Colors.primary} />
        <Text style={styles.title}>Dosage</Text>
      </View>
      {entries.map(([key, value], index) => (
        <DosageCard key={key} label={key} value={value} index={index} />
      ))}
    </Animated.View>
  );
}

function DosageCard({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  const cardStyle = useAnimatedEntry(600 + index * 100, 'slideLeft');
  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  cardLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardValue: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
});
