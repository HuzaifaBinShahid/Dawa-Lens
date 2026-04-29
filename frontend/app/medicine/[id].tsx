import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useMedicine } from '@/hooks/useMedicine';
import Header from '@/components/common/Header';
import Loader from '@/components/common/Loader';
import CommonButton from '@/components/common/CommonButton';
import MedicineHeader from '@/components/medicine/MedicineHeader';
import SafetyAlert from '@/components/medicine/SafetyAlert';
import SafetyModal from '@/components/medicine/SafetyModal';
import SectionTabs, { TabItem } from '@/components/medicine/SectionTabs';
import InfoSection from '@/components/medicine/InfoSection';
import DosageBlock from '@/components/medicine/DosageBlock';
import ProductsList from '@/components/medicine/ProductsList';
import TrackIntake from '@/components/medicine/TrackIntake';
import { Api } from '@/services/api';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

type SectionKey =
  | 'overview'
  | 'dosage'
  | 'warnings'
  | 'special'
  | 'products';

export default function MedicineDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    alternates?: string;
    primary?: string;
  }>();
  const { t, palette, locale } = useAppSettings();
  const [showUrdu, setShowUrdu] = useState(locale === 'ur');
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const translateStyle = useAnimatedEntry(100, 'fadeSlideUp');

  // Match-rotation state: when arriving from a scan with multiple matches,
  // we keep the full ordered list of ids and let the user cycle without
  // re-navigating.
  const initialMatchIds = useMemo(() => {
    const altParam =
      typeof params.alternates === 'string' ? params.alternates : '';
    const alts = altParam
      ? altParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const baseId = typeof params.id === 'string' ? params.id : '';
    return [baseId, ...alts].filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [matchIds] = useState<string[]>(initialMatchIds);
  const [matchIndex, setMatchIndex] = useState(0);
  const currentId = matchIds[matchIndex] || params.id;
  const { data, loading, error, refetch } = useMedicine(currentId);

  const initialPrimary =
    typeof params.primary === 'string' ? params.primary.trim() : '';
  const primaryName = useMemo(() => {
    // The matched brand only applies to the originally-tapped result.
    // When the user cycles to an alternate via the switcher, fall back to
    // that medicine's first product brand so the headline stays brand-first.
    if (matchIndex === 0 && initialPrimary) return initialPrimary;
    const firstBrand = data?.products?.find(
      (p) => typeof p.brand === 'string' && p.brand.trim().length > 0
    )?.brand;
    return firstBrand?.trim() || '';
  }, [matchIndex, initialPrimary, data]);

  const showMatchSwitcher = matchIds.length > 1;
  const handleNextMatch = () => {
    setMatchIndex((idx) => (idx + 1) % matchIds.length);
    setActiveSection('overview');
    setSafetyModalOpen(false);
  };

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
      if (next) {
        await Api.saveMedicine(currentId);
      } else {
        await Api.unsaveMedicine(currentId);
      }
    } catch {
      setIsSaved(!next);
    } finally {
      setSaveBusy(false);
    }
  };

  const tabs = useMemo<TabItem<SectionKey>[]>(() => {
    if (!data) return [];
    const list: TabItem<SectionKey>[] = [
      { key: 'overview', label: t('medicine.tab.overview') },
    ];
    if (Object.keys(data.dosage || {}).length > 0) {
      list.push({ key: 'dosage', label: t('medicine.tab.dosage') });
    }
    const hasWarnings =
      data.contraindications.length > 0 ||
      data.precautions.length > 0 ||
      data.interactions.length > 0 ||
      data.side_effects.length > 0;
    if (hasWarnings) list.push({ key: 'warnings', label: t('medicine.tab.warnings') });

    const hasSpecial =
      !!data.administration ||
      !!data.pregnancy ||
      !!data.lactation ||
      !!data.stability;
    if (hasSpecial) list.push({ key: 'special', label: t('medicine.tab.special') });

    if (data.products && data.products.length > 0) {
      list.push({ key: 'products', label: t('medicine.tab.products') });
    }
    return list;
  }, [data, t]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Header title={t('medicine.title')} />
        <Loader fullScreen message={t('medicine.loading')} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Header title={t('medicine.title')} />
        <View style={styles.errorBox}>
          <Text style={[styles.errorTitle, { color: palette.text }]}>
            {t('medicine.error.title')}
          </Text>
          <Text style={[styles.errorText, { color: palette.textSecondary }]}>
            {error || t('medicine.error.body')}
          </Text>
          <CommonButton
            title={t('medicine.retry')}
            onPress={refetch}
            style={styles.retryBtn}
          />
        </View>
      </View>
    );
  }

  const isContra = data.contraindications.length > 0;
  const safetySource = isContra ? data.contraindications : data.precautions;
  const showSafetyAlert = safetySource.length > 0;
  const safetyTitle = isContra ? 'Contraindications' : 'Precautions';

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style="dark" />
      <Header
        title={t('medicine.title')}
        rightIcon={isSaved ? 'bookmark' : 'bookmark-outline'}
        onRightPress={toggleSave}
      />

      {showMatchSwitcher && (
        <Animated.View
          key={`switcher-${matchIndex}`}
          entering={FadeIn.duration(220)}
          style={[
            styles.switcher,
            {
              backgroundColor: palette.cardBg,
              borderBottomColor: palette.grayBorder,
            },
          ]}
        >
          <View style={styles.switcherLeft}>
            <View style={styles.switcherBadge}>
              <Text style={styles.switcherBadgeText}>
                {String(matchIndex + 1).padStart(2, '0')}/
                {String(matchIds.length).padStart(2, '0')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.switcherEyebrow}>
                {t('medicine.switcher.eyebrow')}
              </Text>
              <Text
                style={[
                  styles.switcherTitle,
                  { color: palette.text },
                ]}
                numberOfLines={1}
              >
                {primaryName || data.drug_name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.switcherBtn}
            onPress={handleNextMatch}
            activeOpacity={0.85}
          >
            <Text style={styles.switcherBtnText}>
              {t('medicine.switcher.next')}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[2]}
      >
        <Animated.View style={[styles.translateRow, translateStyle]}>
          <TouchableOpacity
            style={styles.translateBtn}
            onPress={() => setShowUrdu(!showUrdu)}
            activeOpacity={0.7}
          >
            <Text style={styles.translateText}>
              {showUrdu ? t('medicine.translate.toEnglish') : t('medicine.translate.toUrdu')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.headerWrap}>
          <MedicineHeader
            drugName={data.drug_name}
            primaryName={primaryName}
            category={data.category}
            content={data.content}
            forms={data.forms}
          />

          {showSafetyAlert && (
            <SafetyAlert
              warnings={safetySource}
              onViewAll={() => setSafetyModalOpen(true)}
            />
          )}
        </View>

        <View style={styles.stickyTabWrap}>
          <SectionTabs
            tabs={tabs}
            active={activeSection}
            onChange={setActiveSection}
          />
        </View>

        <View style={styles.content}>
          {activeSection === 'overview' && (
            <View>
              {data.indications.length > 0 ? (
                <InfoSection
                  title="Uses"
                  items={data.indications}
                  icon="checkmark-circle"
                  iconColor={Colors.primary}
                  delay={0}
                />
              ) : (
                <EmptyBlock
                  icon="information-circle-outline"
                  text="No overview details available for this medicine."
                />
              )}
            </View>
          )}

          {activeSection === 'dosage' && (
            <DosageBlock dosage={data.dosage} delay={0} />
          )}

          {activeSection === 'warnings' && (
            <View>
              {data.contraindications.length > 0 && (
                <InfoSection
                  title="Contraindications"
                  items={data.contraindications}
                  icon="close-circle"
                  iconColor={Colors.danger}
                  delay={0}
                />
              )}
              {data.precautions.length > 0 && (
                <InfoSection
                  title="Precautions"
                  items={data.precautions}
                  icon="shield-checkmark"
                  iconColor={Colors.warning}
                  delay={60}
                />
              )}
              {data.interactions.length > 0 && (
                <InfoSection
                  title="Drug Interactions"
                  items={data.interactions}
                  icon="swap-horizontal"
                  iconColor={Colors.warning}
                  delay={120}
                />
              )}
              {data.side_effects.length > 0 && (
                <InfoSection
                  title="Side Effects"
                  items={data.side_effects}
                  icon="alert-circle"
                  iconColor={Colors.warning}
                  delay={180}
                />
              )}
            </View>
          )}

          {activeSection === 'special' && (
            <View>
              {!!data.administration && (
                <InfoBlock title="Administration" text={data.administration} delay={0} />
              )}
              {!!data.pregnancy && (
                <InfoBlock title="Pregnancy" text={data.pregnancy} delay={60} />
              )}
              {!!data.lactation && (
                <InfoBlock title="Lactation" text={data.lactation} delay={120} />
              )}
              {!!data.stability && (
                <InfoBlock title="Stability" text={data.stability} delay={180} />
              )}
            </View>
          )}

          {activeSection === 'products' && (
            <ProductsList products={data.products} delay={0} />
          )}

          <TrackIntake
            onAddToHistory={() =>
              Alert.alert('Added', `${data.drug_name} added to your history.`)
            }
          />
        </View>
      </ScrollView>

      <SafetyModal
        visible={safetyModalOpen}
        title={safetyTitle}
        items={safetySource}
        onClose={() => setSafetyModalOpen(false)}
      />
    </View>
  );
}

function InfoBlock({
  title,
  text,
  delay,
}: {
  title: string;
  text: string;
  delay: number;
}) {
  const style = useAnimatedEntry(delay, 'fadeSlideUp');
  return (
    <Animated.View style={[styles.infoBlock, style]}>
      <Text style={styles.infoBlockTitle}>{title}</Text>
      <Text style={styles.infoBlockText}>{text}</Text>
    </Animated.View>
  );
}

function EmptyBlock({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.emptyBlock}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xxxl,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
  },
  switcherLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  switcherBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.warning,
    backgroundColor: Colors.warningBg,
    minWidth: 56,
    alignItems: 'center',
  },
  switcherBadgeText: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.warning,
  },
  switcherEyebrow: {
    fontSize: 9,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 2,
    color: Colors.warning,
    marginBottom: 2,
  },
  switcherTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: -0.2,
  },
  switcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
  },
  switcherBtnText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.3,
  },
  translateRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  translateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  translateText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    fontWeight: Theme.fontWeight.medium,
  },
  headerWrap: {
    paddingHorizontal: Theme.spacing.lg,
  },
  stickyTabWrap: {
    backgroundColor: Colors.white,
    paddingTop: Theme.spacing.sm,
    borderBottomWidth: 0,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxl,
  },
  errorTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  errorText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  retryBtn: {
    minWidth: 160,
  },
  infoBlock: {
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  infoBlockTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  infoBlockText: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
  emptyBlock: {
    padding: Theme.spacing.xl,
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
