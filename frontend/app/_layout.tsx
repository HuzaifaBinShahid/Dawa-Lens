import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppState, View, type AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
import {
  setupNotificationHandler,
  setupAndroidChannel,
  addResponseListener,
  rescheduleAll,
  isAvailable as notificationsAvailable,
} from '@/services/notifications';
import { Api } from '@/services/api';
import '../global.css';

SplashScreen.hideAsync().catch(() => {});

function Shell() {
  const { isDark } = useAppSettings();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    if (!notificationsAvailable()) {
      return;
    }

    try {
      setupNotificationHandler();
    } catch {}
    setupAndroidChannel().catch(() => {});

    const removeListener = addResponseListener((data) => {
      if (data?.trackerId) {
        try {
          router.push('/(tabs)/tracker' as any);
        } catch {}
      }
    });

    const onChange = async (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        try {
          const trackers = await Api.tracker.list();
          await rescheduleAll(trackers);
        } catch {}
      }
      appState.current = next;
    };
    const sub = AppState.addEventListener('change', onChange);

    return () => {
      sub?.remove?.();
      removeListener?.();
    };
  }, [router]);

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
      <StatusBar style={isDark ? 'light' : 'auto'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="medicine/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="tracker/add"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="tracker/setup"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <AppSettingsProvider>
        <Shell />
      </AppSettingsProvider>
    </GestureHandlerRootView>
  );
}
