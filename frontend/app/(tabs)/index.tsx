import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import ModuleTiles from '@/components/home/ModuleTiles';
import QuickActions from '@/components/home/QuickActions';
import HealthTipCard from '@/components/home/HealthTipCard';
import DisclaimerFooter from '@/components/home/DisclaimerFooter';
import { healthTips } from '@/data/medicines';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const headerStyle = useAnimatedEntry(0, 'fadeSlideUp');

  const quickActions = [
    {
      id: '1',
      title: 'Scan\nHistory',
      icon: 'document-text-outline' as const,
      onPress: () => router.push('/(tabs)/history'),
    },
    {
      id: '2',
      title: 'Health\nProfile',
      icon: 'heart-outline' as const,
      onPress: () => router.push('/(tabs)/profile'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Theme.spacing.lg }}
      >
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + Theme.spacing.md },
            headerStyle,
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.greetingBold}>
                Assalam-o-Alaikum,{'\n'}User
              </Text>
            </View>
          </View>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </Animated.View>

        <ModuleTiles
          onScanPress={() => router.push('/scan')}
          onSearchPress={() => router.push('/search')}
        />

        <QuickActions actions={quickActions} />
        <HealthTipCard text={healthTips[0].text} />
        <DisclaimerFooter />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  greetingBold: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
  },
});
