import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  delay: number;
};

function SettingsRow({ icon, title, onPress, rightElement, delay }: SettingsRowProps) {
  const style = useAnimatedEntry(delay, 'slideLeft');

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
          <Text style={styles.rowTitle}>{title}</Text>
        </View>
        {rightElement || (
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function LanguageToggle() {
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');

  return (
    <View style={styles.langToggle}>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'EN' && styles.langBtnActive]}
        onPress={() => setLang('EN')}
      >
        <Text style={[styles.langText, lang === 'EN' && styles.langTextActive]}>
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.langBtn, lang === 'UR' && styles.langBtnActive]}
        onPress={() => setLang('UR')}
      >
        <Text style={[styles.langText, lang === 'UR' && styles.langTextActive]}>
          UR
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const disclaimerStyle = useAnimatedEntry(500, 'fadeSlideUp');
  const signOutStyle = useAnimatedEntry(700, 'fadeSlideUp');
  const versionStyle = useAnimatedEntry(800, 'fadeIn');

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <SettingsRow
          icon="person-circle-outline"
          title="Account Settings"
          onPress={() => {}}
          delay={100}
        />
        <SettingsRow
          icon="notifications-outline"
          title="Notification Preferences"
          onPress={() => {}}
          delay={200}
        />

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <SettingsRow
          icon="globe-outline"
          title="Language"
          rightElement={<LanguageToggle />}
          delay={300}
        />

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          onPress={() => {}}
          delay={400}
        />

        <Animated.View style={[styles.disclaimer, disclaimerStyle]}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="medical" size={18} color={Colors.text} />
            <Text style={styles.disclaimerTitle}>MEDICAL DISCLAIMER</Text>
          </View>
          <Text style={styles.disclaimerText}>
            DawaLens is an AI-powered assistant designed for informational
            purposes only. It is not a substitute for professional medical
            advice, diagnosis, or treatment. Always seek the advice of your
            physician or other qualified health provider with any questions you
            may have regarding a medical condition. Never disregard professional
            medical advice or delay in seeking it because of something you have
            read on this app.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.signOutSection, signOutStyle]}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.version, versionStyle]}>
          DawaLens Version 2.4.0
        </Animated.Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 1,
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
    borderBottomColor: Colors.grayLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  rowTitle: {
    fontSize: Theme.fontSize.lg,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  langBtnActive: {
    backgroundColor: Colors.primary,
  },
  langText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.primary,
  },
  langTextActive: {
    color: Colors.white,
  },
  disclaimer: {
    margin: Theme.spacing.lg,
    backgroundColor: Colors.disclaimerBg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
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
    color: Colors.text,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.disclaimerText,
    lineHeight: 20,
  },
  signOutSection: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: Theme.borderRadius.full,
  },
  signOutText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: Theme.spacing.xxxl,
  },
});
