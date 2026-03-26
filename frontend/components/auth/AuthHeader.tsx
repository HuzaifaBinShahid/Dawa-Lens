import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const iconStyle = useAnimatedEntry(100, 'scale');
  const titleStyle = useAnimatedEntry(300, 'fadeSlideUp');
  const subtitleStyle = useAnimatedEntry(500, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <View style={styles.iconCircle}>
          <Ionicons name="medical" size={36} color={Colors.white} />
        </View>
      </Animated.View>
      <Animated.Text style={[styles.title, titleStyle]}>
        {title}
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        {subtitle}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
