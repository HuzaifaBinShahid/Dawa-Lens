import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type SafetyModalProps = {
  visible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
};

export default function SafetyModal({
  visible,
  title,
  items,
  onClose,
}: SafetyModalProps) {
  const insets = useSafeAreaInsets();
  const backdropOpacity = useSharedValue(0);
  const sheetY = useSharedValue(40);
  const sheetOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      sheetY.value = withSpring(0, { damping: 16, stiffness: 160 });
      sheetOpacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 160 });
      sheetY.value = withTiming(40, { duration: 180 });
      sheetOpacity.value = withTiming(0, { duration: 160 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateY: sheetY.value }],
  }));

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Theme.spacing.lg },
            sheetStyle,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Ionicons name="warning" size={18} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>SAFETY BRIEF</Text>
                <Text style={styles.title}>{title}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.countRow}>
            <View style={styles.countPill}>
              <Text style={styles.countText}>
                {String(items.length).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.countLabel}>
              {items.length === 1 ? 'ITEM' : 'ITEMS'} TO REVIEW
            </Text>
            <View style={styles.countRule} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.rowIndex}>
                  <Text style={styles.rowIndexText}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.rowText}>{item}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.dismiss}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.dismissText}>Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    maxHeight: '85%',
    borderTopWidth: 2,
    borderTopColor: Colors.warning,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayBorder,
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: Colors.warning,
    marginBottom: 2,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  countPill: {
    backgroundColor: Colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  countText: {
    fontSize: 12,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.warning,
    letterSpacing: 1,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.text,
  },
  countRule: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollInner: {
    paddingBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  rowIndex: {
    width: 32,
    height: 28,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIndexText: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    letterSpacing: 1,
  },
  rowText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    lineHeight: 21,
  },
  dismiss: {
    marginTop: Theme.spacing.lg,
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
  },
  dismissText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.3,
  },
});
