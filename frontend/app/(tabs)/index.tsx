import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  FadeIn,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Api } from '@/services/api';
import { recognizeMedicineText } from '@/services/ocr';
import { Medicine } from '@/types';
import CommonButton from '@/components/common/CommonButton';
import { healthTips } from '@/data/medicines';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
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

const TIP_INDEX_KEY = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

export default function HomeScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, palette } = useAppSettings();
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

  const headerStyle = useAnimatedEntry(80, 'fadeSlideUp');
  const tipStyle = useAnimatedEntry(180, 'fadeSlideUp');
  const controlsStyle = useAnimatedEntry(260, 'fadeSlideUp');
  const searchBarStyle = useAnimatedEntry(340, 'fadeSlideUp');

  const tipText = useMemo(() => {
    if (!healthTips || healthTips.length === 0) {
      return t('home.tip.fallback');
    }
    return healthTips[TIP_INDEX_KEY % healthTips.length].text;
  }, [t]);

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

  const resetState = () => {
    setStatus('idle');
    setMatch(null);
    setSimilar([]);
    setLastCandidate(null);
    setTriedCandidates([]);
  };

  const logScanHistory = (m: Medicine | null, candidate: string | null) => {
    Api.logHistory({
      type: 'scan',
      medicineId: m?._id || null,
      query: candidate,
      matchedBrand: m ? resolveScanMatch(m, candidate).primary : null,
    }).catch(() => {});
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
        Alert.alert(
          'No text detected',
          'Try a clearer, closer photo of the packaging.'
        );
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
            logScanHistory(result.best, candidate);
            const altIds = (result.alternates || [])
              .map((m) => m._id)
              .filter(Boolean)
              .join(',');
            const matched = resolveScanMatch(result.best, candidate).primary;
            const params = new URLSearchParams();
            if (altIds) params.set('alternates', altIds);
            if (matched) params.set('primary', matched);
            const qs = params.toString();
            const path = qs
              ? `/medicine/${result.best._id}?${qs}`
              : `/medicine/${result.best._id}`;
            // Reset state immediately so the camera UI is clean when user returns
            resetState();
            router.push(path as any);
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
          <Text style={styles.permissionTitle}>{t('home.permission.title')}</Text>
          <Text style={styles.permissionText}>{t('home.permission.body')}</Text>
          <CommonButton
            title={t('home.permission.grant')}
            onPress={requestPermission}
            style={styles.permissionBtn}
          />
        </View>
      </View>
    );
  }

  const statusLabel: Record<ScanStatus, string> = {
    idle: t('home.status.idle'),
    capturing: t('home.status.capturing'),
    analyzing: t('home.status.analyzing'),
    searching: lastCandidate
      ? `${t('home.status.searchingPrefix')} "${lastCandidate}"...`
      : `${t('home.status.searchingPrefix')}...`,
    matched: t('home.status.found'),
    nomatch: t('home.status.noMatch'),
  };

  const busy =
    status === 'capturing' ||
    status === 'analyzing' ||
    status === 'searching';

  const showBottomLoader = busy;
  const showMatchCard = status === 'matched' && !!match;
  const showNoMatchCard = status === 'nomatch';

  const scanResolved = match ? resolveScanMatch(match, lastCandidate) : null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
      />
      <View style={styles.dimOverlay} pointerEvents="none" />

      {/* Top bar */}
      <Animated.View
        style={[
          styles.topBar,
          { paddingTop: insets.top + Theme.spacing.sm },
          headerStyle,
        ]}
      >
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <View style={[styles.brandDot, styles.brandDotBlue]} />
            <View style={[styles.brandDot, styles.brandDotOrange]} />
          </View>
          <Text style={styles.brandText}>DawaLens</Text>
        </View>
      </Animated.View>

      {/* Quick tip pill */}
      <Animated.View
        style={[
          styles.tipPill,
          { top: insets.top + 70 },
          tipStyle,
        ]}
      >
        <View style={styles.tipDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipEyebrow}>{t('home.tip.eyebrow')}</Text>
          <Text style={styles.tipText} numberOfLines={2}>
            {tipText}
          </Text>
        </View>
      </Animated.View>

      {/* Viewfinder */}
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

      {/* Bottom stack: loader / peek card / controls / search bar */}
      <View style={styles.bottomStack} pointerEvents="box-none">
        {showBottomLoader && (
          <Animated.View
            entering={FadeInDown.duration(240)}
            exiting={FadeOut.duration(180)}
            style={styles.bottomLoader}
          >
            <ActivityIndicator color={Colors.warning} size="small" />
            <View style={{ flex: 1 }}>
              <Text style={styles.loaderPrimary}>
                {status === 'searching'
                  ? t('home.loader.searching')
                  : status === 'analyzing'
                  ? t('home.loader.analyzing')
                  : t('home.loader.capturing')}
              </Text>
              {status === 'searching' && lastCandidate && (
                <Text style={styles.loaderSecondary}>
                  {t('home.loader.matching')} "{lastCandidate}"
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {showMatchCard && match && (
          <Animated.View
            entering={FadeInDown.duration(280)}
            exiting={FadeOut.duration(180)}
            style={[styles.matchCard, { backgroundColor: palette.white }]}
          >
            <View style={styles.matchHead}>
              <View style={styles.foundPill}>
                <View style={styles.foundDot} />
                <Text style={styles.foundText}>{t('home.found')}</Text>
              </View>
              <TouchableOpacity onPress={resetState} hitSlop={10}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/medicine/${match._id}`)}
            >
              {match.category && (
                <Text style={styles.matchCategory} numberOfLines={1}>
                  {match.category.toUpperCase()}
                </Text>
              )}
              <Text style={[styles.matchName, { color: palette.text }]} numberOfLines={1}>
                {scanResolved?.primary || match.drug_name}
              </Text>
              <Text style={styles.containsLine} numberOfLines={1}>
                <Text style={[styles.containsLabel, { color: palette.textSecondary }]}>
                  {t('home.salt')}{' '}
                </Text>
                <Text style={styles.containsSalt}>{match.drug_name}</Text>
              </Text>

              {scanResolved && scanResolved.related.length > 0 && (
                <View style={styles.brandRow}>
                  <Text style={[styles.brandLabel, { color: palette.textSecondary }]}>
                    {t('home.alsoAs')}
                  </Text>
                  <View style={styles.brandTags}>
                    {scanResolved.related.map((b) => (
                      <View
                        key={b}
                        style={[
                          styles.brandTag,
                          {
                            backgroundColor: palette.cardBg,
                            borderColor: palette.grayBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.brandTagText, { color: palette.text }]}>
                          {b}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.matchCta}>
                <Text style={styles.matchCtaText}>{t('home.viewFull')}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Colors.primary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showNoMatchCard && (
          <Animated.View
            entering={FadeInDown.duration(280)}
            exiting={FadeOut.duration(180)}
            style={[
              styles.noMatchCard,
              {
                backgroundColor: palette.white,
                borderColor: palette.text,
              },
            ]}
          >
            <View style={styles.matchHead}>
              <View style={[styles.foundPill, styles.noMatchPill]}>
                <View
                  style={[
                    styles.foundDot,
                    { backgroundColor: Colors.warning },
                  ]}
                />
                <Text style={[styles.foundText, { color: Colors.warning }]}>
                  {t('home.noMatch')}
                </Text>
              </View>
              <TouchableOpacity onPress={resetState} hitSlop={10}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.matchName, { color: palette.text }]}>
              {t('home.noMatchTitle')}
            </Text>
            <Text style={[styles.noMatchBody, { color: palette.textSecondary }]}>
              {triedCandidates.slice(0, 2).map((c, i) => (
                <Text key={c} style={[styles.codeText, { color: palette.text }]}>
                  {i > 0 ? ', ' : ''}"{c}"
                </Text>
              ))}
            </Text>

            {similar.length > 0 && (
              <>
                <Text style={styles.similarHead}>{t('home.similarSalts')}</Text>
                {similar.slice(0, 3).map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={styles.similarRow}
                    onPress={() => router.push(`/medicine/${s._id}`)}
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
              <Text style={styles.retryText}>{t('home.tryAgain')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Action row (flash / capture / gallery) */}
        <Animated.View style={[styles.controls, controlsStyle]}>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-outline'}
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>

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
                <Ionicons name="scan" size={28} color={Colors.white} />
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Coming soon',
                'Gallery import will be available in a future update.'
              )
            }
          >
            <Ionicons name="images-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Search bar launcher */}
        <Animated.View style={[styles.searchLauncherWrap, searchBarStyle]}>
          <TouchableOpacity
            style={[
              styles.searchLauncher,
              {
                backgroundColor: palette.white,
                borderColor: palette.grayBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={18} color={palette.text} />
            <Text
              style={[styles.searchLauncherText, { color: palette.textMuted }]}
              numberOfLines={1}
            >
              {t('home.search.placeholder')}
            </Text>
            <View style={styles.searchMic}>
              <Ionicons name="mic-outline" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scanBg },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  brandDot: {
    width: 10,
    height: 18,
  },
  brandDotBlue: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  brandDotOrange: {
    backgroundColor: Colors.warning,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  brandText: {
    fontSize: 18,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.white,
    letterSpacing: -0.4,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tipPill: {
    position: 'absolute',
    right: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 210,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    marginTop: 4,
  },
  tipEyebrow: {
    fontSize: 9,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.warning,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 15,
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xxxl,
  },
  cornerFrame: { width: 240, height: 240, position: 'relative' },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: 210,
    height: 2,
    backgroundColor: Colors.warning,
    opacity: 0.85,
  },
  scanInfo: { position: 'absolute', bottom: -44 },
  scanInfoText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 1.3,
    lineHeight: 16,
  },
  bottomStack: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  bottomLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
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
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  noMatchCard: {
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
  containsLine: {
    marginTop: -2,
    marginBottom: Theme.spacing.md,
  },
  containsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  containsSalt: {
    fontSize: 12,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
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
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xxl,
    marginTop: Theme.spacing.sm,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 96, 184, 0.18)',
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBusy: { backgroundColor: Colors.warning },
  scanningDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
  },
  searchLauncherWrap: {
    marginTop: Theme.spacing.xs,
  },
  searchLauncher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.full,
    paddingLeft: Theme.spacing.lg,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    height: 48,
  },
  searchLauncherText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.medium,
  },
  searchMic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxl,
    gap: Theme.spacing.md,
    backgroundColor: Colors.scanBg,
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
});
