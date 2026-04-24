import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import TabBar from '@/components/common/TabBar';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { palette } = useAppSettings();

  const currentRoute = pathname === '/' ? 'index' : pathname.replace('/', '');

  const handleTabPress = (name: string) => {
    if (name === 'index') {
      router.replace('/(tabs)');
    } else {
      router.replace(`/(tabs)/${name}` as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <TabBar currentRoute={currentRoute} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
