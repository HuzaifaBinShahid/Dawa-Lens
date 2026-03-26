import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import TabBar from '@/components/common/TabBar';
import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const currentRoute = pathname === '/' ? 'index' : pathname.replace('/', '');

  const handleTabPress = (name: string) => {
    if (name === 'scan') {
      router.push('/scan');
      return;
    }
    if (name === 'index') {
      router.replace('/(tabs)');
    } else {
      router.replace(`/(tabs)/${name}` as any);
    }
  };

  return (
    <View style={styles.container}>
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
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
});
