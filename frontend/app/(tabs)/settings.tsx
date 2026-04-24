import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  rightElement?: React.ReactNode;
  delay: number;
};

export default function SettingsScreen() {
  const { t, palette, colorScheme, locale, setColorScheme, setLocale } =
    useAppSettings();
  const disclaimerStyle = useAnimatedEntry(500, 'fadeSlideUp');
  const versionStyle = useAnimatedEntry(700, 'fadeIn');

  const handleLocale = (next: 'en' | 'ur') => {
    if (next === locale) return;
    setLocale(next);
    if (next === 'ur') {
      Alert.alert(t('settings.restart.title'), t('settings.restart.body'), [
        { text: t('settings.restart.ok') },
      ]);
    }
  };

  const Row = ({ icon, title, rightElement, delay }: RowProps) => {
    const style = useAnimatedEntry(delay, 'slideLeft');
    return (
      <Animated.View style={style}>
        <View
          style={[
            styles.row,
            { borderBottomColor: palette.grayLight },
          ]}
        >
          <View style={styles.rowLeft}>
            <Ionicons name={icon} size={22} color={Colors.primary} />
            <Text style={[styles.rowTitle, { color: palette.text }]}>
              {title}
            </Text>
          </View>
          {rightElement || (
            <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
          )}
        </View>
      </Animated.View>
    );
  };

  const ToggleGroup = <T extends string>({
    value,
    options,
    onChange,
  }: {
    value: T;
    options: { id: T; label: string }[];
    onChange: (id: T) => void;
  }) => (
    <View
      style={[
        styles.toggleGroup,
        { borderColor: Colors.primary },
      ]}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.toggleBtn,
              active && { backgroundColor: Colors.primary },
            ]}
            onPress={() => onChange(opt.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                { color: Colors.primary },
                active && styles.toggleTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Header title={t('settings.title')} showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
          {t('settings.section.preferences')}
        </Text>
        <Row
          icon="color-palette-outline"
          title={t('settings.theme')}
          delay={100}
          rightElement={
            <ToggleGroup
              value={colorScheme}
              options={[
                { id: 'light', label: t('settings.theme.light') },
                { id: 'dark', label: t('settings.theme.dark') },
              ]}
              onChange={setColorScheme}
            />
          }
        />
        <Row
          icon="globe-outline"
          title={t('settings.language')}
          delay={200}
          rightElement={
            <ToggleGroup
              value={locale}
              options={[
                { id: 'en', label: 'EN' },
                { id: 'ur', label: 'اردو' },
              ]}
              onChange={handleLocale}
            />
          }
        />

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
          {t('settings.section.about')}
        </Text>
        <Row
          icon="shield-checkmark-outline"
          title={t('settings.privacy')}
          delay={300}
        />

        <Animated.View
          style={[
            styles.disclaimer,
            {
              backgroundColor: palette.disclaimerBg,
              borderColor: palette.grayBorder,
            },
            disclaimerStyle,
          ]}
        >
          <View style={styles.disclaimerHeader}>
            <Ionicons name="medical" size={18} color={palette.text} />
            <Text style={[styles.disclaimerTitle, { color: palette.text }]}>
              {t('settings.disclaimer.title')}
            </Text>
          </View>
          <Text style={[styles.disclaimerText, { color: palette.disclaimerText }]}>
            {t('settings.disclaimer.body')}
          </Text>
        </Animated.View>

        <Animated.Text
          style={[styles.version, { color: palette.textMuted }, versionStyle]}
        >
          {t('settings.version')}
        </Animated.Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    gap: Theme.spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  rowTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
    flexShrink: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  disclaimer: {
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    padding: Theme.spacing.lg,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  disclaimerTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
  },
  version: {
    textAlign: 'center',
    fontSize: Theme.fontSize.sm,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxxl,
  },
});
