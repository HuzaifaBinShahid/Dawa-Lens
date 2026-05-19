import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useT } from '@/contexts/AppSettingsContext';
import { Api } from '@/services/api';
import { getDeviceId } from '@/services/deviceIdentity';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const C = {
  bg: '#F0F7FF',
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#475569',
  textSubtle: '#64748B',
  textFaint: '#94A3B8',
  primary: '#005FB8',
  primaryFab: '#005BC4',
  primaryBg: '#E3EEFA',
  border: 'rgba(0, 88, 190, 0.10)',
  divider: '#F1F5F9',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.08)',
  shadowColor: '#1F2937',
};

type Stat = { value: number; label: string };

function StatColumn({ stat }: { stat: Stat }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-2xl font-extrabold" style={{ color: C.primary }}>
        {stat.value}
      </Text>
      <Text
        className="mt-1 text-[10px] font-bold tracking-widest"
        style={{ color: C.textSubtle }}
      >
        {stat.label}
      </Text>
    </View>
  );
}

function ConditionRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-2xl p-3"
      style={{
        backgroundColor: C.primaryBg,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: C.card }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold" style={{ color: C.text }}>
          {title}
        </Text>
        <Text className="text-[11px]" style={{ color: C.textSubtle }}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
    </Pressable>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5"
      style={
        isLast
          ? undefined
          : { borderBottomWidth: 1, borderBottomColor: C.divider }
      }
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={18} color={C.primary} />
        <Text className="text-sm font-semibold" style={{ color: C.text }}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {!!value && (
          <Text className="text-sm" style={{ color: C.textSubtle }}>
            {value}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
      </View>
    </Pressable>
  );
}

function LogoutButton({ onPress }: { onPress: () => void }) {
  const t = useT();
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      press.value,
      [0, 1],
      ['#FFFFFF', C.danger]
    ),
  }));

  const textColor = useAnimatedStyle(() => ({
    color: interpolateColor(press.value, [0, 1], [C.danger, '#FFFFFF']),
  }));

  const handlePressIn = () => {
    press.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
  };
  const handlePressOut = () => {
    press.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View
        style={[
          animatedStyle,
          {
            borderWidth: 1.5,
            borderColor: C.danger,
            borderRadius: 9999,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },
        ]}
      >
        <Animated.Text style={[textColor]}>
          <Ionicons name="log-out-outline" size={18} />
        </Animated.Text>
        <Animated.Text
          style={[textColor, { fontSize: 14, fontWeight: '700' }]}
        >
          {t('profile.logout')}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const t = useT();
  const router = useRouter();
  const [medications, setMedications] = useState(0);
  const [scans, setScans] = useState(0);
  const [conditions, setConditions] = useState(2);
  const [profileId, setProfileId] = useState('');

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const heroStyle = useAnimatedEntry(120, 'fadeSlideUp');
  const conditionsStyle = useAnimatedEntry(220, 'fadeSlideUp');
  const settingsStyle = useAnimatedEntry(320, 'fadeSlideUp');
  const logoutStyle = useAnimatedEntry(420, 'fadeSlideUp');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const id = getDeviceId();
          if (!cancelled) {
            const tail = (id || '').replace(/-/g, '').slice(-4).toUpperCase();
            setProfileId(`#DL-${tail || '0000'}`);
          }
          const [trackers, history] = await Promise.all([
            Api.tracker.list().catch(() => []),
            Api.getHistory({ type: 'scan', limit: 200 }).catch(() => []),
          ]);
          if (!cancelled) {
            setMedications(trackers.length);
            setScans(history.length);
          }
        } catch {}
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const stats: Stat[] = [
    { value: medications, label: t('profile.stats.medications') },
    { value: conditions, label: t('profile.stats.conditions') },
    { value: scans, label: t('profile.stats.scans') },
  ];

  const goSettings = () => router.push('/(tabs)/settings' as any);
  const comingSoon = () =>
    Alert.alert(t('search.comingSoon.title'), t('search.comingSoon.body'));
  const onLogout = () =>
    Alert.alert(
      t('profile.logout'),
      'Are you sure you want to log out?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: () => {} },
      ]
    );

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-5 pt-2"
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: C.primaryBg }}
        >
          <Ionicons name="person" size={18} color={C.primary} />
        </View>
        <Text className="text-lg font-bold" style={{ color: C.primary }}>
          {t('profile.title')}
        </Text>
        <Pressable
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: C.card,
            shadowColor: C.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="notifications-outline" size={18} color={C.textMuted} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 160,
          paddingTop: 16,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            heroStyle,
            {
              backgroundColor: C.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              padding: 20,
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: C.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 18,
              elevation: 2,
            },
          ]}
        >
          <View
            className="mb-3 h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: C.primaryBg,
              borderWidth: 2,
              borderColor: C.card,
              shadowColor: C.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="person" size={36} color={C.primary} />
          </View>
          <Text className="text-xl font-bold" style={{ color: C.text }}>
            {t('profile.placeholder.name')}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: C.textSubtle }}>
            {t('profile.id')}: {profileId}
          </Text>
          <View
            className="my-4 h-px w-full"
            style={{ backgroundColor: C.divider }}
          />
          <View className="flex-row">
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                <StatColumn stat={s} />
                {i < stats.length - 1 && (
                  <View
                    className="w-px self-stretch"
                    style={{ backgroundColor: C.divider }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            conditionsStyle,
            {
              backgroundColor: C.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              padding: 16,
              marginBottom: 16,
              shadowColor: C.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 18,
              elevation: 2,
            },
          ]}
        >
          <View className="mb-3 flex-row items-center gap-2">
            <Ionicons name="bar-chart" size={18} color={C.primary} />
            <Text className="text-base font-bold" style={{ color: C.text }}>
              {t('profile.section.conditions')}
            </Text>
          </View>
          <ConditionRow
            icon="water"
            iconBg={C.primaryBg}
            iconColor={C.primary}
            title={t('profile.condition.diabetes')}
            subtitle={t('profile.condition.diabetes.sub')}
            onPress={comingSoon}
          />
          <ConditionRow
            icon="heart"
            iconBg="#FEE2E2"
            iconColor={C.danger}
            title={t('profile.condition.hypertension')}
            subtitle={t('profile.condition.hypertension.sub')}
            onPress={comingSoon}
          />
        </Animated.View>

        <Animated.View
          style={[
            settingsStyle,
            {
              backgroundColor: C.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              padding: 16,
              marginBottom: 16,
              shadowColor: C.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 18,
              elevation: 2,
            },
          ]}
        >
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="options" size={18} color={C.primary} />
            <Text className="text-base font-bold" style={{ color: C.text }}>
              {t('profile.section.settings')}
            </Text>
          </View>
          <SettingsRow
            icon="globe-outline"
            label={t('profile.settings.language')}
            value={t('profile.settings.languageValue')}
            onPress={goSettings}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label={t('profile.settings.security')}
            onPress={comingSoon}
          />
          <SettingsRow
            icon="help-circle-outline"
            label={t('profile.settings.help')}
            onPress={comingSoon}
          />
          <SettingsRow
            icon="notifications-outline"
            label={t('profile.settings.notifications')}
            onPress={goSettings}
          />
          <SettingsRow
            icon="server-outline"
            label={t('profile.settings.data')}
            onPress={comingSoon}
          />
          <SettingsRow
            icon="information-circle-outline"
            label={t('profile.settings.about')}
            onPress={comingSoon}
            isLast
          />
        </Animated.View>

        <Animated.View style={logoutStyle}>
          <LogoutButton onPress={onLogout} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
