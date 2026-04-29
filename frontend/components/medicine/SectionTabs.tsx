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
import { useAppSettings } from '@/contexts/AppSettingsContext';

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
  const { palette } = useAppSettings();
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<Record<string, { x: number; w: number }>>({});

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
    <View style={[styles.wrapper, { backgroundColor: palette.white }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? Colors.primaryLight
                    : palette.cardBg,
                  borderColor: isActive ? Colors.primary : palette.grayBorder,
                },
              ]}
              onPress={() => onChange(tab.key)}
              onLayout={onTabLayout(tab.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? Colors.primary : palette.textSecondary },
                  isActive && styles.labelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.rule, { backgroundColor: palette.grayBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: Theme.spacing.sm,
  },
  scroll: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
    gap: 8,
  },
  tab: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 9,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: Theme.fontWeight.bold,
  },
  rule: {
    height: 1,
  },
});
