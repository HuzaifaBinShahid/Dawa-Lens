import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CapsuleSplash from '@/components/splash/CapsuleSplash';
import { Api } from '@/services/api';
import { ensureRegistered } from '@/services/deviceIdentity';
import { loadPreferences } from '@/services/preferences';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    ensureRegistered(() => Api.registerDevice());
  }, []);

  const handleComplete = useCallback(() => {
    const prefs = loadPreferences();
    if (prefs.onboardingComplete) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <CapsuleSplash onComplete={handleComplete} />
    </>
  );
}
