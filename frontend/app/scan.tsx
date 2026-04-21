import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Api } from '@/services/api';
import { recognizeMedicineText } from '@/services/ocr';
import { Medicine } from '@/types';
import CommonButton from '@/components/common/CommonButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ScanStatus =
  | 'idle'
  | 'capturing'
  | 'analyzing'
  | 'searching'
  | 'matched'
  | 'nomatch';

const MAX_BRAND_TAGS = 3;

const getBrandTags = (m: Medicine) => {
  if (!m.products) return [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const p of m.products) {
    const name = (p.brand || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(name);
    if (tags.length >= MAX_BRAND_TAGS) break;
  }
  return tags;
};

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [match, setMatch] = useState<Medicine | null>(null);
  const [similar, setSimilar] = useState<Medicine[]>([]);
  const [lastCandidate, setLastCandidate] = useState<string | null>(null);
  const [triedCandidates, setTriedCandidates] = useState<string[]>([]);

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

  const resetState = () => {
    setStatus('idle');
    setMatch(null);
    setSimilar([]);
    setLastCandidate(null);
    setTriedCandidates([]);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    if (status === 'capturing' || status === 'analyzing' || status === 'searching') return;
    resetState();
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
      const candidates = await recognizeMedicineText(photo.uri);
      if (candidates.length === 0) {
        Alert.alert('No text detected', 'Try a clearer, closer photo of the packaging.');
        setStatus('idle');
        return;
      }

      setStatus('searching');
      const tried: string[] = [];
      for (const candidate of candidates) {
        setLastCandidate(candidate);
        tried.push(candidate);
        try {
          const result = await Api.searchMedicines(candidate, 5);
          if (result.best) {
            setMatch(result.best);
            setSimilar(result.alternates || []);
            setStatus('matched');
            setTriedCandidates(tried);
            return;
          }
          if (result.alternates && result.alternates.length > 0) {
            setMatch(null);
            setSimilar(result.alternates);
            setStatus('nomatch');
            setTriedCandidates(tried);
            return;
          }
        } catch {}
      }

      setTriedCandidates(tried);
      setStatus('nomatch');
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
    searching: lastCandidate ? `SEARCHING SALT "${lastCandidate}"...` : 'SEARCHING...',
    matched: 'MEDICINE FOUND',
    nomatch: 'NO MATCH — TAP TO TRY AGAIN',
  };

  const busy =
    status === 'capturing' ||
    status === 'analyzing' ||
    status === 'searching';

  const showBottomLoader = busy;
  const showMatchCard = status === 'matched' && !!match;
  const showNoMatchCard = status === 'nomatch';

  const brands = match ? getBrandTags(match) : [];

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTag}>MODULE — 01</Text>
            <Text style={styles.headerTitle}>Scan</Text>
          </View>
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

        {showBottomLoader && (
          <Animated.View
            entering={FadeInDown.duration(240)}
            exiting={FadeOut.duration(180)}
            style={[styles.bottomLoader, { bottom: insets.bottom + 170 }]}
          >
            <ActivityIndicator color={Colors.warning} size="small" />
            <View style={{ flex: 1 }}>
              <Text style={styles.loaderPrimary}>
                {status === 'searching'
                  ? 'Searching for medicine'
                  : status === 'analyzing'
                  ? 'Reading text from image'
                  : 'Capturing'}
              </Text>
              {status === 'searching' && lastCandidate && (
                <Text style={styles.loaderSecondary}>
                  matching salt “{lastCandidate}”
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {showMatchCard && match && (
          <Animated.View
            entering={FadeInDown.duration(280)}
            exiting={FadeOut.duration(180)}
            style={[styles.matchCard, { bottom: insets.bottom + 170 }]}
          >
            <View style={styles.matchHead}>
              <View style={styles.foundPill}>
                <View style={styles.foundDot} />
                <Text style={styles.foundText}>FOUND</Text>
              </View>
              <TouchableOpacity onPress={resetState} hitSlop={10}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace(`/medicine/${match._id}`)}
            >
              {match.category && (
                <Text style={styles.matchCategory} numberOfLines={1}>
                  {match.category.toUpperCase()}
                </Text>
              )}
              <Text style={styles.matchName} numberOfLines={1}>
                {match.drug_name}
              </Text>

              {brands.length > 0 ? (
                <View style={styles.brandRow}>
                  <Text style={styles.brandLabel}>Brands:</Text>
                  <View style={styles.brandTags}>
                    {brands.map((b) => (
                      <View key={b} style={styles.brandTag}>
                        <Text style={styles.brandTagText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : match.content ? (
                <Text style={styles.matchBody} numberOfLines={2}>
                  {match.content}
                </Text>
              ) : null}

              <View style={styles.matchCta}>
                <Text style={styles.matchCtaText}>View full details</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showNoMatchCard && (
          <Animated.View
            entering={FadeInDown.duration(280)}
            exiting={FadeOut.duration(180)}
            style={[styles.noMatchCard, { bottom: insets.bottom + 170 }]}
          >
            <View style={styles.matchHead}>
              <View style={[styles.foundPill, styles.noMatchPill]}>
                <View style={[styles.foundDot, { backgroundColor: Colors.warning }]} />
                <Text style={[styles.foundText, { color: Colors.warning }]}>
                  NO MATCH
                </Text>
              </View>
              <TouchableOpacity onPress={resetState} hitSlop={10}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.matchName}>No matching medicine</Text>
            <Text style={styles.noMatchBody}>
              We read{' '}
              {triedCandidates.slice(0, 2).map((c, i) => (
                <Text key={c} style={styles.codeText}>
                  {i > 0 ? ', ' : ''}“{c}”
                </Text>
              ))}
              {triedCandidates.length > 2 ? ' and others' : ''} but nothing
              matched our salt index.
            </Text>

            {similar.length > 0 && (
              <>
                <Text style={styles.similarHead}>SIMILAR SALTS</Text>
                {similar.slice(0, 3).map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={styles.similarRow}
                    onPress={() => router.replace(`/medicine/${s._id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.similarName} numberOfLines={1}>
                      {s.drug_name}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={resetState}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={14} color={Colors.white} />
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </Animated.View>
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
  headerCenter: { alignItems: 'center' },
  headerTag: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: Colors.warning,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
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
  bottomLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.35)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  loaderPrimary: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  loaderSecondary: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  matchCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: Theme.spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  noMatchCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: Theme.spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.text,
  },
  matchHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  foundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
  },
  noMatchPill: {
    backgroundColor: Colors.warningBg,
  },
  foundDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  foundText: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.primary,
  },
  matchCategory: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.primary,
    marginBottom: 4,
  },
  matchName: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  matchBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.md,
  },
  brandLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  brandTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  brandTag: {
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  brandTagText: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  matchCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: Theme.spacing.xs,
  },
  matchCtaText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
  },
  noMatchBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  codeText: {
    color: Colors.text,
    fontWeight: Theme.fontWeight.semibold,
  },
  similarHead: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.warning,
    marginBottom: 6,
  },
  similarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  similarName: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    fontWeight: Theme.fontWeight.semibold,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
    marginTop: Theme.spacing.md,
  },
  retryText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
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
});
