import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  transparent?: boolean;
};

export default function Header({
  title,
  showBack = true,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  transparent = false,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppSettings();

  const iconColor = transparent ? Colors.white : palette.text;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Theme.spacing.sm,
          backgroundColor: transparent ? 'transparent' : palette.white,
        },
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={onLeftPress || (() => router.back())}
            style={styles.iconButton}
          >
            <Ionicons name={leftIcon || 'arrow-back'} size={24} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[
          styles.title,
          { color: transparent ? Colors.white : palette.text },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.right}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            <Ionicons name={rightIcon} size={24} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  iconButton: {
    padding: Theme.spacing.xs,
  },
});
