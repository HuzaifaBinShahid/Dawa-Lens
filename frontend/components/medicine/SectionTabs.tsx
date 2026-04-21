import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export type TabItem<T extends string = string> = {
  key: T;
  label: string;
};

type SectionTabsProps<T extends string = string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
};

export default function SectionTabs<T extends string = string>({
  tabs,
  active,
  onChange,
}: SectionTabsProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<Record<string, { x: number; w: number }>>({});
  const activeIndex = tabs.findIndex((t) => t.key === active);

  useEffect(() => {
    const pos = tabPositions.current[active];
    if (pos && scrollRef.current) {
      const targetX = Math.max(0, pos.x - 24);
      scrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [active]);

  const onTabLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabPositions.current[key] = { x, w: width };
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onChange(tab.key)}
              onLayout={onTabLayout(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.index}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.rule} />
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {String(activeIndex + 1).padStart(2, '0')}
          <Text style={styles.progressSep}> / </Text>
          {String(tabs.length).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
  },
  scroll: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    gap: Theme.spacing.xl,
  },
  tab: {
    alignItems: 'flex-start',
    paddingBottom: Theme.spacing.sm,
    position: 'relative',
    minWidth: 48,
  },
  index: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  label: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  labelActive: {
    color: Colors.text,
  },
  underline: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: Colors.warning,
  },
  rule: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  progressRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  progressText: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: Colors.text,
  },
  progressSep: {
    color: Colors.textMuted,
  },
});
