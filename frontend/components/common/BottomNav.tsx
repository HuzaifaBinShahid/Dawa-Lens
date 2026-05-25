import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  LinearTransition,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Tab = {
  key: string;
  href: string;
  icon: IconName;
  iconActive: IconName;
};

const TABS: Tab[] = [
  { key: 'home', href: '/(tabs)/home', icon: 'home-outline', iconActive: 'home' },
  { key: 'tracker', href: '/(tabs)/tracker', icon: 'calendar-outline', iconActive: 'calendar' },
  { key: 'scanner', href: '/(tabs)/scanner', icon: 'scan-outline', iconActive: 'scan' },
  { key: 'search', href: '/(tabs)/search', icon: 'search-outline', iconActive: 'search' },
  { key: 'profile', href: '/(tabs)/profile', icon: 'person-outline', iconActive: 'person' },
];

const FAB_BG = '#005BC4';
const FAB_GLOW = '#1976D2';
const PILL_BG = 'rgba(255, 255, 255, 0.97)';
const PILL_BORDER = 'rgba(255, 255, 255, 0.6)';

const resolveActiveIndex = (pathname: string): number => {
  if (pathname.startsWith('/profile')) return 4;
  if (pathname.startsWith('/search')) return 3;
  if (pathname.startsWith('/scanner')) return 2;
  if (pathname.startsWith('/tracker')) return 1;
  if (pathname.startsWith('/home')) return 0;
  if (pathname === '/' || pathname === '/(tabs)') return 0;
  return 0;
};

function InactiveIcon({
  tab,
  onPress,
}: {
  tab: Tab;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(0.84, { duration: 90, easing: Easing.out(Easing.quad) }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 220 });
    });
    onPress();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      layout={LinearTransition.springify().damping(18).stiffness(180)}
    >
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        className="h-11 w-11 items-center justify-center"
      >
        <Animated.View style={style}>
          <Ionicons name={tab.icon} size={24} color="#94A3B8" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function InactivePill({
  tabs,
  onSelect,
}: {
  tabs: Tab[];
  onSelect: (tab: Tab) => void;
}) {
  if (tabs.length === 0) {
    return <Animated.View layout={LinearTransition.springify().damping(18).stiffness(180)} />;
  }
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      style={{
        backgroundColor: PILL_BG,
        borderColor: PILL_BORDER,
        borderWidth: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.24,
        shadowRadius: 30,
        elevation: 10,
      }}
      className="flex-row items-center gap-1 rounded-full px-2"
    >
      {tabs.map((tab) => (
        <InactiveIcon key={tab.key} tab={tab} onPress={() => onSelect(tab)} />
      ))}
    </Animated.View>
  );
}

function ActiveFAB({ tab }: { tab: Tab }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(15).stiffness(160)}
      entering={ZoomIn.duration(280).springify()}
      exiting={ZoomOut.duration(200)}
    >
      <Pressable
        onPress={() => {
          scale.value = withTiming(0.92, { duration: 100 }, () => {
            scale.value = withSpring(1, { damping: 12, stiffness: 220 });
          });
        }}
        hitSlop={6}
      >
        <Animated.View
          style={[
            style,
            {
              backgroundColor: 'rgba(0, 91, 196, 0.75)',
              shadowColor: FAB_GLOW,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 15,
              elevation: 14,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderWidth: 1,
            },
          ]}
          className="h-16 w-16 items-center justify-center rounded-full"
        >
          <Ionicons name={tab.iconActive} size={28} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = resolveActiveIndex(pathname);
  const leftTabs = TABS.slice(0, activeIndex);
  const rightTabs = TABS.slice(activeIndex + 1);
  const activeTab = TABS[activeIndex];

  const goTo = (tab: Tab) => {
    router.replace(tab.href as any);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
      className="absolute bottom-0 left-0 right-0"
    >
      <Animated.View
        layout={LinearTransition.springify().damping(18).stiffness(180)}
        style={{ height: 80, direction: 'ltr' }}
        className="flex-row items-center justify-center gap-3 px-3"
      >
        <InactivePill tabs={leftTabs} onSelect={goTo} />
        <ActiveFAB key={activeTab.key} tab={activeTab} />
        <InactivePill tabs={rightTabs} onSelect={goTo} />
      </Animated.View>
    </View>
  );
}
