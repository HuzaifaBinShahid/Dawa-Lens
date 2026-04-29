import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import { Medicine } from '@/types';
import { Api } from '@/services/api';
import { RecentSearches, RecentSearch } from '@/services/recentSearches';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const MAX_RELATED_BRANDS = 3;

const dedupedBrandNames = (m: Medicine): string[] => {
  if (!m.products) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of m.products) {
    const name = (p.brand || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};

type Resolved = {
  primary: string;
  salt: string;
  related: string[];
  matchedByBrand: boolean;
};

const resolveMatch = (m: Medicine, query: string): Resolved => {
  const q = query.toLowerCase().trim();
  const salt = m.drug_name || '';
  const allBrands = dedupedBrandNames(m);

  let primary: string | null = null;
  let matchedByBrand = false;

  if (q && allBrands.length > 0) {
    const exact = allBrands.find((b) => b.toLowerCase() === q);
    const prefix = !exact
      ? allBrands.find((b) => b.toLowerCase().startsWith(q))
      : undefined;
    const contains = !exact && !prefix
      ? allBrands.find((b) => b.toLowerCase().includes(q))
      : undefined;
    const matched = exact || prefix || contains;
    if (matched) {
      primary = matched;
      matchedByBrand = true;
    }
  }

  if (!primary) {
    primary = allBrands[0] || salt;
  }

  const related = allBrands
    .filter((b) => b.toLowerCase() !== (primary || '').toLowerCase())
    .slice(0, MAX_RELATED_BRANDS);

  return { primary, salt, related, matchedByBrand };
};

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { t, palette } = useAppSettings();
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const { results, similar, loading, error } = useMedicineSearch(query);

  const headerStyle = useAnimatedEntry(0, 'fadeSlideUp');
  const inputCardStyle = useAnimatedEntry(100, 'fadeSlideUp');
  const contentStyle = useAnimatedEntry(200, 'fadeSlideUp');

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    setRecents(RecentSearches.load());
    return () => clearTimeout(t);
  }, []);

  const commitQuery = (q: string) => {
    const next = RecentSearches.add(q);
    setRecents(next);
  };

  const handleSelect = (m: Medicine) => {
    commitQuery(query);
    const match = resolveMatch(m, query.trim());
    Api.logHistory({
      type: 'search',
      medicineId: m._id,
      query: query.trim() || null,
      matchedBrand: match.matchedByBrand ? match.primary : null,
    }).catch(() => {});
    Keyboard.dismiss();
    const path = match.primary
      ? `/medicine/${m._id}?primary=${encodeURIComponent(match.primary)}`
      : `/medicine/${m._id}`;
    router.push(path as any);
  };

  const handleSubmit = () => {
    commitQuery(query);
  };

  const handleRemoveRecent = (q: string) => {
    setRecents(RecentSearches.remove(q));
  };

  const handleClearRecents = () => {
    RecentSearches.clear();
    setRecents([]);
  };

  const trimmed = query.trim();
  const showEmptyState = trimmed.length < 2;
  const hasDirect = !loading && !error && results.length > 0;
  const hasSimilarOnly =
    !loading && !error && results.length === 0 && similar.length > 0 && trimmed.length >= 2;
  const hasNothing =
    !loading && !error && results.length === 0 && similar.length === 0 && trimmed.length >= 2;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: palette.background },
      ]}
    >
      <StatusBar style="dark" />

      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={[styles.backBtn, { borderColor: palette.grayBorder }]}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{t('search.module')}</Text>
          <Text style={[styles.title, { color: palette.text }]}>
            {t('search.title')}
          </Text>
        </View>
        <View style={styles.accentDot} />
      </Animated.View>

      <Animated.View
        style={[
          styles.inputCard,
          {
            backgroundColor: palette.white,
            borderColor: palette.text,
          },
          inputCardStyle,
        ]}
      >
        <Ionicons name="search" size={18} color={palette.text} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder={t('search.placeholder')}
          placeholderTextColor={palette.textMuted}
          style={[styles.input, { color: palette.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        {showEmptyState && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInner}
          >
            <View style={styles.sectionHead}>
              <View style={[styles.rule, { backgroundColor: palette.text }]} />
              <Text style={[styles.sectionLabel, { color: palette.text }]}>
                {t('search.previous')}
              </Text>
              {recents.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearRecents}
                  hitSlop={8}
                  style={styles.clearAllBtn}
                >
                  <Text style={styles.clearAllText}>{t('search.clear')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {recents.length > 0 ? (
              <View style={styles.recentList}>
                {recents.map((r, i) => (
                  <Animated.View
                    key={r.query}
                    entering={FadeIn.delay(120 + i * 30).duration(260)}
                    style={styles.recentRowWrap}
                  >
                    <TouchableOpacity
                      style={[
                        styles.recentRow,
                        {
                          backgroundColor: palette.white,
                          borderColor: palette.grayBorder,
                        },
                      ]}
                      onPress={() => setQuery(r.query)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={palette.textMuted}
                      />
                      <Text
                        style={[styles.recentText, { color: palette.text }]}
                        numberOfLines={1}
                      >
                        {r.query}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveRecent(r.query)}
                        hitSlop={10}
                        style={[
                          styles.recentDismiss,
                          { backgroundColor: palette.cardBg },
                        ]}
                      >
                        <Ionicons
                          name="close"
                          size={14}
                          color={palette.textMuted}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyRecents,
                  { borderColor: palette.grayBorder },
                ]}
              >
                <Text
                  style={[styles.emptyRecentsTitle, { color: palette.text }]}
                >
                  {t('search.empty.title')}
                </Text>
                <Text
                  style={[
                    styles.emptyRecentsBody,
                    { color: palette.textSecondary },
                  ]}
                >
                  {t('search.empty.body')}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {!showEmptyState && loading && (
          <View style={styles.state}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={[styles.stateText, { color: palette.textSecondary }]}>
              {t('search.lookup')} "{trimmed}"…
            </Text>
          </View>
        )}

        {!showEmptyState && error && (
          <View style={styles.state}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={Colors.danger}
            />
            <Text style={[styles.stateText, { color: Colors.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {hasNothing && (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={styles.noResults}
          >
            <Text style={[styles.noResultsTitle, { color: palette.text }]}>
              {t('search.noResults.title')}
            </Text>
            <Text style={[styles.noResultsBody, { color: palette.textSecondary }]}>
              {t('search.noResults.body')}
            </Text>
            <TouchableOpacity
              style={styles.scanFallback}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
            >
              <Ionicons name="scan" size={16} color={Colors.white} />
              <Text style={styles.scanFallbackText}>{t('search.openScanner')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {(hasDirect || hasSimilarOnly) && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsInner}
          >
            {hasDirect && (
              <Text style={styles.resultsCount}>
                {results.length}{' '}
                {results.length === 1 ? t('search.match') : t('search.matches')}
              </Text>
            )}

            {hasSimilarOnly && (
              <View style={styles.similarHeader}>
                <Text style={[styles.noMatchInline, { color: palette.text }]}>
                  {t('search.noExact')} "{trimmed}"
                </Text>
                <Text style={styles.similarLabel}>{t('home.similarSalts')}</Text>
              </View>
            )}

            {(hasDirect ? results : similar).map((m, i) => {
              const match = resolveMatch(m, trimmed);
              return (
                <Animated.View
                  key={m._id}
                  entering={FadeIn.delay(i * 25).duration(220)}
                  exiting={FadeOut.duration(140)}
                  style={styles.resultWrap}
                >
                  <TouchableOpacity
                    style={[
                      styles.resultCard,
                      {
                        backgroundColor: palette.white,
                        borderColor: palette.grayBorder,
                      },
                      match.matchedByBrand && styles.resultCardBrand,
                    ]}
                    onPress={() => handleSelect(m)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.resultIcon,
                        { backgroundColor: palette.primaryLight },
                        match.matchedByBrand && styles.resultIconBrand,
                      ]}
                    >
                      <Ionicons
                        name="medkit"
                        size={20}
                        color={
                          match.matchedByBrand
                            ? Colors.warning
                            : Colors.primary
                        }
                      />
                    </View>
                    <View style={styles.resultBody}>
                      {m.category && (
                        <Text style={styles.resultCategory} numberOfLines={1}>
                          {m.category.toUpperCase()}
                        </Text>
                      )}
                      <Text
                        style={[styles.resultName, { color: palette.text }]}
                        numberOfLines={1}
                      >
                        {match.primary}
                      </Text>
                      <Text style={styles.containsLine} numberOfLines={1}>
                        <Text
                          style={[
                            styles.containsLabel,
                            { color: palette.textSecondary },
                          ]}
                        >
                          {t('search.contains')}{' '}
                        </Text>
                        <Text style={styles.containsSalt}>{match.salt}</Text>
                      </Text>
                      {match.related.length > 0 && (
                        <View style={styles.brandRow}>
                          <Text
                            style={[
                              styles.brandLabel,
                              { color: palette.textSecondary },
                            ]}
                          >
                            {t('search.alsoAs')}
                          </Text>
                          <View style={styles.brandTags}>
                            {match.related.map((b) => (
                              <View
                                key={b}
                                style={[
                                  styles.brandTag,
                                  {
                                    backgroundColor: palette.cardBg,
                                    borderColor: palette.grayBorder,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.brandTagText,
                                    { color: palette.text },
                                  ]}
                                >
                                  {b}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={styles.resultChevron}>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 2,
    color: Colors.warning,
    marginBottom: 4,
  },
  title: {
    fontSize: Theme.fontSize.display,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.text,
    lineHeight: 36,
    letterSpacing: -1,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.warning,
    marginBottom: 12,
  },
  inputCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    padding: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  scrollInner: {
    paddingBottom: Theme.spacing.xxxl,
  },
  saltInfo: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  saltInfoMark: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.warning,
    borderRadius: 2,
  },
  saltInfoTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  dotAccent: {
    color: Colors.warning,
  },
  saltInfoBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  rule: {
    width: 24,
    height: 2,
    backgroundColor: Colors.text,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 2,
    color: Colors.text,
    flex: 1,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.warning,
  },
  recentList: {
    marginBottom: Theme.spacing.xxl,
  },
  recentRowWrap: {
    marginBottom: 6,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  recentText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  recentDismiss: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
  },
  emptyRecents: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderStyle: 'dashed',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxl,
  },
  emptyRecentsTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyRecentsBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xxl,
  },
  chip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  chipText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
  },
  state: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xl,
  },
  stateText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  noResults: {
    paddingVertical: Theme.spacing.xxl,
    alignItems: 'flex-start',
  },
  noResultsTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  noResultsBody: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
  },
  scanFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.text,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
  },
  scanFallbackText: {
    color: Colors.white,
    fontWeight: Theme.fontWeight.semibold,
    fontSize: Theme.fontSize.md,
  },
  resultsInner: {
    paddingBottom: Theme.spacing.xxxl,
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: Theme.spacing.md,
  },
  similarHeader: {
    marginBottom: Theme.spacing.md,
  },
  noMatchInline: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  similarLabel: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 2,
    color: Colors.warning,
  },
  resultWrap: {
    marginBottom: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  resultCardBrand: {
    borderColor: Colors.warning,
    borderWidth: 1.5,
    shadowColor: Colors.warning,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconBrand: {
    backgroundColor: Colors.warningBg,
  },
  containsLine: {
    marginTop: -2,
    marginBottom: 6,
  },
  containsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  containsSalt: {
    fontSize: 12,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
  },
  resultBody: {
    flex: 1,
    paddingRight: 4,
  },
  resultCategory: {
    fontSize: 10,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1.5,
    color: Colors.primary,
    marginBottom: 2,
  },
  resultName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  brandLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  brandTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  brandTag: {
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  brandTagText: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  resultMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resultChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
