import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type HeroCardProps = {
  onScanPress: () => void;
};

export default function HeroCard({ onScanPress }: HeroCardProps) {
  const cardStyle = useAnimatedEntry(100, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="camera" size={40} color={Colors.white} />
      </View>
      <Text style={styles.title}>Identify Medicine</Text>
      <Text style={styles.subtitle}>
        Snap a photo of any pill or box{'\n'}for instant details
      </Text>
      <TouchableOpacity style={styles.scanButton} onPress={onScanPress} activeOpacity={0.8}>
        <Ionicons name="scan" size={20} color={Colors.primary} />
        <Text style={styles.scanText}>Scan Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.white,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.xl,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.xxl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
    gap: Theme.spacing.sm,
  },
  scanText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.primary,
  },
});
