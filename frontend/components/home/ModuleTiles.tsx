import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ModuleTilesProps = {
  onScanPress: () => void;
  onSearchPress: () => void;
};

export default function ModuleTiles({ onScanPress, onSearchPress }: ModuleTilesProps) {
  const introStyle = useAnimatedEntry(80, 'fadeSlideUp');
  const scanStyle = useAnimatedEntry(160, 'fadeSlideUp');
  const searchStyle = useAnimatedEntry(280, 'fadeSlideUp');

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.intro, introStyle]}>
        <View style={styles.rule} />
        <Text style={styles.introLabel}>TWO WAYS TO IDENTIFY</Text>
      </Animated.View>

      <Animated.View style={scanStyle}>
        <TouchableOpacity
          style={styles.scanCard}
          onPress={onScanPress}
          activeOpacity={0.9}
        >
          <View style={styles.scanHeader}>
            <Text style={styles.moduleTag}>01 — SCAN</Text>
            <View style={styles.cornerBrackets}>
              <View style={[styles.bracket, styles.bracketTL]} />
              <View style={[styles.bracket, styles.bracketTR]} />
              <View style={[styles.bracket, styles.bracketBL]} />
              <View style={[styles.bracket, styles.bracketBR]} />
              <Ionicons name="camera" size={28} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.scanTitle}>
            Point.{'\n'}Capture.{'\n'}
            <Text style={styles.scanTitleAccent}>Know.</Text>
          </Text>
          <Text style={styles.scanBody}>
            Our scanner reads the packaging and returns dosage, warnings, and
            composition in seconds.
          </Text>

          <View style={styles.scanCta}>
            <Text style={styles.scanCtaText}>Open scanner</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={searchStyle}>
        <TouchableOpacity
          style={styles.searchCard}
          onPress={onSearchPress}
          activeOpacity={0.85}
        >
          <View style={styles.searchLeft}>
            <Text style={styles.moduleTagDark}>02 — SEARCH</Text>
            <Text style={styles.searchTitle}>
              Type a name<Text style={styles.dot}>.</Text>
            </Text>
            <Text style={styles.searchBody}>
              Browse our verified medicine index by brand or generic.
            </Text>
          </View>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={24} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
    gap: Theme.spacing.md,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  rule: {
    width: 28,
    height: 2,
    backgroundColor: Colors.warning,
  },
  introLabel: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 2,
    color: Colors.text,
  },
  scanCard: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xxl,
    overflow: 'hidden',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xxl,
  },
  moduleTag: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  cornerBrackets: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: Colors.warning,
  },
  bracketTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  bracketTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bracketBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  scanTitle: {
    fontSize: 36,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.white,
    lineHeight: 40,
    letterSpacing: -1.5,
    marginBottom: Theme.spacing.md,
  },
  scanTitleAccent: {
    color: Colors.warning,
  },
  scanBody: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: Theme.spacing.xl,
    maxWidth: '90%',
  },
  scanCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
  },
  scanCtaText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.text,
    padding: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  searchLeft: {
    flex: 1,
  },
  moduleTagDark: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: Colors.warning,
    marginBottom: 6,
  },
  searchTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  dot: {
    color: Colors.warning,
  },
  searchBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  searchIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
