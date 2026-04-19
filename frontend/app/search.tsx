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
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

const SUGGESTIONS = [
  'Paracetamol',
  'Amoxicillin',
  'Ibuprofen',
  'Omeprazole',
  'Metformin',
  'Cetirizine',
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const { results, loading, error } = useMedicineSearch(query);

  const headerStyle = useAnimatedEntry(0, 'fadeSlideUp');
  const inputCardStyle = useAnimatedEntry(100, 'fadeSlideUp');
  const contentStyle = useAnimatedEntry(200, 'fadeSlideUp');

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (m: Medicine) => {
    Keyboard.dismiss();
    router.push(`/medicine/${m._id}`);
  };

  const trimmed = query.trim();
  const showEmptyState = trimmed.length < 2;
  const noResults = !loading && !error && trimmed.length >= 2 && results.length === 0;

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
          placeholder="Type a medicine name"
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
              <Text style={styles.sectionLabel}>TRY SEARCHING</Text>
            </View>
            <View style={styles.chipWrap}>
              {SUGGESTIONS.map((s, i) => (
                <Animated.View
                  key={s}
                  entering={FadeIn.delay(150 + i * 25).duration(260)}
                >
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => setQuery(s)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={styles.tip}>
              <View style={styles.tipMark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Searching by brand?</Text>
                <Text style={styles.tipBody}>
                  Type the generic name — we match to the most common brand
                  variants automatically.
                </Text>
              </View>
            </View>
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

        {noResults && (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={styles.noResults}
          >
            <Text style={styles.noResultsTitle}>Nothing matched</Text>
            <Text style={styles.noResultsBody}>
              Check the spelling, or try the scanner — it reads directly from
              packaging.
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

        {!showEmptyState && !loading && !error && results.length > 0 && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsInner}
          >
            <Text style={styles.resultsCount}>
              {results.length} MATCH{results.length === 1 ? '' : 'ES'}
            </Text>
            {results.map((m, i) => (
              <Animated.View
                key={m._id}
                entering={FadeIn.delay(i * 25).duration(220)}
                exiting={FadeOut.duration(140)}
                style={styles.resultWrap}
              >
                <TouchableOpacity
                  style={styles.resultCard}
                  onPress={() => handleSelect(m)}
                  activeOpacity={0.85}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons
                      name="medkit"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.resultBody}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {m.drug_name}
                    </Text>
                    {m.category && (
                      <Text style={styles.resultCategory} numberOfLines={1}>
                        {m.category}
                      </Text>
                    )}
                    {m.content && (
                      <Text style={styles.resultMeta} numberOfLines={2}>
                        {m.content}
                      </Text>
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
            ))}
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
  tip: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
  },
  tipMark: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.warning,
    borderRadius: 2,
  },
  tipTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  resultWrap: {
    marginBottom: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    flex: 1,
    paddingRight: 4,
  },
  resultName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    fontWeight: Theme.fontWeight.semibold,
    letterSpacing: 0.6,
    color: Colors.primary,
    marginBottom: 2,
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
  },
});
