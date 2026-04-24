import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CapsuleSplash from '@/components/splash/CapsuleSplash';
import { Api } from '@/services/api';
import { ensureRegistered } from '@/services/deviceIdentity';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    ensureRegistered(() => Api.registerDevice());
  }, []);

  const handleComplete = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <CapsuleSplash onComplete={handleComplete} />
    </>
  );
}
