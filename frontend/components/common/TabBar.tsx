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

type TabItem = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  {
    name: 'history',
    label: 'History',
    icon: 'time-outline',
    iconFocused: 'time',
  },
  { name: 'scan', label: 'Scan', icon: 'camera-outline', iconFocused: 'camera' },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    iconFocused: 'person',
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
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const pressOpacity = useSharedValue(1);

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

  if (tab.name === 'scan') {
    return (
      <TouchableOpacity
        style={styles.scanTab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.scanButton, animatedStyle]}>
          <Ionicons name="camera" size={26} color={Colors.white} />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <Ionicons
          name={isActive ? tab.iconFocused : tab.icon}
          size={22}
          color={isActive ? Colors.primary : Colors.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            isActive && styles.tabLabelActive,
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TabBar({ currentRoute, onTabPress }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || Theme.spacing.sm }]}>
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.name}
          tab={tab}
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
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
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
    gap: 2,
  },
  tabLabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.tabInactive,
    fontWeight: Theme.fontWeight.medium,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semibold,
  },
  scanTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
});
