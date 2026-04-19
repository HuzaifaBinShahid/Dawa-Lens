import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type MedicineHeaderProps = {
  drugName: string;
  category?: string;
  content?: string;
  forms: string[];
};

export default function MedicineHeader({
  drugName,
  category,
  content,
  forms,
}: MedicineHeaderProps) {
  const imageStyle = useAnimatedEntry(100, 'fadeSlideUp');
  const infoStyle = useAnimatedEntry(300, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          <Text style={styles.badgeText}>Verified Medicine</Text>
        </View>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="medkit" size={48} color={Colors.primary} />
        </View>
      </Animated.View>
      <Animated.View style={infoStyle}>
        <Text style={styles.name}>{drugName}</Text>
        {!!category && <Text style={styles.category}>{category}</Text>}
        {!!content && <Text style={styles.content}>{content}</Text>}
        {forms && forms.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {forms.map((form) => (
              <View key={form} style={styles.chip}>
                <Ionicons name="pricetag" size={12} color={Colors.primary} />
                <Text style={styles.chipText}>{form}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xl,
  },
  imageContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.success,
    fontWeight: Theme.fontWeight.medium,
  },
  imagePlaceholder: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  content: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  chipsRow: {
    gap: Theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
});
