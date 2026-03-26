import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type InfoSectionProps = {
  title: string;
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  delay?: number;
};

export default function InfoSection({
  title,
  items,
  icon,
  iconColor = Colors.primary,
  delay = 500,
}: InfoSectionProps) {
  const style = useAnimatedEntry(delay, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.bullet} />
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
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
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingLeft: Theme.spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
    marginTop: 7,
  },
  itemText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
