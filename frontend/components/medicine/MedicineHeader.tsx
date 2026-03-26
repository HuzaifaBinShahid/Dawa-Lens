import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type MedicineHeaderProps = {
  name: string;
  manufacturer: string;
  activeIngredient: string;
  strength: string;
  isAuthentic: boolean;
};

export default function MedicineHeader({
  name,
  manufacturer,
  activeIngredient,
  strength,
  isAuthentic,
}: MedicineHeaderProps) {
  const imageStyle = useAnimatedEntry(100, 'scale');
  const infoStyle = useAnimatedEntry(300, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        {isAuthentic && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.badgeText}>Authentic Medicine</Text>
          </View>
        )}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="medkit" size={48} color={Colors.primary} />
        </View>
      </Animated.View>
      <Animated.View style={infoStyle}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.manufacturer}>{manufacturer}</Text>
        <View style={styles.ingredientRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.warning} />
          <Text style={styles.ingredient}>
            Active Ingredient: {activeIngredient} ({strength})
          </Text>
        </View>
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
  manufacturer: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ingredient: {
    fontSize: Theme.fontSize.sm,
    color: Colors.warning,
    fontWeight: Theme.fontWeight.medium,
  },
});
