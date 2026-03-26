import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ActionItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type QuickActionsProps = {
  actions: ActionItem[];
};

export default function QuickActions({ actions }: QuickActionsProps) {
  const titleStyle = useAnimatedEntry(400, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, titleStyle]}>
        Quick Actions
      </Animated.Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <QuickActionItem key={action.id} action={action} index={index} />
        ))}
      </View>
    </View>
  );
}

function QuickActionItem({
  action,
  index,
}: {
  action: ActionItem;
  index: number;
}) {
  const itemStyle = useAnimatedEntry(500 + index * 100, 'scale');

  return (
    <Animated.View style={itemStyle}>
      <TouchableOpacity style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
        <View style={styles.iconCircle}>
          <Ionicons name={action.icon} size={24} color={Colors.primary} />
        </View>
        <Text style={styles.actionLabel}>{action.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  actionItem: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xxl,
    gap: Theme.spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
  },
});
