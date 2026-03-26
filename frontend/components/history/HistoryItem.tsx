import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { HistoryItem as HistoryItemType } from '@/types';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type HistoryItemProps = {
  item: HistoryItemType;
  index: number;
  onPress: () => void;
};

export default function HistoryItemCard({ item, index, onPress }: HistoryItemProps) {
  const style = useAnimatedEntry(300 + index * 100, 'slideLeft');

  return (
    <Animated.View style={style}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.image}>
          <Ionicons name="medkit" size={28} color={Colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.medicineName} {item.strength}
          </Text>
          <View style={styles.meta}>
            <Ionicons
              name={item.type === 'scanned' ? 'scan' : 'search'}
              size={14}
              color={item.type === 'scanned' ? Colors.primary : Colors.warning}
            />
            <Text
              style={[
                styles.type,
                { color: item.type === 'scanned' ? Colors.primary : Colors.warning },
              ]}
            >
              {item.type === 'scanned' ? 'Scanned' : 'Searched'}
            </Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  date: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginLeft: Theme.spacing.sm,
  },
});
