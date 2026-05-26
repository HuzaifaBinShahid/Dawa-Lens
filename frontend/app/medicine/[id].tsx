import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useMedicine } from '@/hooks/useMedicine';
import { Api } from '@/services/api';
import { useT } from '@/contexts/AppSettingsContext';
import type { Medicine } from '@/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type TabKey = 'overview' | 'health' | 'side' | 'products';

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
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.12)',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  shadowColor: '#1F2937',
};

function MedicineBoxIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="boxFront" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F1F5F9" />
          <Stop offset="1" stopColor="#CBD5E1" />
        </LinearGradient>
        <LinearGradient id="boxSide" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5EEAD4" />
          <Stop offset="1" stopColor="#0F766E" />
        </LinearGradient>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F8FAFC" />
          <Stop offset="1" stopColor="#E2E8F0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="280" height="200" fill="url(#bgGrad)" />
      <Rect x="60" y="30" width="120" height="150" rx="3" fill="url(#boxFront)" stroke="#94A3B8" strokeWidth="1" />
      <Rect x="180" y="36" width="40" height="138" rx="2" fill="url(#boxSide)" stroke="#0F766E" strokeWidth="0.8" />
      <Rect x="78" y="50" width="80" height="6" rx="1" fill="#0F766E" opacity="0.65" />
      <Rect x="78" y="62" width="58" height="4" rx="1" fill="#94A3B8" opacity="0.5" />
      <Rect x="78" y="78" width="44" height="3" rx="1" fill="#64748B" opacity="0.4" />
      <Rect x="78" y="86" width="60" height="3" rx="1" fill="#64748B" opacity="0.4" />
      <Rect x="78" y="100" width="80" height="40" rx="2" fill="#FFFFFF" />
      <Rect x="84" y="108" width="20" height="20" rx="2" fill="#5EEAD4" opacity="0.5" />
      <Rect x="78" y="150" width="60" height="3" rx="1" fill="#64748B" opacity="0.35" />
      <Rect x="78" y="158" width="40" height="3" rx="1" fill="#64748B" opacity="0.35" />
      <Circle cx="200" cy="60" r="6" fill="#FFFFFF" opacity="0.6" />
      <Rect x="190" y="100" width="20" height="2" fill="#FFFFFF" opacity="0.5" />
      <Rect x="190" y="108" width="14" height="2" fill="#FFFFFF" opacity="0.4" />
    </Svg>
  );
}

function VerifiedBadge() {
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
      style={{ backgroundColor: C.successBg }}
    >
      <Ionicons name="checkmark-circle" size={14} color={C.success} />
      <Text className="text-[11px] font-semibold" style={{ color: C.success }}>
        Verified
      </Text>
    </View>
  );
}

function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  delay = 0,
  children,
}: {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedEntry(delay, 'fadeSlideUp');
  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: C.card,
          borderColor: C.border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          shadowColor: C.shadowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.04,
          shadowRadius: 18,
          elevation: 2,
        },
      ]}
    >
      <View className="mb-3 flex-row items-center gap-3">
        <View
          style={{ backgroundColor: iconBg }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text className="text-base font-bold" style={{ color: C.text }}>
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
}

function BulletRow({ text, dotColor = C.success }: { text: string; dotColor?: string }) {
  return (
    <View className="mb-2.5 flex-row items-start">
      <View
        className="mr-2.5 mt-1.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <Text className="flex-1 text-sm leading-6" style={{ color: C.textMuted }}>
        {text}
      </Text>
    </View>
  );
}

const flattenSideEffects = (list: string[]): string[] => {
  const out: string[] = [];
  for (const entry of list) {
    for (const part of (entry || '').split(',')) {
      const token = part.trim().replace(/\.$/, '');
      if (token) out.push(token);
    }
  }
  return out;
};

function SideEffectChip({ label }: { label: string }) {
  return (
    <View
      className="mb-2 mr-2 rounded-xl px-3 py-2"
      style={{ backgroundColor: '#FEE2E2' }}
    >
      <Text className="text-xs font-semibold leading-4" style={{ color: '#B91C1C' }}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View
      className="items-center justify-center rounded-2xl py-10"
      style={{ backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }}
    >
      <Ionicons name="document-outline" size={36} color={C.textFaint} />
      <Text className="mt-3 max-w-[220px] text-center text-sm" style={{ color: C.textSubtle }}>
        {label}
      </Text>
    </View>
  );
}

function TabBar({
  active,
  onChange,
  tabs,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  tabs: { key: TabKey; label: string }[];
}) {
  return (
    <View
      className="mb-4 flex-row gap-2 rounded-full p-1.5"
      style={{
        backgroundColor: C.card,
        borderColor: C.border,
        borderWidth: 1,
        shadowColor: C.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 1,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="flex-1 items-center justify-center rounded-full py-2"
            style={{
              backgroundColor: isActive ? C.primaryFab : 'transparent',
            }}
          >
            <Text
              className="text-xs font-semibold"
              numberOfLines={1}
              style={{ color: isActive ? '#FFFFFF' : C.textMuted }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MedicineDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    alternates?: string;
    primary?: string;
  }>();
  const t = useT();
  const [isSaved, setIsSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const headerStyle = useAnimatedEntry(60, 'fadeSlideUp');
  const heroStyle = useAnimatedEntry(120, 'fadeSlideUp');
  const tabsStyle = useAnimatedEntry(200, 'fadeSlideUp');

  const initialMatchIds = useMemo(() => {
    const altParam = typeof params.alternates === 'string' ? params.alternates : '';
    const alts = altParam ? altParam.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const baseId = typeof params.id === 'string' ? params.id : '';
    return [baseId, ...alts].filter(Boolean);
  }, []);
  const [matchIds] = useState<string[]>(initialMatchIds);
  const [matchIndex, setMatchIndex] = useState(0);
  const currentId = matchIds[matchIndex] || params.id;
  const { data, loading, error, refetch } = useMedicine(currentId);

  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [currentId]);

  const cleanImage = typeof data?.dvago_image === 'string' ? data.dvago_image.trim() : '';
  const showImage = cleanImage.length > 0 && !imageFailed;

  const initialPrimary =
    typeof params.primary === 'string' ? params.primary.trim() : '';
  const primaryName = useMemo(() => {
    if (matchIndex === 0 && initialPrimary) return initialPrimary;
    const firstBrand = data?.products?.find(
      (p) => typeof p.brand === 'string' && p.brand.trim().length > 0
    )?.brand;
    return firstBrand?.trim() || data?.drug_name || '';
  }, [matchIndex, initialPrimary, data]);

  const manufacturer = useMemo(() => {
    const m = data?.products?.find((p) => p.manufacturer)?.manufacturer;
    return m || '';
  }, [data]);

  const strength = useMemo(() => {
    return data?.content?.split(',')[0]?.trim() || '';
  }, [data]);

  const formLabel = useMemo(() => {
    const f = data?.forms?.[0] || '';
    return f ? f.charAt(0).toUpperCase() + f.slice(1) : '';
  }, [data]);

  const subline = useMemo(() => {
    const parts = [data?.category, manufacturer, strength].filter(
      (p) => !!p && (p as string).length > 0
    );
    return parts.join(' • ');
  }, [data, manufacturer, strength]);

  const [similar, setSimilar] = useState<Medicine[]>([]);
  const [sameSalt, setSameSalt] = useState<Medicine[]>([]);
  useEffect(() => {
    if (!data?.drug_name) return;
    let cancelled = false;
    Api.searchMedicines(data.drug_name, 12)
      .then((r) => {
        if (cancelled) return;
        const all: Medicine[] = [];
        if (r.best) all.push(r.best);
        for (const m of r.alternates || []) {
          if (!all.find((x) => x._id === m._id)) all.push(m);
        }
        setSameSalt(all);
        setSimilar(all.filter((m) => m._id !== currentId).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [data?.drug_name, currentId]);

  const saltProducts = useMemo(() => {
    const source = sameSalt.length > 0 ? sameSalt : data ? [data] : [];
    const seen = new Set<string>();
    const out: {
      brand: string;
      manufacturer: string;
      variants: { form: string; size: string; mrp: string | null }[];
      medId: string;
    }[] = [];
    for (const med of source) {
      for (const p of med.products || []) {
        const key = (p.brand || '').toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({
          brand: p.brand,
          manufacturer: p.manufacturer,
          variants: (p.variants || []).map((v) => ({
            form: v.form,
            size: v.size,
            mrp: v.mrp,
          })),
          medId: med._id,
        });
      }
    }
    return out;
  }, [sameSalt, data]);

  useEffect(() => {
    if (!currentId) return;
    let cancelled = false;
    setIsSaved(false);
    Api.getSaved()
      .then((items) => {
        if (cancelled) return;
        const match = items.some((s) => {
          const med = s.medicineId;
          const mid = typeof med === 'object' && med ? (med as any)._id : med;
          return mid === currentId;
        });
        setIsSaved(match);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  const toggleSave = async () => {
    if (!currentId || saveBusy) return;
    setSaveBusy(true);
    const next = !isSaved;
    setIsSaved(next);
    try {
      if (next) await Api.saveMedicine(currentId);
      else await Api.unsaveMedicine(currentId);
    } catch {
      setIsSaved(!next);
    } finally {
      setSaveBusy(false);
    }
  };

  const goAddToTracker = () => {
    if (!currentId) return;
    router.push({
      pathname: '/tracker/setup',
      params: { medicineId: currentId, primary: primaryName },
    } as any);
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={C.primary} />
          <Text className="mt-3 text-sm" style={{ color: C.textSubtle }}>
            {t('medicine.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-lg font-bold" style={{ color: C.text }}>
            {t('medicine.error.title')}
          </Text>
          <Text className="text-center text-sm" style={{ color: C.textSubtle }}>
            {error || t('medicine.error.body')}
          </Text>
          <Pressable
            onPress={refetch}
            className="mt-3 rounded-full px-6 py-3"
            style={{ backgroundColor: C.primaryFab }}
          >
            <Text className="font-semibold text-white">{t('medicine.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: t('medicine.tab.overview2') },
    { key: 'health', label: t('medicine.tab.health') },
    { key: 'side', label: t('medicine.tab.sideEffects') },
    { key: 'products', label: t('medicine.tab.products2') },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: C.bg, flex: 1 }}>
      <StatusBar style="dark" />

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
          {t('scanner.result.title')}
        </Text>
        <Pressable
          onPress={toggleSave}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: C.card }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={C.primary}
          />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 16, paddingTop: 12 }}
      >
        {matchIds.length > 1 && (
          <Pressable
            onPress={() => setMatchIndex((idx) => (idx + 1) % matchIds.length)}
            className="mb-3 flex-row items-center justify-between rounded-full px-4 py-2.5"
            style={{ backgroundColor: C.primaryBg }}
          >
            <Text className="text-[11px] font-bold tracking-widest" style={{ color: C.primary }}>
              SCAN MATCH {String(matchIndex + 1).padStart(2, '0')}/
              {String(matchIds.length).padStart(2, '0')}
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-bold" style={{ color: C.primary }}>
                Next
              </Text>
              <Ionicons name="arrow-forward" size={12} color={C.primary} />
            </View>
          </Pressable>
        )}

        <Animated.View
          style={[
            heroStyle,
            {
              backgroundColor: C.card,
              borderRadius: 24,
              borderColor: C.border,
              borderWidth: 1,
              overflow: 'hidden',
              marginBottom: 16,
              shadowColor: C.shadowColor,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.06,
              shadowRadius: 24,
              elevation: 4,
            },
          ]}
        >
          <View style={{ height: 220, width: '100%', backgroundColor: '#FFFFFF' }}>
            {showImage ? (
              <Image
                source={{ uri: cleanImage }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <MedicineBoxIllustration />
            )}
          </View>
          <View className="px-5 pb-5 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-2xl font-bold" style={{ color: C.text }} numberOfLines={1}>
                  {primaryName || data.drug_name}
                </Text>
                {subline.length > 0 && (
                  <Text className="mt-1 text-sm" style={{ color: C.textSubtle }} numberOfLines={2}>
                    {subline}
                  </Text>
                )}
                {!!formLabel && (
                  <Text className="mt-0.5 text-sm" style={{ color: C.textSubtle }}>
                    {formLabel}
                  </Text>
                )}
              </View>
              <View className="pt-1">
                <VerifiedBadge />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={tabsStyle}>
          <TabBar active={activeTab} onChange={setActiveTab} tabs={tabs} />
        </Animated.View>

        {activeTab === 'overview' && (
          <Animated.View entering={FadeIn.duration(220)}>
            <SectionCard
              icon="flask"
              iconBg={C.primaryBg}
              iconColor={C.primary}
              title="Active Ingredients"
              delay={0}
            >
              <Text className="text-base font-bold" style={{ color: C.text }}>
                {data.drug_name}
              </Text>
              {!!data.content && (
                <Text className="mt-2 text-sm leading-5" style={{ color: C.textMuted }}>
                  {data.content}
                </Text>
              )}
            </SectionCard>

            {data.indications.length > 0 ? (
              <SectionCard
                icon="checkmark-circle"
                iconBg="#DCFCE7"
                iconColor={C.success}
                title="Common Uses"
                delay={80}
              >
                {data.indications.slice(0, 6).map((u, i) => (
                  <BulletRow key={i} text={u} />
                ))}
              </SectionCard>
            ) : null}

            {similar.length > 0 && (
              <SectionCard
                icon="cube"
                iconBg="#EDE9FE"
                iconColor="#7C3AED"
                title="Similar Medicines"
                delay={160}
              >
                {similar.map((m) => (
                  <Pressable
                    key={m._id}
                    onPress={() => router.push(`/medicine/${m._id}` as any)}
                    className="flex-row items-center gap-3 border-b py-2.5"
                    style={{ borderBottomColor: C.divider }}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: C.primaryBg }}
                    >
                      <Ionicons name="medkit-outline" size={18} color={C.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: C.text }}
                        numberOfLines={1}
                      >
                        {m.products?.[0]?.brand || m.drug_name}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: C.textSubtle }}
                        numberOfLines={1}
                      >
                        {m.drug_name} {m.content ? ` ${m.content}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
                  </Pressable>
                ))}
              </SectionCard>
            )}
          </Animated.View>
        )}

        {activeTab === 'health' && (
          <Animated.View entering={FadeIn.duration(220)}>
            {(data.contraindications.length > 0 || data.precautions.length > 0) ? (
              <SectionCard
                icon="warning"
                iconBg={C.warningBg}
                iconColor={C.warning}
                title="Health Alerts"
                delay={0}
              >
                {[...data.contraindications, ...data.precautions]
                  .slice(0, 6)
                  .map((u, i) => (
                    <BulletRow key={i} text={u} dotColor={C.warning} />
                  ))}
              </SectionCard>
            ) : null}

            {data.interactions.length > 0 ? (
              <SectionCard
                icon="swap-horizontal"
                iconBg="#FEE2E2"
                iconColor={C.danger}
                title="Drug Interactions"
                delay={80}
              >
                {data.interactions.slice(0, 6).map((u, i) => (
                  <BulletRow key={i} text={u} dotColor={C.danger} />
                ))}
              </SectionCard>
            ) : null}

            {data.contraindications.length === 0 &&
              data.precautions.length === 0 &&
              data.interactions.length === 0 && (
                <EmptyState label={t('medicine.empty.section')} />
              )}
          </Animated.View>
        )}

        {activeTab === 'side' && (
          <Animated.View entering={FadeIn.duration(220)}>
            {data.side_effects.length > 0 ? (
              <SectionCard
                icon="alert-circle"
                iconBg={C.dangerBg}
                iconColor={C.danger}
                title="Side Effects"
                delay={0}
              >
                <View className="flex-row flex-wrap">
                  {flattenSideEffects(data.side_effects)
                    .slice(0, 30)
                    .map((s, i) => (
                      <SideEffectChip key={i} label={s} />
                    ))}
                </View>
              </SectionCard>
            ) : (
              <EmptyState label={t('medicine.empty.section')} />
            )}
          </Animated.View>
        )}

        {activeTab === 'products' && (
          <Animated.View entering={FadeIn.duration(220)}>
            {saltProducts.length > 0 ? (
              <SectionCard
                icon="cube"
                iconBg="#EDE9FE"
                iconColor="#7C3AED"
                title="Available Products"
                delay={0}
              >
                {saltProducts.slice(0, 20).map((p, i) => (
                  <Pressable
                    key={`${p.brand}-${i}`}
                    onPress={() => {
                      if (p.medId && p.medId !== currentId) {
                        router.push(`/medicine/${p.medId}` as any);
                      }
                    }}
                    className="border-b py-3"
                    style={{ borderBottomColor: C.divider }}
                  >
                    <Text className="text-sm font-bold" style={{ color: C.text }}>
                      {p.brand}
                    </Text>
                    {!!p.manufacturer && (
                      <Text className="text-xs" style={{ color: C.textSubtle }}>
                        {p.manufacturer}
                      </Text>
                    )}
                    {p.variants.length > 0 && (
                      <View className="mt-1.5 flex-row flex-wrap">
                        {p.variants.slice(0, 4).map((v, vi) => (
                          <View
                            key={vi}
                            className="mr-2 mb-1 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: C.primaryBg }}
                          >
                            <Text
                              className="text-[10px] font-semibold"
                              style={{ color: C.primary }}
                            >
                              {v.form}
                              {v.size ? ` · ${v.size}` : ''}
                              {v.mrp ? ` · ${v.mrp}` : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                ))}
              </SectionCard>
            ) : (
              <EmptyState label={t('medicine.empty.section')} />
            )}
          </Animated.View>
        )}

        <View className="mt-4 gap-3">
          <Pressable
            onPress={() =>
              Api.logHistory({ type: 'scan', medicineId: currentId }).catch(() => {})
            }
            className="h-14 flex-row items-center justify-center gap-2 rounded-full"
            style={{
              borderWidth: 1.5,
              borderColor: C.primaryFab,
              backgroundColor: C.card,
            }}
          >
            <Ionicons name="time-outline" size={18} color={C.primaryFab} />
            <Text className="text-sm font-semibold" style={{ color: C.primaryFab }}>
              {t('scanner.result.addToHistory')}
            </Text>
          </Pressable>
          <Pressable
            onPress={goAddToTracker}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full"
            style={{
              backgroundColor: C.primaryFab,
              shadowColor: C.primaryFab,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold text-white">
              {t('scanner.result.addToTracker')}
            </Text>
          </Pressable>
        </View>

        <Text
          className="mt-4 px-3 text-center text-[11px] leading-4"
          style={{ color: C.textFaint }}
        >
          {t('scanner.result.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
