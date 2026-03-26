import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

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

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Theme.spacing.sm },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={onLeftPress || (() => router.back())}
            style={styles.iconButton}
          >
            <Ionicons
              name={leftIcon || 'arrow-back'}
              size={24}
              color={transparent ? Colors.white : Colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[
          styles.title,
          transparent && styles.titleWhite,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.right}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            <Ionicons
              name={rightIcon}
              size={24}
              color={transparent ? Colors.white : Colors.text}
            />
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
    backgroundColor: Colors.white,
  },
  transparent: {
    backgroundColor: Colors.transparent,
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
    color: Colors.text,
  },
  titleWhite: {
    color: Colors.white,
  },
  iconButton: {
    padding: Theme.spacing.xs,
  },
});
