import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const logoTranslateY = useSharedValue(16);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const percentOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const navigateToAuth = () => {
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    logoTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    logoOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 600 })
    );
    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500 })
    );
    titleTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    subtitleOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 500 })
    );
    progressOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 400 })
    );
    percentOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 400 })
    );
    progressWidth.value = withDelay(
      1400,
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) })
    );
    footerOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600 })
    );
    screenOpacity.value = withDelay(
      3800,
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(navigateToAuth)();
        }
      })
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const progressFillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressWidth.value, [0, 1], [0, 100])}%`,
  }));

  const percentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: percentOpacity.value,
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBox}>
            <Ionicons name="search" size={40} color={Colors.primary} />
            <View style={styles.logoBadge}>
              <Ionicons name="add-circle" size={18} color={Colors.primary} />
            </View>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          DawaLens
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Smart Medicine Recognition for{'\n'}Your Safety
        </Animated.Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Animated.Text style={[styles.progressLabel, progressBarAnimatedStyle]}>
              Initializing AI Lens...
            </Animated.Text>
            <Animated.Text style={[styles.progressPercent, percentAnimatedStyle]}>
              75%
            </Animated.Text>
          </View>
          <Animated.View style={[styles.progressTrack, progressBarAnimatedStyle]}>
            <Animated.View style={[styles.progressFill, progressFillAnimatedStyle]} />
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <Text style={styles.footerLabel}>MADE FOR PAKISTAN</Text>
        <View style={styles.footerLocation}>
          <Ionicons name="location" size={14} color={Colors.white} />
          <Text style={styles.footerCity}>Karachi, PK</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splashBg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xxxl,
  },
  logoContainer: {
    marginBottom: Theme.spacing.xxl,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.full,
    padding: 2,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.white,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xxxl,
  },
  progressSection: {
    width: '80%',
    marginTop: Theme.spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  progressPercent: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Theme.spacing.xxxl,
  },
  footerLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: Theme.spacing.xs,
  },
  footerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerCity: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
});
