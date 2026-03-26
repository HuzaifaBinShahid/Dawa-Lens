import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);

  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const cornerOpacity = useSharedValue(0.6);

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

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
  }));

  const handleCapture = () => {
    setIsScanning(true);
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      3,
      false
    );
    setTimeout(() => {
      setIsScanning(false);
      router.push('/medicine/1');
    }, 2000);
  };

  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + Theme.spacing.sm },
          headerStyle,
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Detection</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="flash-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.viewfinder}>
        <Animated.View style={[styles.cornerFrame, cornerStyle]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
        <View style={styles.scanInfo}>
          <Text style={styles.scanInfoText}>
            ALIGN THE MEDICINE PACKAGING WITHIN{'\n'}THE FRAME
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.controls,
          { paddingBottom: insets.bottom + Theme.spacing.xl },
          controlsStyle,
        ]}
      >
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
          <View style={styles.controlIcon}>
            <Ionicons name="images-outline" size={22} color={Colors.white} />
          </View>
          <Text style={styles.controlLabel}>GALLERY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureOuter}
          onPress={handleCapture}
          disabled={isScanning}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.captureInner, captureButtonStyle]}>
            {isScanning ? (
              <View style={styles.scanningDot} />
            ) : (
              <View style={styles.captureCenter} />
            )}
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
          <View style={styles.controlIcon}>
            <Ionicons name="bulb-outline" size={22} color={Colors.white} />
          </View>
          <Text style={styles.controlLabel}>TIPS</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <Ionicons name="camera" size={22} color={Colors.primary} />
        <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.scanBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  backBtn: {
    padding: Theme.spacing.xs,
  },
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
  cornerFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
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
    width: 220,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  scanInfo: {
    position: 'absolute',
    bottom: -50,
  },
  scanInfoText: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
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
  controlBtn: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  controlIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCenter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.grayBorder,
  },
  scanningDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.xxxl,
    paddingVertical: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
