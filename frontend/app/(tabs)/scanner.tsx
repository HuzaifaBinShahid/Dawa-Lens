import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Api } from '@/services/api';
import { getRawMedicineText } from '@/services/ocr';
import { Medicine } from '@/types';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type ScanStatus =
  | 'idle'
  | 'capturing'
  | 'analyzing'
  | 'searching'
  | 'matched'
  | 'nomatch';

const MAX_RELATED_BRANDS = 3;

const dedupedBrandNames = (m: Medicine): string[] => {
  if (!m.products) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of m.products) {
    const name = (p.brand || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};

const resolveScanMatch = (m: Medicine, ocrText: string | null) => {
  const q = (ocrText || '').toLowerCase().trim();
  const allBrands = dedupedBrandNames(m);

  let primary: string | null = null;
  if (q && allBrands.length > 0) {
    const exact = allBrands.find((b) => b.toLowerCase() === q);
    const prefix = !exact
      ? allBrands.find((b) => b.toLowerCase().startsWith(q))
      : undefined;
    const contains = !exact && !prefix
      ? allBrands.find((b) => b.toLowerCase().includes(q))
      : undefined;
    primary = exact || prefix || contains || null;
  }
  if (!primary) primary = allBrands[0] || m.drug_name || '';

  const related = allBrands
    .filter((b) => b.toLowerCase() !== (primary || '').toLowerCase())
    .slice(0, MAX_RELATED_BRANDS);

  return { primary, salt: m.drug_name, related };
};

export default function ScannerTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useAppSettings();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [lastCandidate, setLastCandidate] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  const scanLineY = useSharedValue(0);
  const cornerOpacity = useSharedValue(0.6);
  const pulseScale = useSharedValue(1);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setStatus('idle');
      };
    }, [])
  );

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(180, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    cornerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.45, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));
  const cornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
  }));
  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const logScanHistory = (m: Medicine | null, candidate: string | null) => {
    Api.logHistory({
      type: 'scan',
      medicineId: m?._id || null,
      query: candidate,
      matchedBrand: m ? resolveScanMatch(m, candidate).primary : null,
    }).catch(() => {});
  };

  const navigateToMedicine = (id: string, params: string) => {
    const path = params ? `/medicine/${id}?${params}` : `/medicine/${id}`;
    router.push(path as any);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    if (status === 'capturing' || status === 'analyzing' || status === 'searching') return;
    setStatus('idle');
    setLastCandidate(null);
    try {
      setStatus('capturing');
      pulseScale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (!photo?.uri) throw new Error('Capture failed');

      setStatus('analyzing');
      const rawText = await getRawMedicineText(photo.uri);
      if (!rawText || rawText.trim().length === 0) {
        Alert.alert('No text detected', 'Try a clearer, closer photo of the packaging.');
        setStatus('idle');
        return;
      }

      setStatus('searching');
      try {
        const extractRes = await Api.extractMedicine(rawText);
        const { extracted_name, result } = extractRes;
        setLastCandidate(extracted_name || rawText.substring(0, 20));

        if (result && result.best) {
          logScanHistory(result.best, extracted_name);
          const altIds = (result.alternates || [])
            .map((m: any) => m._id)
            .filter(Boolean)
            .join(',');
          const matched = resolveScanMatch(result.best, extracted_name).primary;
          const params = new URLSearchParams();
          if (altIds) params.set('alternates', altIds);
          if (matched) params.set('primary', matched);
          navigateToMedicine(result.best._id, params.toString());
          return;
        }

        setStatus('nomatch');
      } catch (err: any) {
        Alert.alert('Analysis failed', err.message || 'Could not contact the analysis server.');
        setStatus('idle');
      }
    } catch (err: any) {
      Alert.alert('Scan failed', err.message || 'Please try again.');
      setStatus('idle');
    }
  };

  if (!permission) return <View className="bg-scan flex-1" />;

  if (!permission.granted) {
    return (
      <View className="bg-scan flex-1">
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Ionicons name="camera" size={48} color="#FFFFFF" />
          <Text className="text-xl font-bold text-white">{t('home.permission.title')}</Text>
          <Text className="mb-6 text-center text-white/80">{t('home.permission.body')}</Text>
          <Pressable
            onPress={requestPermission}
            className="bg-primary-600 rounded-full px-8 py-3"
          >
            <Text className="font-semibold text-white">{t('home.permission.grant')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const busy = status === 'capturing' || status === 'analyzing' || status === 'searching';
  const statusLabel: Record<ScanStatus, string> = {
    idle: t('scanner.hint'),
    capturing: t('home.status.capturing'),
    analyzing: t('home.status.analyzing'),
    searching: lastCandidate
      ? `${t('home.status.searchingPrefix')} "${lastCandidate}"...`
      : `${t('home.status.searchingPrefix')}...`,
    matched: t('home.status.found'),
    nomatch: t('home.status.noMatch'),
  };

  return (
    <View className="bg-scan flex-1">
      <StatusBar style="light" />
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flash}
        />
      )}
      <View
        className="absolute inset-0"
        pointerEvents="none"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      />

      {/* Top flash toggle */}
      <Animated.View
        entering={FadeIn.duration(280)}
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center justify-end px-5 pb-3"
      >
        <Pressable
          onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
          hitSlop={12}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
        >
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-outline'} size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Viewfinder */}
      <View className="flex-1 items-center justify-center px-10" pointerEvents="none">
        <Animated.View style={[{ width: 240, height: 240, position: 'relative' }, cornerStyle]}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 36,
              height: 36,
              borderColor: '#FFFFFF',
              borderTopWidth: 3,
              borderLeftWidth: 3,
              borderTopLeftRadius: 10,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 36,
              height: 36,
              borderColor: '#FFFFFF',
              borderTopWidth: 3,
              borderRightWidth: 3,
              borderTopRightRadius: 10,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 36,
              height: 36,
              borderColor: '#FFFFFF',
              borderBottomWidth: 3,
              borderLeftWidth: 3,
              borderBottomLeftRadius: 10,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              borderColor: '#FFFFFF',
              borderBottomWidth: 3,
              borderRightWidth: 3,
              borderBottomRightRadius: 10,
            }}
          />
          <Animated.View
            style={[
              { position: 'absolute', width: 210, left: 15, height: 2, backgroundColor: '#2D7FCC', opacity: 0.85 },
              scanLineStyle,
            ]}
          />
        </Animated.View>

        <View
          pointerEvents="none"
          style={{ marginTop: 28, backgroundColor: 'rgba(0,0,0,0.55)' }}
          className="rounded-full px-4 py-2"
        >
          <Text className="text-xs font-medium tracking-wide text-white">
            {statusLabel[status]}
          </Text>
        </View>
      </View>

      {/* Bottom controls — leave space for BottomNav */}
      <View
        style={{ paddingBottom: 120 }}
        className="px-8"
        pointerEvents="box-none"
      >
        {busy && (
          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOut.duration(180)}
            className="mb-4 flex-row items-center gap-3 self-center rounded-full bg-black/80 px-4 py-2"
          >
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text className="text-xs font-medium text-white">
              {status === 'searching'
                ? t('home.loader.searching')
                : status === 'analyzing'
                ? t('home.loader.analyzing')
                : t('home.loader.capturing')}
            </Text>
          </Animated.View>
        )}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            <Ionicons name={flash === 'on' ? 'flash' : 'flash-outline'} size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={handleCapture}
            disabled={busy}
            className="h-20 w-20 items-center justify-center rounded-full border-2"
            style={{
              borderColor: '#FFFFFF',
              backgroundColor: 'rgba(1,96,184,0.18)',
            }}
          >
            <Animated.View
              style={[captureButtonStyle, { backgroundColor: '#005BC4' }]}
              className="h-16 w-16 items-center justify-center rounded-full"
            >
              {busy ? (
                <View className="h-4 w-4 rounded-full bg-white" />
              ) : (
                <Ionicons name="scan" size={28} color="#FFFFFF" />
              )}
            </Animated.View>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Coming soon', 'Gallery import will be available in a future update.')
            }
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
