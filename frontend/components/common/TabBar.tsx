import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type TabItem = {
  name: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  {
    name: 'index',
    labelKey: 'tab.scan',
    icon: 'camera-outline',
    iconFocused: 'camera',
  },
  {
    name: 'search',
    labelKey: 'tab.search',
    icon: 'search-outline',
    iconFocused: 'search',
  },
  {
    name: 'history',
    labelKey: 'tab.history',
    icon: 'time-outline',
    iconFocused: 'time',
  },
  {
    name: 'settings',
    labelKey: 'tab.settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
  },
];

type TabBarProps = {
  currentRoute: string;
  onTabPress: (name: string) => void;
};

function TabBarItem({
  tab,
  isActive,
  onPress,
  label,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  label: string;
}) {
  const pressOpacity = useSharedValue(1);
  const { palette } = useAppSettings();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pressOpacity.value,
  }));

  const handlePress = () => {
    pressOpacity.value = withTiming(
      0.55,
      { duration: 90, easing: Easing.out(Easing.quad) },
      () => {
        pressOpacity.value = withTiming(1, {
          duration: 180,
          easing: Easing.inOut(Easing.quad),
        });
      }
    );
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {isActive && <View style={styles.activeIndicator} />}
        <Ionicons
          name={isActive ? tab.iconFocused : tab.icon}
          size={22}
          color={isActive ? Colors.primary : palette.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: palette.tabInactive },
            isActive && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TabBar({ currentRoute, onTabPress }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { t, palette } = useAppSettings();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.white,
          borderTopColor: palette.grayBorder,
          paddingBottom: insets.bottom || Theme.spacing.sm,
        },
      ]}
    >
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.name}
          tab={tab}
          label={t(tab.labelKey)}
          isActive={currentRoute === tab.name}
          onPress={() => onTabPress(tab.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'flex-end',
    paddingTop: Theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 2,
    backgroundColor: Colors.warning,
    borderRadius: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
});
