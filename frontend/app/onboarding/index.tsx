import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useT } from '@/contexts/AppSettingsContext';
import { loadPreferences, savePreferences } from '@/services/preferences';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import OnboardingDots from '@/components/onboarding/OnboardingDots';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SLIDES: Array<{ variant: 'scan' | 'know' | 'alerts'; titleKey: string; bodyKey: string }> = [
  { variant: 'scan', titleKey: 'onboarding.s1.title', bodyKey: 'onboarding.s1.body' },
  { variant: 'know', titleKey: 'onboarding.s2.title', bodyKey: 'onboarding.s2.body' },
  { variant: 'alerts', titleKey: 'onboarding.s3.title', bodyKey: 'onboarding.s3.body' },
];

export default function Onboarding() {
  const t = useT();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);
  const [pageIndex, setPageIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    progress.value = event.contentOffset.x / width;
  });

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setPageIndex(idx);
    },
    [width]
  );

  const finish = useCallback(() => {
    const prefs = loadPreferences();
    savePreferences({ ...prefs, onboardingComplete: true });
    router.replace('/(tabs)/home');
  }, [router]);

  const handleNext = useCallback(() => {
    if (pageIndex < SLIDES.length - 1) {
      const next = pageIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setPageIndex(next);
    } else {
      finish();
    }
  }, [pageIndex, width, finish]);

  const isLast = pageIndex === SLIDES.length - 1;

  return (
    <SafeAreaView className="bg-primary-50 flex-1" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-end px-6 pt-2">
        <Pressable
          onPress={finish}
          hitSlop={12}
          className="px-3 py-2"
        >
          <Text className="text-ink-subtle text-base font-medium">
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      </View>

      <AnimatedScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((s) => (
          <OnboardingSlide
            key={s.variant}
            variant={s.variant}
            title={t(s.titleKey)}
            body={t(s.bodyKey)}
          />
        ))}
      </AnimatedScrollView>

      <View className="px-6 pb-6 pt-3">
        <View className="mb-6">
          <OnboardingDots count={SLIDES.length} progress={progress} />
        </View>
        <Pressable
          onPress={handleNext}
          className="bg-primary-600 active:bg-primary-700 h-14 items-center justify-center rounded-full"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="text-base font-semibold text-white">
            {isLast ? t('onboarding.cta.start') : t('onboarding.cta.next')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
