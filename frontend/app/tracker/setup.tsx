import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useT } from '@/contexts/AppSettingsContext';
import { useMedicine } from '@/hooks/useMedicine';
import { Api } from '@/services/api';
import TimeOfDayToggles from '@/components/tracker/TimeOfDayToggles';
import ColorTagPicker from '@/components/tracker/ColorTagPicker';
import DaysOfWeekPicker from '@/components/tracker/DaysOfWeekPicker';
import TimePickerModal from '@/components/tracker/TimePickerModal';
import TabletBlister from '@/components/svgs/MedicineIcons/TabletBlister';
import {
  TAG_COLORS,
  TIME_LABEL_DEFAULTS,
  formatTime,
  type TimeLabel,
} from '@/types/tracker';

const C = {
  bg: '#F0F7FF',
  card: '#FFFFFF',
  inputBg: '#FFFFFF',
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
  dangerBg: 'rgba(220, 38, 38, 0.10)',
  shadowColor: '#1F2937',
};

function SectionLabel({
  text,
  required,
  requiredLabel,
}: {
  text: string;
  required?: boolean;
  requiredLabel?: string;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm font-semibold" style={{ color: C.text }}>
        {text}
      </Text>
      {required && (
        <Text className="text-xs font-semibold" style={{ color: C.danger }}>
          {requiredLabel}
        </Text>
      )}
    </View>
  );
}

function FrequencyDropdown({
  value,
  onChange,
}: {
  value: 'daily' | 'weekly';
  onChange: (v: 'daily' | 'weekly') => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const options: { key: 'daily' | 'weekly'; label: string }[] = [
    { key: 'daily', label: t('setup.frequency.daily') },
    { key: 'weekly', label: t('setup.frequency.weekly') },
  ];
  const currentLabel = options.find((o) => o.key === value)?.label ?? '';

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between rounded-2xl px-4"
        style={{
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
          paddingVertical: 14,
        }}
      >
        <Text className="text-base font-semibold" style={{ color: C.text }}>
          {currentLabel}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={C.textSubtle}
        />
      </Pressable>
      {open && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(120)}
          className="mt-2 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            shadowColor: C.shadowColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {options.map((opt, i) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className="flex-row items-center justify-between px-4 py-3"
              style={
                i > 0
                  ? { borderTopWidth: 1, borderTopColor: C.divider }
                  : undefined
              }
            >
              <Text
                className="text-base"
                style={{
                  color: value === opt.key ? C.primaryFab : C.text,
                  fontWeight: value === opt.key ? '700' : '500',
                }}
              >
                {opt.label}
              </Text>
              {value === opt.key && (
                <Ionicons name="checkmark" size={18} color={C.primaryFab} />
              )}
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

export default function SetupScreen() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ medicineId: string; primary?: string }>();
  const { data, loading } = useMedicine(params.medicineId);

  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('Tablet');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [times, setTimes] = useState<TimeLabel[]>(['morning']);
  const [timeMap, setTimeMap] = useState<Record<TimeLabel, { hour: number; minute: number }>>({
    morning: TIME_LABEL_DEFAULTS.morning,
    afternoon: TIME_LABEL_DEFAULTS.afternoon,
    evening: TIME_LABEL_DEFAULTS.evening,
    night: TIME_LABEL_DEFAULTS.night,
  });
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editingTime, setEditingTime] = useState<TimeLabel | null>(null);
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [busy, setBusy] = useState(false);

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const heroStyle = useAnimatedEntry(120, 'fadeSlideUp');
  const dosageStyle = useAnimatedEntry(180, 'fadeSlideUp');
  const frequencyStyle = useAnimatedEntry(240, 'fadeSlideUp');
  const daysStyle = useAnimatedEntry(280, 'fadeSlideUp');
  const timeStyle = useAnimatedEntry(320, 'fadeSlideUp');
  const editTimesStyle = useAnimatedEntry(360, 'fadeSlideUp');
  const colorStyle = useAnimatedEntry(420, 'fadeSlideUp');
  const ctaStyle = useAnimatedEntry(480, 'fadeSlideUp');

  const displayName = useMemo(() => {
    return (
      (typeof params.primary === 'string' ? params.primary.trim() : '') ||
      data?.products?.[0]?.brand ||
      data?.drug_name ||
      ''
    );
  }, [params.primary, data]);

  useEffect(() => {
    if (data?.forms?.[0]) {
      const f = data.forms[0];
      setUnit(f.charAt(0).toUpperCase() + f.slice(1));
    }
  }, [data]);

  const toggleTime = (label: TimeLabel) => {
    setTimes((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const onConfirmTime = (label: TimeLabel, hour: number, minute: number) => {
    setTimeMap((prev) => ({ ...prev, [label]: { hour, minute } }));
    setEditingTime(null);
  };

  const onSave = async () => {
    if (!params.medicineId) return;
    if (times.length === 0) {
      Alert.alert('Required', 'Please pick at least one time of day.');
      return;
    }
    if (frequency === 'weekly' && daysOfWeek.length === 0) {
      Alert.alert('Required', 'Please pick at least one day of the week.');
      return;
    }
    const amount = parseFloat(dosage);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Required', 'Please enter a valid dosage amount.');
      return;
    }
    setBusy(true);
    try {
      const timesOfDay = times.map((label) => ({
        label,
        hour: timeMap[label].hour,
        minute: timeMap[label].minute,
      }));
      const tracker = await Api.tracker.create({
        medicineId: params.medicineId,
        medicineName: displayName,
        dosage: { amount, unit },
        frequency:
          frequency === 'weekly'
            ? { type: 'weekly', daysOfWeek }
            : { type: 'daily' },
        timesOfDay,
        tagColor: color,
      });
      try {
        const { scheduleForTracker } = require('@/services/notifications');
        await scheduleForTracker(tracker);
      } catch {}
      router.replace('/(tabs)/tracker');
    } catch (err: any) {
      Alert.alert('Save failed', err.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
      <Animated.View
        style={headerStyle}
        className="flex-row items-center justify-between px-4 pb-2 pt-1"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: C.card }}
        >
          <Ionicons name="chevron-back" size={22} color={C.primary} />
        </Pressable>
        <Text className="text-lg font-bold" style={{ color: C.primary }}>
          {t('setup.title')}
        </Text>
        <View className="w-10" />
      </Animated.View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={C.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              heroStyle,
              {
                backgroundColor: C.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.border,
                padding: 16,
                marginBottom: 20,
                shadowColor: C.shadowColor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.04,
                shadowRadius: 16,
                elevation: 2,
              },
            ]}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: C.primaryBg }}
              >
                <TabletBlister width={32} height={32} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg font-bold"
                  style={{ color: C.text }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {!!data?.drug_name && (
                  <Text className="mt-0.5 text-sm" style={{ color: C.textSubtle }} numberOfLines={1}>
                    {data.drug_name}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              dosageStyle,
              {
                backgroundColor: C.card,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: C.border,
                paddingHorizontal: 20,
                paddingVertical: 24,
                marginBottom: 24,
                shadowColor: C.shadowColor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.04,
                shadowRadius: 16,
                elevation: 2,
              },
            ]}
          >
            <View>
              <SectionLabel text={t('setup.dosage.label')} />
              <View
                className="flex-row items-center gap-2 rounded-2xl px-4"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1,
                  borderColor: C.divider,
                  paddingVertical: 6,
                }}
              >
                <TextInput
                  value={dosage}
                  onChangeText={setDosage}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={C.textFaint}
                  style={{
                    color: C.text,
                    fontSize: 16,
                    fontWeight: '600',
                    width: 44,
                    paddingVertical: 10,
                  }}
                />
                <View className="h-6 w-px" style={{ backgroundColor: C.divider }} />
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Tablet"
                  placeholderTextColor={C.textFaint}
                  className="flex-1"
                  style={{
                    color: C.text,
                    fontSize: 16,
                    paddingVertical: 10,
                  }}
                />
                <Ionicons name="pencil" size={18} color={C.textFaint} />
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <SectionLabel text={t('setup.frequency.label')} />
              <FrequencyDropdown value={frequency} onChange={setFrequency} />
            </View>

            {frequency === 'weekly' && (
              <View style={{ marginTop: 24 }}>
                <SectionLabel
                  text="Days of Week"
                  required
                  requiredLabel={t('common.required')}
                />
                <DaysOfWeekPicker values={daysOfWeek} onToggle={toggleDay} />
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: C.divider,
                marginVertical: 24,
              }}
            />

            <View>
              <SectionLabel
                text={t('setup.timeOfDay.label')}
                required
                requiredLabel={t('common.required')}
              />
              <TimeOfDayToggles values={times} onToggle={toggleTime} />
            </View>

            {times.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <SectionLabel text="Reminder Times" />
                <View
                  className="overflow-hidden rounded-2xl"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: C.divider,
                  }}
                >
                  {times.map((label, idx) => (
                    <Pressable
                      key={label}
                      onPress={() => setEditingTime(label)}
                      className="flex-row items-center justify-between px-4 py-3.5"
                      style={
                        idx > 0
                          ? { borderTopWidth: 1, borderTopColor: C.divider }
                          : undefined
                      }
                    >
                      <View className="flex-row items-center gap-3">
                        <Ionicons
                          name={
                            label === 'morning'
                              ? 'sunny'
                              : label === 'afternoon'
                              ? 'partly-sunny'
                              : 'moon'
                          }
                          size={16}
                          color={
                            label === 'morning'
                              ? '#F59E0B'
                              : label === 'afternoon'
                              ? '#F97316'
                              : label === 'evening'
                              ? '#6366F1'
                              : '#7C3AED'
                          }
                        />
                        <Text
                          className="text-sm font-semibold capitalize"
                          style={{ color: C.text }}
                        >
                          {t(`tracker.section.${label}`)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-base font-bold"
                          style={{ color: C.primaryFab }}
                        >
                          {formatTime(timeMap[label].hour, timeMap[label].minute)}
                        </Text>
                        <Ionicons name="time-outline" size={16} color={C.textFaint} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: C.divider,
                marginVertical: 24,
              }}
            />

            <View>
              <SectionLabel text={t('setup.tagColor.label')} />
              <ColorTagPicker value={color} onChange={setColor} />
            </View>
          </Animated.View>

          <Animated.View style={ctaStyle}>
            <Pressable
              onPress={onSave}
              disabled={busy}
              className="h-14 flex-row items-center justify-center gap-2 rounded-full"
              style={{
                backgroundColor: C.primaryFab,
                opacity: busy ? 0.7 : 1,
                shadowColor: C.primaryFab,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="bookmark" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">
                    {t('setup.save')}
                  </Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      )}

      <TimePickerModal
        visible={editingTime !== null}
        title={
          editingTime
            ? `${t(`tracker.section.${editingTime}`)} Time`
            : 'Pick time'
        }
        initialHour={editingTime ? timeMap[editingTime].hour : 8}
        initialMinute={editingTime ? timeMap[editingTime].minute : 0}
        onCancel={() => setEditingTime(null)}
        onConfirm={(h, m) => {
          if (editingTime) onConfirmTime(editingTime, h, m);
        }}
      />
    </SafeAreaView>
  );
}
