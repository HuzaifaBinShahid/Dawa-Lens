import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Api } from '@/services/api';
import { recognizeMedicineText } from '@/services/ocr';
import { Medicine } from '@/types';
import CommonButton from '@/components/common/CommonButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ScanStatus = 'idle' | 'capturing' | 'analyzing' | 'searching' | 'done';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [alternates, setAlternates] = useState<Medicine[]>([]);
  const [lastCandidate, setLastCandidate] = useState<string | null>(null);

  const scanLineY = useSharedValue(0);
  const cornerOpacity = useSharedValue(0.6);
  const pulseScale = useSharedValue(1);

  const headerStyle = useAnimatedEntry(100, 'fadeSlideUp');
  const controlsStyle = useAnimatedEntry(300, 'fadeSlideUp');

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(200, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    cornerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
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

  const handleCapture = async () => {
    if (!cameraRef.current || status !== 'idle') return;
    try {
      setStatus('capturing');
      pulseScale.value = withSequence(
        withTiming(0.94, { duration: 110, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 220, easing: Easing.inOut(Easing.cubic) })
      );
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (!photo?.uri) throw new Error('Capture failed');

      setStatus('analyzing');
      const candidates = await recognizeMedicineText(photo.uri);
      if (candidates.length === 0) {
        Alert.alert('No text detected', 'Try a clearer, closer photo of the packaging.');
        setStatus('idle');
        return;
      }

      setStatus('searching');
      for (const candidate of candidates) {
        setLastCandidate(candidate);
        try {
          const result = await Api.searchMedicines(candidate, 5);
          if (result.best) {
            setStatus('done');
            router.replace(`/medicine/${result.best._id}`);
            return;
          }
          if (result.alternates && result.alternates.length > 0) {
            setAlternates(result.alternates);
            setStatus('idle');
            return;
          }
        } catch {}
      }

      Alert.alert(
        'Medicine not recognized',
        `We tried: ${candidates.slice(0, 3).join(', ')}. Please retry or search manually.`,
      );
      setStatus('idle');
    } catch (err: any) {
      Alert.alert('Scan failed', err.message || 'Please try again.');
      setStatus('idle');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.permissionBox}>
          <Ionicons name="camera" size={48} color={Colors.white} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            DawaLens needs camera access to scan medicine packaging.
          </Text>
          <CommonButton
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionBtn}
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusLabel: Record<ScanStatus, string> = {
    idle: 'ALIGN THE MEDICINE PACKAGING WITHIN THE FRAME',
    capturing: 'CAPTURING...',
    analyzing: 'READING TEXT FROM IMAGE...',
    searching: lastCandidate ? `SEARCHING "${lastCandidate}"...` : 'SEARCHING...',
    done: 'FOUND!',
  };

  const busy = status !== 'idle';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + Theme.spacing.sm },
            headerStyle,
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicine Detection</Text>
          <TouchableOpacity
            onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
            style={styles.iconBtn}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-outline'}
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.viewfinder} pointerEvents="none">
          <Animated.View style={[styles.cornerFrame, cornerStyle]}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </Animated.View>
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
          <View style={styles.scanInfo}>
            <Text style={styles.scanInfoText}>{statusLabel[status]}</Text>
          </View>
        </View>

        {alternates.length > 0 && (
          <View style={styles.alternatesBox}>
            <Text style={styles.alternatesTitle}>Did you mean?</Text>
            {alternates.slice(0, 3).map((alt) => (
              <TouchableOpacity
                key={alt._id}
                style={styles.alternateRow}
                onPress={() => router.replace(`/medicine/${alt._id}`)}
              >
                <Text style={styles.alternateName}>{alt.drug_name}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setAlternates([])} style={styles.dismissAlt}>
              <Text style={styles.dismissAltText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View
          style={[
            styles.controls,
            { paddingBottom: insets.bottom + Theme.spacing.xl },
            controlsStyle,
          ]}
        >
          <View style={styles.controlBtn}>
            <View style={styles.controlIcon}>
              <Ionicons name="images-outline" size={22} color={Colors.white} />
            </View>
            <Text style={styles.controlLabel}>GALLERY</Text>
          </View>

          <TouchableOpacity
            style={styles.captureOuter}
            onPress={handleCapture}
            disabled={busy}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.captureInner,
                captureButtonStyle,
                busy && styles.captureBusy,
              ]}
            >
              {busy ? (
                <View style={styles.scanningDot} />
              ) : (
                <View style={styles.captureCenter} />
              )}
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.controlBtn}>
            <View style={styles.controlIcon}>
              <Ionicons name="bulb-outline" size={22} color={Colors.white} />
            </View>
            <Text style={styles.controlLabel}>TIPS</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scanBg },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  iconBtn: { padding: Theme.spacing.xs },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.white,
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xxxl,
  },
  cornerFrame: { width: 260, height: 260, position: 'relative' },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: 220,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  scanInfo: { position: 'absolute', bottom: -50 },
  scanInfoText: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 18,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Theme.spacing.xxl,
    paddingTop: Theme.spacing.xxl,
  },
  controlBtn: { alignItems: 'center', gap: Theme.spacing.sm },
  controlIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  controlLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  captureOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  captureBusy: { backgroundColor: Colors.warning },
  captureCenter: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.white,
    borderWidth: 2, borderColor: Colors.grayBorder,
  },
  scanningDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.danger,
  },
  permissionBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Theme.spacing.xxl, gap: Theme.spacing.md,
  },
  permissionTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.white,
  },
  permissionText: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  permissionBtn: { minWidth: 200 },
  backLink: { marginTop: Theme.spacing.md },
  backLinkText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
  },
  alternatesBox: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    backgroundColor: 'rgba(1,96,184,0.9)',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  alternatesTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.white,
    marginBottom: Theme.spacing.sm,
  },
  alternateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  alternateName: {
    fontSize: Theme.fontSize.md,
    color: Colors.white,
    fontWeight: Theme.fontWeight.medium,
  },
  dismissAlt: {
    alignSelf: 'flex-end',
    marginTop: Theme.spacing.sm,
  },
  dismissAltText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.fontSize.sm,
  },
});
