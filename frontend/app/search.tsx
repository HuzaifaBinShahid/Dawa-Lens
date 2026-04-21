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
import { RecentSearches, RecentSearch } from '@/services/recentSearches';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const MAX_BRAND_TAGS = 3;
const MAX_RELATED_BRANDS = 5;

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

const getBrandTags = (m: Medicine) =>
  dedupedBrandNames(m).slice(0, MAX_BRAND_TAGS);

type MatchMode =
  | { kind: 'brand'; matched: string; related: string[] }
  | { kind: 'salt'; brands: string[] };

const resolveMatch = (m: Medicine, query: string): MatchMode => {
  const q = query.toLowerCase().trim();
  const salt = (m.drug_name || '').toLowerCase();
  const allBrands = dedupedBrandNames(m);

  const saltMatches =
    !!q && (salt === q || salt.startsWith(q) || salt.includes(q));

  if (q) {
    const exact = allBrands.find((b) => b.toLowerCase() === q);
    const prefix = !exact
      ? allBrands.find((b) => b.toLowerCase().startsWith(q))
      : undefined;
    const contains = !exact && !prefix
      ? allBrands.find((b) => b.toLowerCase().includes(q))
      : undefined;
    const matched = exact || prefix || contains;

    if (matched && !(saltMatches && salt.startsWith(q))) {
      const related = allBrands
        .filter((b) => b.toLowerCase() !== matched.toLowerCase())
        .slice(0, MAX_RELATED_BRANDS);
      return { kind: 'brand', matched, related };
    }
  }

  return { kind: 'salt', brands: allBrands.slice(0, MAX_BRAND_TAGS) };
};

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
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
    Keyboard.dismiss();
    router.push(`/medicine/${m._id}`);
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>MODULE — 02</Text>
          <Text style={styles.title}>Search</Text>
        </View>
        <View style={styles.accentDot} />
      </Animated.View>

      <Animated.View style={[styles.inputCard, inputCardStyle]}>
        <Ionicons name="search" size={18} color={Colors.text} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder="Salt or brand — e.g. Paracetamol"
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
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
              <View style={styles.rule} />
              <Text style={styles.sectionLabel}>PREVIOUS SEARCHES</Text>
              {recents.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearRecents}
                  hitSlop={8}
                  style={styles.clearAllBtn}
                >
                  <Text style={styles.clearAllText}>Clear</Text>
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
                      style={styles.recentRow}
                      onPress={() => setQuery(r.query)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={Colors.textMuted}
                      />
                      <Text style={styles.recentText} numberOfLines={1}>
                        {r.query}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveRecent(r.query)}
                        hitSlop={10}
                        style={styles.recentDismiss}
                      >
                        <Ionicons
                          name="close"
                          size={14}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyRecents}>
                <Text style={styles.emptyRecentsTitle}>
                  Your searches will appear here
                </Text>
                <Text style={styles.emptyRecentsBody}>
                  Once you look up a medicine, we'll keep the last few handy
                  so you can jump back in with one tap.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {!showEmptyState && loading && (
          <View style={styles.state}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.stateText}>Looking up “{trimmed}”…</Text>
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
            <Text style={styles.noResultsTitle}>No matching medicine</Text>
            <Text style={styles.noResultsBody}>
              We couldn't find a salt or brand matching “{trimmed}”. Check the
              spelling, or try the scanner — it reads directly from packaging.
            </Text>
            <TouchableOpacity
              style={styles.scanFallback}
              onPress={() => router.replace('/scan')}
              activeOpacity={0.85}
            >
              <Ionicons name="scan" size={16} color={Colors.white} />
              <Text style={styles.scanFallbackText}>Open scanner</Text>
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
                {results.length} MATCH{results.length === 1 ? '' : 'ES'}
              </Text>
            )}

            {hasSimilarOnly && (
              <View style={styles.similarHeader}>
                <Text style={styles.noMatchInline}>
                  No exact match for “{trimmed}”
                </Text>
                <Text style={styles.similarLabel}>SIMILAR SALTS</Text>
              </View>
            )}

            {(hasDirect ? results : similar).map((m, i) => {
              const match = resolveMatch(m, trimmed);
              const isBrand = match.kind === 'brand';
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
                      isBrand && styles.resultCardBrand,
                    ]}
                    onPress={() => handleSelect(m)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.resultIcon,
                        isBrand && styles.resultIconBrand,
                      ]}
                    >
                      <Ionicons
                        name={isBrand ? 'medkit' : 'flask-outline'}
                        size={20}
                        color={isBrand ? Colors.warning : Colors.primary}
                      />
                    </View>
                    <View style={styles.resultBody}>
                      {m.category && (
                        <Text style={styles.resultCategory} numberOfLines={1}>
                          {m.category.toUpperCase()}
                        </Text>
                      )}
                      {match.kind === 'brand' ? (
                        <>
                          <Text style={styles.resultName} numberOfLines={1}>
                            {match.matched}
                          </Text>
                          <Text style={styles.containsLine} numberOfLines={1}>
                            <Text style={styles.containsLabel}>Contains </Text>
                            <Text style={styles.containsSalt}>
                              {m.drug_name}
                            </Text>
                          </Text>
                          {match.related.length > 0 && (
                            <View style={styles.brandRow}>
                              <Text style={styles.brandLabel}>Also as:</Text>
                              <View style={styles.brandTags}>
                                {match.related.map((b) => (
                                  <View key={b} style={styles.brandTag}>
                                    <Text style={styles.brandTagText}>
                                      {b}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </>
                      ) : (
                        <>
                          <Text style={styles.resultName} numberOfLines={1}>
                            {m.drug_name}
                          </Text>
                          {match.brands.length > 0 ? (
                            <View style={styles.brandRow}>
                              <Text style={styles.brandLabel}>Brands:</Text>
                              <View style={styles.brandTags}>
                                {match.brands.map((b) => (
                                  <View key={b} style={styles.brandTag}>
                                    <Text style={styles.brandTagText}>
                                      {b}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          ) : m.content ? (
                            <Text style={styles.resultMeta} numberOfLines={2}>
                              {m.content}
                            </Text>
                          ) : null}
                        </>
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
    backgroundColor: Colors.white,
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
