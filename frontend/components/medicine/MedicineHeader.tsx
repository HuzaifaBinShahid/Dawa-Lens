import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type MedicineHeaderProps = {
  drugName: string;
  primaryName?: string;
  image?: string | null;
  category?: string;
  content?: string;
  forms: string[];
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function MedicineHeader({
  drugName,
  primaryName,
  image,
  category,
  content,
  forms,
}: MedicineHeaderProps) {
  const { palette } = useAppSettings();
  const imageStyle = useAnimatedEntry(100, 'fadeSlideUp');
  const infoStyle = useAnimatedEntry(300, 'fadeSlideUp');
  const [imageFailed, setImageFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const cleanImage = typeof image === 'string' ? image.trim() : '';
  const showImage = cleanImage.length > 0 && !imageFailed;

  const headline =
    primaryName && primaryName.trim().length > 0 ? primaryName.trim() : drugName;
  const showSaltLine =
    !!primaryName &&
    primaryName.trim().length > 0 &&
    primaryName.trim().toLowerCase() !== drugName.trim().toLowerCase();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          <Text style={styles.badgeText}>Verified Medicine</Text>
        </View>
        {showImage ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setZoomOpen(true)}
            style={styles.heroTouch}
          >
            <Image
              source={{ uri: cleanImage }}
              style={styles.heroImage}
              resizeMode="contain"
              onError={() => setImageFailed(true)}
            />
            <View style={styles.zoomHint}>
              <Ionicons name="expand" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="medkit" size={64} color={Colors.primary} />
          </View>
        )}
      </Animated.View>

      <Animated.View style={infoStyle}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={2}>
          {headline}
        </Text>
        {showSaltLine && (
          <Text
            style={[styles.saltLine, { color: palette.textSecondary }]}
            numberOfLines={2}
          >
            <Text style={styles.saltLabel}>Salt </Text>
            <Text style={styles.saltValue}>{drugName}</Text>
          </Text>
        )}
        {!!category && <Text style={styles.category}>{category}</Text>}
        {!!content && (
          <Text style={[styles.content, { color: palette.textSecondary }]}>
            {content}
          </Text>
        )}
        {forms && forms.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {forms.map((form) => (
              <View key={form} style={styles.chip}>
                <Ionicons name="pricetag" size={12} color={Colors.primary} />
                <Text style={styles.chipText}>{form}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      <Modal
        visible={zoomOpen}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setZoomOpen(false)}
      >
        {zoomOpen && (
          <View style={styles.zoomRoot}>
            <StatusBar barStyle="light-content" />
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(150)}
              style={StyleSheet.absoluteFill}
            >
              <Pressable
                style={styles.zoomBackdrop}
                onPress={() => setZoomOpen(false)}
              />
            </Animated.View>

            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(150)}
              style={styles.zoomContent}
              pointerEvents="box-none"
            >
              <Image
                source={{ uri: cleanImage }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
              <Text style={styles.zoomCaption} numberOfLines={2}>
                {headline}
              </Text>
            </Animated.View>

            <TouchableOpacity
              onPress={() => setZoomOpen(false)}
              style={styles.zoomClose}
              hitSlop={12}
            >
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const HERO_HEIGHT = 220;
const ZOOM_W = SCREEN_W * 0.9;
const ZOOM_H = SCREEN_H * 0.7;

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xl,
  },
  imageContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.success,
    fontWeight: Theme.fontWeight.medium,
  },
  imagePlaceholder: {
    width: 140,
    height: HERO_HEIGHT - 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTouch: {
    width: '100%',
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: Theme.borderRadius.full,
    padding: 8,
  },
  name: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.extrabold,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  saltLine: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Theme.spacing.sm,
  },
  saltLabel: {
    fontWeight: Theme.fontWeight.medium,
  },
  saltValue: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.bold,
  },
  category: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  content: {
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  chipsRow: {
    gap: Theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  zoomRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.93)',
  },
  zoomContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  zoomImage: {
    width: ZOOM_W,
    height: ZOOM_H,
  },
  zoomCaption: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    letterSpacing: -0.2,
  },
  zoomClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
