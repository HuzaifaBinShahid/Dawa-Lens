import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function DisclaimerFooter() {
  const style = useAnimatedEntry(900, 'fadeIn');

  return (
    <Animated.View style={[styles.container, style]}>
      <Text style={styles.text}>
        <Text style={styles.bold}>Disclaimer: </Text>
        DawaLens is an AI-powered identification tool. Always verify results
        with a medical professional or pharmacist before consumption.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.lg,
  },
  text: {
    fontSize: Theme.fontSize.xs,
    color: Colors.disclaimerText,
    textAlign: 'center',
    lineHeight: 16,
  },
  bold: {
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.warning,
  },
});
