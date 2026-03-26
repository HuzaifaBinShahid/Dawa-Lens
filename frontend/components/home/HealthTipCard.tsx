import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type HealthTipCardProps = {
  text: string;
};

export default function HealthTipCard({ text }: HealthTipCardProps) {
  const cardStyle = useAnimatedEntry(700, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={18} color={Colors.primary} />
        <Text style={styles.title}>Daily Health Tip</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconDot}>
          <Ionicons name="water" size={16} color={Colors.primary} />
        </View>
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.lg,
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  },
  iconDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
