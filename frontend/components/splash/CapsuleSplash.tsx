import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

type CapsuleSplashProps = {
  onComplete: () => void;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CAPSULE_WIDTH = Math.min(240, SCREEN_W * 0.6);
const CAPSULE_HEIGHT = Math.round(CAPSULE_WIDTH / 2.55);
const HALF_WIDTH = CAPSULE_WIDTH / 2;

const WORDMARK = 'DawaLens';

type FloatIconConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  size: number;
  top: number;
  left: number;
  delayMs: number;
  rotate: number;
  tint: string;
  floatAmp: number;
  floatPeriod: number;
};

const FLOAT_ICONS: FloatIconConfig[] = [
  {
    icon: 'medical',
    size: 22,
    top: SCREEN_H * 0.18,
    left: SCREEN_W * 0.12,
    delayMs: 0,
    rotate: -14,
    tint: 'rgba(1, 96, 184, 0.35)',
    floatAmp: 6,
    floatPeriod: 2400,
  },
  {
    icon: 'leaf-outline',
    size: 24,
    top: SCREEN_H * 0.22,
    left: SCREEN_W * 0.82,
    delayMs: 120,
    rotate: 22,
    tint: 'rgba(22, 163, 74, 0.4)',
    floatAmp: 7,
    floatPeriod: 2600,
  },
  {
    icon: 'water-outline',
    size: 20,
    top: SCREEN_H * 0.32,
    left: SCREEN_W * 0.17,
    delayMs: 240,
    rotate: 8,
    tint: 'rgba(234, 88, 12, 0.45)',
    floatAmp: 5,
    floatPeriod: 2200,
  },
  {
    icon: 'fitness-outline',
    size: 22,
    top: SCREEN_H * 0.68,
    left: SCREEN_W * 0.14,
    delayMs: 360,
    rotate: -10,
    tint: 'rgba(1, 96, 184, 0.3)',
    floatAmp: 6,
    floatPeriod: 2800,
  },
  {
    icon: 'heart-outline',
    size: 22,
    top: SCREEN_H * 0.74,
    left: SCREEN_W * 0.82,
    delayMs: 480,
    rotate: 14,
    tint: 'rgba(220, 38, 38, 0.35)',
    floatAmp: 7,
    floatPeriod: 2500,
  },
  {
    icon: 'pulse',
    size: 28,
    top: SCREEN_H * 0.83,
    left: SCREEN_W * 0.5 - 14,
    delayMs: 600,
    rotate: 0,
    tint: 'rgba(1, 96, 184, 0.32)',
    floatAmp: 4,
    floatPeriod: 2200,
  },
  {
    icon: 'bandage-outline',
    size: 22,
    top: SCREEN_H * 0.12,
    left: SCREEN_W * 0.5 - 11,
    delayMs: 720,
    rotate: 12,
    tint: 'rgba(234, 88, 12, 0.35)',
    floatAmp: 5,
    floatPeriod: 2300,
  },
  {
    icon: 'medkit-outline',
    size: 22,
    top: SCREEN_H * 0.28,
    left: SCREEN_W * 0.5 - 11,
    delayMs: 840,
    rotate: -6,
    tint: 'rgba(1, 96, 184, 0.18)',
    floatAmp: 4,
    floatPeriod: 2500,
  },
];

/**
 * Cinematic splash storyboard (~7.0s total):
 *
 *   0.00 – 0.35s   blue field holds (seamless handoff from expo-splash-screen)
 *                  soft radial glow breathes into view in the center
 *   0.35 – 1.40s   capsule zoom-in: scales up from 0.15 with perspective tilt
 *   1.40 – 2.05s   anticipation: capsule inhales + overshoot, subtle vignette
 *   2.05 – 2.75s   CAPSULE BREAKS: halves fly apart horizontally with
 *                  counter-rotation, a big white bloom flashes from the seam,
 *                  a full-screen flash blankets the view briefly
 *   2.55 – 3.85s   ROW-WISE SCREEN SPLIT: top blue half slides up out of frame,
 *                  bottom blue half slides down out of frame
 *   3.80 – 5.10s   wordmark reveal: DawaLens letters rise in with long
 *                  staggered fade (per-letter ~120ms delays)
 *   4.60 – 5.30s   orange underline scales in from center, tagline fades up
 *   5.00 – 6.20s   floating medicine icons fade in at corners + edges with
 *                  stagger; each icon drifts gently (endless subtle float)
 *   5.40 – 6.80s   blue scanner line sweeps across the wordmark
 *                  (like the camera viewfinder) — runs twice, soft glow trail
 *   6.80 – 7.10s   hold on the finished lockup
 *   7.10 – 7.45s   fade out, navigate to app
 */
export default function CapsuleSplash({ onComplete }: CapsuleSplashProps) {
  const letters = useMemo(() => WORDMARK.split(''), []);

  // Ambient / background
  const glowScale = useSharedValue(0.4);
  const glowOpacity = useSharedValue(0);
  const vignetteOpacity = useSharedValue(0);

  // Capsule entry + idle
  const capsuleScale = useSharedValue(0.15);
  const capsuleOpacity = useSharedValue(0);
  const capsuleTilt = useSharedValue(22);
  const capsuleFloat = useSharedValue(0);

  // Capsule break
  const leftX = useSharedValue(0);
  const leftRot = useSharedValue(0);
  const leftOpacity = useSharedValue(1);
  const rightX = useSharedValue(0);
  const rightRot = useSharedValue(0);
  const rightOpacity = useSharedValue(1);

  // The big seam flash
  const seamFlashOpacity = useSharedValue(0);
  const seamFlashScale = useSharedValue(0.3);
  const screenFlashOpacity = useSharedValue(0);

  // Row-wise screen split (blue panels slide away)
  const topPanelY = useSharedValue(0);
  const bottomPanelY = useSharedValue(0);

  // Wordmark + underline
  const wordmarkProgress = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const underlineScale = useSharedValue(0);
  const underlineOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  // Scanner line over the wordmark
  const scannerProgress = useSharedValue(0);
  const scannerOpacity = useSharedValue(0);
  const scannerGlow = useSharedValue(0.6);

  // Final fade
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 0.0 – 0.35s: ambient setup
    glowOpacity.value = withTiming(0.6, { duration: 600 });
    glowScale.value = withTiming(1, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
    glowScale.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(0.95, {
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1.05, {
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );

    // 0.35 – 1.40s: capsule zoom-in
    capsuleOpacity.value = withDelay(
      350,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    capsuleScale.value = withDelay(
      350,
      withTiming(1, { duration: 1050, easing: Easing.out(Easing.cubic) })
    );
    capsuleTilt.value = withDelay(
      350,
      withTiming(0, { duration: 1050, easing: Easing.out(Easing.cubic) })
    );
    capsuleFloat.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(-4, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(4, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );

    // 1.40 – 2.05s: anticipation
    capsuleScale.value = withDelay(
      1400,
      withSequence(
        withTiming(1, { duration: 250 }),
        withTiming(0.92, {
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(1.04, {
          duration: 180,
          easing: Easing.out(Easing.quad),
        })
      )
    );
    vignetteOpacity.value = withDelay(
      1400,
      withTiming(0.35, { duration: 650 })
    );

    // 2.05 – 2.75s: CAPSULE BREAKS
    leftX.value = withDelay(
      2050,
      withSequence(
        withTiming(-8, { duration: 90 }),
        withTiming(-SCREEN_W * 0.7, {
          duration: 620,
          easing: Easing.out(Easing.cubic),
        })
      )
    );
    rightX.value = withDelay(
      2050,
      withSequence(
        withTiming(8, { duration: 90 }),
        withTiming(SCREEN_W * 0.7, {
          duration: 620,
          easing: Easing.out(Easing.cubic),
        })
      )
    );
    leftRot.value = withDelay(
      2140,
      withTiming(-22, { duration: 620, easing: Easing.out(Easing.cubic) })
    );
    rightRot.value = withDelay(
      2140,
      withTiming(22, { duration: 620, easing: Easing.out(Easing.cubic) })
    );
    leftOpacity.value = withDelay(2400, withTiming(0, { duration: 340 }));
    rightOpacity.value = withDelay(2400, withTiming(0, { duration: 340 }));
    seamFlashOpacity.value = withDelay(
      2080,
      withSequence(
        withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 720, easing: Easing.out(Easing.cubic) })
      )
    );
    seamFlashScale.value = withDelay(
      2080,
      withTiming(6, { duration: 880, easing: Easing.out(Easing.cubic) })
    );
    screenFlashOpacity.value = withDelay(
      2200,
      withSequence(
        withTiming(0.55, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 680, easing: Easing.out(Easing.cubic) })
      )
    );

    // 2.55 – 3.85s: ROW-WISE SCREEN SPLIT
    topPanelY.value = withDelay(
      2550,
      withTiming(-SCREEN_H / 2 - 4, {
        duration: 1300,
        easing: Easing.inOut(Easing.cubic),
      })
    );
    bottomPanelY.value = withDelay(
      2550,
      withTiming(SCREEN_H / 2 + 4, {
        duration: 1300,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // 3.80 – 5.10s: wordmark reveal
    wordmarkOpacity.value = withDelay(3800, withTiming(1, { duration: 320 }));
    wordmarkProgress.value = withDelay(
      3800,
      withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) })
    );

    // 4.60 – 5.30s: underline + tagline
    underlineScale.value = withDelay(
      4600,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    underlineOpacity.value = withDelay(
      4600,
      withTiming(1, { duration: 420 })
    );
    taglineOpacity.value = withDelay(4900, withTiming(1, { duration: 420 }));

    // 5.40 – 6.80s: scanner sweep across the wordmark (runs twice)
    scannerOpacity.value = withDelay(5400, withTiming(1, { duration: 180 }));
    scannerProgress.value = withDelay(
      5400,
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 40 }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) })
      )
    );
    scannerGlow.value = withDelay(
      5400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380 }),
          withTiming(0.5, { duration: 380 })
        ),
        -1,
        true
      )
    );
    scannerOpacity.value = withDelay(6800, withTiming(0, { duration: 200 }));

    // 7.10 – 7.45s: fade + handoff
    screenOpacity.value = withDelay(
      7100,
      withTiming(0, { duration: 350 }, (finished) => {
        if (finished) runOnJS(onComplete)();
      })
    );
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const vignetteStyle = useAnimatedStyle(() => ({
    opacity: vignetteOpacity.value,
  }));

  const capsuleWrapStyle = useAnimatedStyle(() => ({
    opacity: capsuleOpacity.value,
    transform: [
      { translateY: capsuleFloat.value },
      { perspective: 900 },
      { scale: capsuleScale.value },
      { rotateX: `${capsuleTilt.value}deg` },
    ],
  }));

  const leftHalfStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
    transform: [
      { translateX: leftX.value },
      { rotate: `${leftRot.value}deg` },
    ],
  }));

  const rightHalfStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
    transform: [
      { translateX: rightX.value },
      { rotate: `${rightRot.value}deg` },
    ],
  }));

  const seamFlashStyle = useAnimatedStyle(() => ({
    opacity: seamFlashOpacity.value,
    transform: [{ scale: seamFlashScale.value }],
  }));

  const screenFlashStyle = useAnimatedStyle(() => ({
    opacity: screenFlashOpacity.value,
  }));

  const topPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topPanelY.value }],
  }));

  const bottomPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomPanelY.value }],
  }));

  const wordmarkOpacityStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    opacity: underlineOpacity.value,
    transform: [{ scaleX: underlineScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const scannerLineStyle = useAnimatedStyle(() => {
    const startX = -SCANNER_WIDTH * 0.15;
    const endX = SCANNER_WIDTH * 1.15;
    return {
      opacity: scannerOpacity.value,
      transform: [
        {
          translateX: interpolate(
            scannerProgress.value,
            [0, 1],
            [startX, endX],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const scannerGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scannerGlow.value * 0.55,
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      {/* White canvas — the final surface */}
      <View style={styles.whiteCanvas} />

      {/* Floating medicine icons (decorative) */}
      <View style={styles.iconsLayer} pointerEvents="none">
        {FLOAT_ICONS.map((cfg, i) => (
          <FloatIcon key={`${cfg.icon}-${i}`} config={cfg} />
        ))}
      </View>

      {/* Wordmark + underline + tagline + scanner sweep */}
      <Animated.View
        style={[styles.wordmarkLayer, wordmarkOpacityStyle]}
        pointerEvents="none"
      >
        <View style={styles.wordmarkBlock}>
          <View style={styles.wordmarkRow}>
            {letters.map((ch, i) => (
              <Letter
                key={`${ch}-${i}`}
                index={i}
                total={letters.length}
                ch={ch}
                progress={wordmarkProgress}
              />
            ))}
          </View>

          {/* Scanner sweep lives over the wordmark */}
          <View style={styles.scannerBand} pointerEvents="none">
            <Animated.View style={[styles.scannerLine, scannerLineStyle]}>
              <Animated.View
                style={[styles.scannerGlow, scannerGlowStyle]}
              />
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[styles.underline, underlineStyle]} />

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          MEDICINE  ·  INTELLIGENCE
        </Animated.Text>
      </Animated.View>

      {/* Top blue panel — slides up to reveal white */}
      <Animated.View
        style={[styles.topPanel, topPanelStyle]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.radialGlow, glowStyle]} />
        <Animated.View style={[styles.vignette, vignetteStyle]} />
      </Animated.View>

      {/* Bottom blue panel — slides down to reveal white */}
      <Animated.View
        style={[styles.bottomPanel, bottomPanelStyle]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.radialGlowBottom, glowStyle]} />
        <Animated.View style={[styles.vignetteBottom, vignetteStyle]} />
      </Animated.View>

      {/* Capsule layered above blue panels while they're in place */}
      <Animated.View style={[styles.capsuleWrap, capsuleWrapStyle]}>
        <Animated.View
          style={[styles.halfBase, styles.leftHalf, leftHalfStyle]}
        >
          <View style={styles.leftShine} />
        </Animated.View>
        <Animated.View
          style={[styles.halfBase, styles.rightHalf, rightHalfStyle]}
        >
          <View style={styles.rightShine} />
        </Animated.View>

        <Animated.View style={[styles.seamFlash, seamFlashStyle]} />
      </Animated.View>

      <Animated.View
        style={[styles.screenFlash, screenFlashStyle]}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

function Letter({
  index,
  total,
  ch,
  progress,
}: {
  index: number;
  total: number;
  ch: string;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const perLetter = 0.65 / Math.max(total, 1);
    const start = index * perLetter;
    const end = start + 0.35;
    const raw = interpolate(
      progress.value,
      [start, end],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: raw,
      transform: [
        { translateY: (1 - raw) * 24 },
        { scale: 0.9 + raw * 0.1 },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.letter, animatedStyle]}>{ch}</Animated.Text>
  );
}

function FloatIcon({ config }: { config: FloatIconConfig }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const pulse = useSharedValue(0.9);

  useEffect(() => {
    const baseDelay = 5000 + config.delayMs;
    opacity.value = withDelay(
      baseDelay,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      baseDelay,
      withRepeat(
        withSequence(
          withTiming(-config.floatAmp, {
            duration: config.floatPeriod / 2,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(config.floatAmp, {
            duration: config.floatPeriod / 2,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );
    pulse.value = withDelay(
      baseDelay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.85, {
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * pulse.value,
    transform: [
      { translateY: translateY.value },
      { rotate: `${config.rotate}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.floatIcon,
        {
          top: config.top,
          left: config.left,
        },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={config.size} color={config.tint} />
    </Animated.View>
  );
}

const GLOW_SIZE = Math.max(SCREEN_W, SCREEN_H) * 0.9;
const SCANNER_WIDTH = Math.min(300, SCREEN_W * 0.72);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  whiteCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
  },
  iconsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  floatIcon: {
    position: 'absolute',
  },
  topPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_H / 2 + 2,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_H / 2 + 2,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  radialGlow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    left: SCREEN_W / 2 - GLOW_SIZE / 2,
    top: SCREEN_H / 2 - GLOW_SIZE / 2,
    backgroundColor: '#2988E6',
    opacity: 0.6,
  },
  radialGlowBottom: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    left: SCREEN_W / 2 - GLOW_SIZE / 2,
    top: -GLOW_SIZE / 2,
    backgroundColor: '#2988E6',
    opacity: 0.6,
  },
  vignette: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H / 2,
    backgroundColor: '#000',
    opacity: 0,
  },
  vignetteBottom: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H / 2,
    backgroundColor: '#000',
    opacity: 0,
  },
  capsuleWrap: {
    position: 'absolute',
    top: SCREEN_H / 2 - CAPSULE_HEIGHT / 2,
    left: SCREEN_W / 2 - CAPSULE_WIDTH / 2,
    width: CAPSULE_WIDTH,
    height: CAPSULE_HEIGHT,
    flexDirection: 'row',
  },
  halfBase: {
    width: HALF_WIDTH,
    height: CAPSULE_HEIGHT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  leftHalf: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: CAPSULE_HEIGHT / 2,
    borderBottomLeftRadius: CAPSULE_HEIGHT / 2,
  },
  rightHalf: {
    backgroundColor: Colors.warning,
    borderTopRightRadius: CAPSULE_HEIGHT / 2,
    borderBottomRightRadius: CAPSULE_HEIGHT / 2,
  },
  leftShine: {
    position: 'absolute',
    top: 6,
    left: 16,
    width: HALF_WIDTH * 0.4,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(1,96,184,0.22)',
  },
  rightShine: {
    position: 'absolute',
    top: 6,
    right: 16,
    width: HALF_WIDTH * 0.4,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  seamFlash: {
    position: 'absolute',
    left: HALF_WIDTH - CAPSULE_HEIGHT * 0.8,
    top: -CAPSULE_HEIGHT * 0.35,
    width: CAPSULE_HEIGHT * 1.6,
    height: CAPSULE_HEIGHT * 1.7,
    borderRadius: CAPSULE_HEIGHT,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  screenFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  wordmarkLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scannerBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCANNER_WIDTH,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  scannerGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -26,
    width: 54,
    backgroundColor: 'rgba(1, 96, 184, 0.32)',
    borderRadius: 27,
  },
  letter: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1.6,
  },
  underline: {
    width: 64,
    height: 3,
    backgroundColor: Colors.warning,
    borderRadius: 2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 3.2,
  },
});
