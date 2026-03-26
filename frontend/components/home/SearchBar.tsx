import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import CommonInput from '@/components/common/CommonInput';
import { Theme } from '@/constants/theme';
import { Colors } from '@/constants/colors';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const labelStyle = useAnimatedEntry(200, 'fadeSlideUp');
  const inputStyle = useAnimatedEntry(300, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.label, labelStyle]}>
        Search by Name
      </Animated.Text>
      <Animated.View style={inputStyle}>
        <CommonInput
          icon="search-outline"
          placeholder="e.g. Paracetamol..."
          value={value}
          onChangeText={onChangeText}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  label: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
});
